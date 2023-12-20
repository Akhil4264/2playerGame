const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    startedAt : {
        type:Date,
        required : true
    },
    endedAt : {
        type : Date,
        required : true
    },
    players : {
        type : Array,
        required : true
    },
    winner : {
        type:String,
        default : null
    }
})

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
    },
    Email : {
        type : String,
        required : true 
    },
    Mobile : {
        type : Number,
        required : true 
    },
    Password : {
        type : String,
        required : true
    },
    is_online : {
        type:Boolean,
        default : false
    },
    socket_id : {
        type:String,
        default : ""
    },
    gamesList : {
        type : Array(String),
    }
    
})

const ava_user = new mongoose.Schema({
    user_id : {
        type : String,
        required : true
    },
    socket_id : {
        type : String,
        required : true
    }
})


const user = mongoose.model('user',userSchema)

const game = mongoose.model('game',gameSchema)

const aval_user = mongoose.model('avaliable_users',ava_user)


module.exports = {
    user,
    game,
    aval_user
}
