var mongoose = require('mongoose')
var Schema = mongoose.Schema

// contains email , token created , userId
var VerifyEmailTokenSchema = new Schema({
    userId:{
        type:String,
        default:null
    } ,
    email: {
        type:String,
        default:null
    },
    token:{
        type: String,
        default:null
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
      },

})

module.exports = mongoose.model('VerifyEmailToken', VerifyEmailTokenSchema)
