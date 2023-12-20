const express = require('express')
const app = express()

const session = require('express-session')

const http = require('http')
const server = http.createServer(app)

const socketio = require('socket.io')
const io = socketio(server)


const userRouter = require('./routes/userRouter')
require('./database/conn')
const path = require('path')
const {user,game,aval_user} = require('./models/user.model')


const port = 4000
const sessionMiddleware = session({
    name : 'user_sid',
    secret : process.env.SESSION_SECRET || 'user-secret',
    resave : false,
    saveUninitialized : false,
    cookie : {maxAge : 1000 * 60 * 60 * 24,secure:false,httpOnly:true}
})


// MiddleWares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,'/public')))
app.use(sessionMiddleware)
app.use('/',userRouter)
io.engine.use(sessionMiddleware)
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);



//socket.io

io.on('connection',async(socket)=>{
    if(socket.request.session.userId){

        const findUser = await user.findOne({_id : socket.request.session.userId})


        if(findUser.socket_id !== ""){
             // send message to that particular user that,, a instance is already running.....
            console.log('an instance is already running for this user')
            socket.emit('Sess-Error','An instance is already running')
        }
        else{
            console.log('New user : ',findUser.username);

            await user.updateOne({_id : socket.request.session.userId},{$set : {socket_id : socket.id , is_online : true}}).exec()

            const newUser = await user.findOne({_id : socket.request.session.userId}).select('username -_id')
            const allUsers = await user.find({is_online : true , _id : {$ne : socket.request.session.userId}}).select('username -_id')

            socket.emit('allUsers',allUsers);
            socket.broadcast.emit('newUser',newUser);
            

        }
    }
    


    socket.on('disconnect',async() => {

        const leftUser = await user.findOne({_id : socket.request.session.userId, socket_id : socket.id}).select('username -_id')
        if(leftUser){
            await user.updateOne({_id : socket.request.session.userId},{$set : {socket_id : "" , is_online : false}}).exec();
            socket.broadcast.emit('leftUser',leftUser)
            // socket.request.clearCookie('user_sid')
            console.log('A user is disconncted ... 😖')
            
        }
        else{
            console.log('An duplicate instance is closed !!!! with id : ',socket.request.session.userId,' and socket_id : ',socket.id)
        }


        


    })
})



server.listen(port,() => {
    console.log(`http://localhost:${port}`)
})