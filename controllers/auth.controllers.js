var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
const config = require('../config/auth.config')

const User = require('../models/user')
const VerifyEmailToken = require('../models/verifyEmailToken')
const ResetPasswordToken = require('../models/resetPasswordToken')
const crypto = require("crypto");

const nodemailer = require('nodemailer')

const nodeMailerUser = process.env.EMAIL;
const nodeMailerPass = process.env.PASS;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure:true,
  auth: {
    user: nodeMailerUser,
    pass: nodeMailerPass,
  },
});


exports.signup = async (req, res) => {
  try {
    const { name, password, email } = req.body
    //validation
    const passwordRegEx = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
    const emailRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!passwordRegEx.test(password)) {
      return res.status(500).send({ message: "ERROR_INVAILD_DATA" })
    }

    if (!emailRegEx.test(email)) {
      return res.status(500).send({ message: "ERROR_INVAILD_DATA" })
    }

    //new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    })

    // handle errors
    let token = crypto.randomBytes(20).toString("hex");
    let userId = user._id;
    await new VerifyEmailToken({
      userId: userId,
      token: token,
      email: req.body.email
    }).save();
    let url = `http://localhost:8000/api/auth/verifyEmail/${token}/${userId}`
    let data = [req.body.email]
    var mainOptions = {
      from: nodeMailerUser,
      to: data,
      subject: "Verify your email for your account",
      html: `<h1>Please click the given link to verify your email: </h1><a href=${url}>${url}</a>`
    };
    transporter.sendMail(mainOptions, async (err, info) => {
      if (err) {
        console.log(err)
        return res.status(500).send({ message: "ERROR_SENDING_EMAIL" })
      }

    })

    await user.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err })
        return
      }

      res.send({ message: 'Please verify your email.' })
    })


  }
  catch (error) {
    return res.status(500).send({ message: error })
  }
}

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .populate('-__v')
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err })
        return
      }

      if (!user) {
        return res.status(500).send({ message: "ERROR_USER_NOT_FOUND" })
      }
      if (!user.isConfirmed) {
        return res.status(500).send({ message: "ERROR_EMAIL_NOT_VERIFIED" })
      }

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password)

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: 'ERROR_INVAILD_PASSWORD',
        })
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      })

      res.status(200).send({
        id: user._id,
        name: user.name,
        email: user.email,
        accessToken: token,
      })
    })
}

exports.verifyEmail = async (req, res) => {
  try {
    const { userId, token } = req.params
    const dataToken = await VerifyEmailToken.findOne({ userId: userId, token: token });
    if (!dataToken) return res.status(500).send({ message: "ERROR_NOT_FOUND" })
    await User.updateOne(
      { _id: req.params.userId },
      { $set: { email: dataToken.email, isConfirmed: true } },
      { new: true }
      , (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully updated.");
        }
      });

    await dataToken.deleteOne()
    return res.redirect('http://localhost:3000/login?verified=true')
  }
  catch (err) {
    return res.status(500).send({ message: err })
  }
}

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body
    const emailRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!emailRegEx.test(email)) {
      return res.status(500).send({ message: "ERROR_INVAILD_DATA" })
    }


    const user = await User.findOne({ email })
    if (!user) return res.status(500).send({ message: "USER_DOES_NOT_EXISTS" })

    let token = await ResetPasswordToken.findOne({ userId: user._id });
    if (token) await token.deleteOne(); // if a token already exists then delete it

    let resetToken = crypto.randomBytes(20).toString("hex");

    await new ResetPasswordToken({
      userId: user._id,
      token: resetToken
    }).save();

    const url = `http://localhost:3000/resetPassword/${resetToken}/${user._id}`

    let data = email
    var mainOptions = {
      from: nodeMailerUser,
      to: data,
      subject: "Reset password link for your account",
      html: `<h1>Please click the given link to reset password: </h1><a href=${url}>${url}</a>`
    };
    await transporter.sendMail(mainOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err })
      }
    })
    return res.status(200).send({ message: "Reset link has been mailed to you." })
  }
  catch (err) {
    return res.status(500).send({ message: err })
  }
}

exports.verifyLink = async (req, res) => {
  try {
    const { resetToken, userId } = req.params
    const token = await ResetPasswordToken.findOne({ userId: userId, token: resetToken })

    if (!token) return res.status(500).send({ message: "ERROR_NOT_A_VALID_LINK" })

    return res.status(200).send({ message: "link verified." })
  }
  catch (err) {
    return res.status(500).send({ message: err })
  }

}


exports.resetPassword = async (req, res) => {
  try {

    const { password } = req.body
    const { resetToken, userId } = req.params

    //validation
    const passwordRegEx = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
    if (!passwordRegEx.test(password)) {
      return res.status(500).send({ message: "ERROR_INVAILD_DATA" })
    }

    const token = await ResetPasswordToken.findOne({ token: resetToken })
    console.log(token)
    if (!token) return res.status(500).send({ message: "some error" })
    await token.deleteOne();

    await User.updateOne(
      { _id: userId },
      { $set: { password: bcrypt.hashSync(password, 8) } },
      { new: true }
      , function (err) {
        if (err) {
          return res.status(500).send({ message: err })
        } else {
          console.log("Successfully updated.");
        }
      });

    return res.status(200).send({ message: "password reset successful" })
  }
  catch (err) {
    return res.status(500).send({ message: err })
  }
}