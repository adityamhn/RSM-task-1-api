const router = require('express').Router()
var express = require('express')
const { verifySignUp } = require('../middlewares')
const controller = require('../controllers/auth.controllers')


router.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    )
    next()
  })

  router.post(
    '/signup',
    [verifySignUp.checkDuplicateEmail],
    controller.signup,
  )

  router.post('/signin', controller.signin)

  router.get('/verifyEmail/:token/:userId' ,controller.verifyEmail)

  router.post('/forgetPassword',controller.forgetPassword)

  router.get('/forgetPassword/verifyLink/:resetToken/:userId',controller.verifyLink)

  router.post('/forgetPassword/verifyLink/:resetToken/:userId',controller.resetPassword)


module.exports = router

// router.post('/register', async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(req.body.password, salt)

//         const user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             password: hashedPassword,
//         })

//         const result = await user.save()

//         const { password, ...data } = await result.toJSON()

//         res.send(data)

//     } catch (err) {
//         console.log(err)
//     }

// })

// router.post('/login', async (req, res) => {
//     const user = await User.findOne({ email: req.body.email })

//     try {
        
//     if (!user) {
//         return res.status(404).send({ message: 'User not found' })
//     }

//     if (!await bcrypt.compare(req.body.password, user.password)) {
//         return res.status(404).send({ message: 'Invalid credentials' })
//     }

//     const token = jwt.sign({ _id: user._id }, "secret")

//     res.cookie('jwt', token, {
//         httpOnly: true,
//         maxAge: 24 * 60 * 60 * 1000
//     })

//     res.send({
//         message:'sucess'
//     })

//     } catch (err) {
//         console.log(err)
//     }

// })

// router.get('/user',async(req,res) => {
//     try {

//         const cookie = req.cookies['jwt']

//     const claims = jwt.verify(cookie,'secret')

//     if (!claims) {
//         return res.status(401).send({message:'UnAuthenticated'})
//     }

//     const user = await User.findOne({_id:claims._id})

//     const {password,...data} = await user.toJSON()

//     res.send(data)
    
//     } catch(err) {
//         return res.status(401).send({message:'UnAuthenticated'})
//     }
    

// })

// router.post('/logout',async(req,res) => {

//    await res.cookie('jwt','',{
//         maxAge:0
//     })

//     res.send({message: 'logout success'})
// })


// module.exports = router;