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





function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function getOpponent(myId,arr){
    if(arr[0]._id === myId){
        return arr[1]
    }
    return arr[0]
}
  

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

            await user.updateOne({_id : socket.request.session.userId},{$set : {socket_id : socket.id , is_online : true}})

            const newUser = await user.findOne({_id : socket.request.session.userId}).select('username')
            const allUsers = await user.find({is_online : true , _id : {$ne : socket.request.session.userId}}).select('username -_id')
            const activeUsers = await user.find({is_online : true,is_ingame : false , _id : {$ne : socket.request.session.userId}}).select('username socket_id')

            socket.emit('allUsers',allUsers);
            socket.broadcast.emit('newUser',newUser);

            if(activeUsers.length === 0){
                socket.emit('No users')
            }
            else{
                const opponent = getRandomElement(activeUsers)
                const { socket_id, ...opp_details } = opponent;
                const room = [newUser,opp_details]
                const newGame =  new game({room : room})
                const gameDetails = await newGame.save()
                
                message_opp = {
                    game_id : gameDetails._id,
                    opponent : newUser.username
                }
                message_new = {
                    game_id : gameDetails._id,
                    opponent : opponent.username
                }

                await user.updateOne(
                    { _id: newUser._id },
                    {
                      $set: { is_ingame: true, game: gameDetails },
                      $push: { gamesList: gameDetails._id }
                    }
                  );
                  await user.updateOne(
                    { _id: opponent._id },
                    {
                      $set: { is_ingame: true, game: gameDetails },
                      $push: { gamesList: gameDetails._id }
                    }
                  );
                socket.emit('Game',message_new)
                socket.to(opponent.socket_id).emit('Game',message_opp)

            }
            


        }
    }
    socket.on('won',async(data) => {
        await game.updateOne({_id : data._id},{$set : {winner : socket.request.session.userId}})
        await user.updateOne({_id : socket.request.session.userId},{$set : {is_ingame : false , game : null}});
    })
    socket.on('lost',async(data)=> {
        await user.updateOne({_id : socket.request.session.userId},{$set : {is_ingame : false , game : null}});
    })
    


    socket.on('disconnect',async() => {

        const leftUser = await user.findOne({_id : socket.request.session.userId, socket_id : socket.id}).select('username is_ingame game -_id')
        if(leftUser){

            if(leftUser.is_ingame){

                const opp = getOpponent(leftUser._id,leftUser.game.room)
                
                const opponent = await user.findOne({_id : opp._id}).select('username socket_id')               
                

                socket.to(opponent.socket_id).emit('opponent left',leftUser.game)

                await user.updateOne({_id : socket.request.session.userId},{$set : {socket_id : "" , is_online : false,is_ingame : false , game : null}});

            }
            else{
                await user.updateOne({_id : socket.request.session.userId},{$set : {socket_id : "" , is_online : false}});
                socket.broadcast.emit('leftUser',leftUser)
                console.log(leftUser.username , ' is disconncted ... 😖')
            }
            
        }
        else{
            console.log('An duplicate instance is closed !!!! with id : ',socket.request.session.userId,' and socket_id : ',socket.id)
        }


        


    })
})



server.listen(port,() => {
    console.log(`http://localhost:${port}`)
})