const router = require('express').Router()
const { dirname } = require('path')
const path = require('path')
const {user,game,aval_user} = require('../models/user.model')
const bcrypt = require('bcryptjs')




const redirectHome = async(req,res,next) =>{
    if(req.session.userId){
        const findUser = await user.find({_id : req.session.userId})
        if(findUser.is_online){
            res.redirect('/sess-error')
        }
        else{
            res.redirect('/home')
        }
    }
    else{
        next()
    }
}

const redirectLogin = (req,res,next) => {
    if(!req.session.userId){
        res.redirect('/login')
    }
    else{
        next()
    }


}



router.get('/',redirectHome,(req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','index.html'))
})

router.get('/register',redirectHome,(req,res) => {
    res.sendFile(path.join(__dirname,'..','views','register.html'))
})

router.get('/login',redirectHome,(req,res) => {
    res.sendFile(path.join(__dirname,'..','views','login.html'))
})

router.get('/home',redirectLogin,async(req,res)=>{
    // res.sendFile(path.join(__dirname,'..','views','home.html'))
    const findUser = await user.findOne({_id : req.session.userId}).select('username -_id')
    res.render(path.join(__dirname,'..','views','home.ejs'),{user : findUser})
})

router.get('/sess-error',(req,res) => {
    res.send('<h2>A session already exists for the user</h2>')
})


router.post("/login",redirectHome,async(req,res)=>{ 

    const query = {
        $or: [
          { username: req.body.email },
          { Email: req.body.email },
        ]
    };
    let loggeduser;

    try{
        loggeduser = await user.findOne(query)
    }
    catch(e){
        console.log('Error while finding user')
        return res.sendStatus(400)
    }
    
    if(loggeduser){
        await bcrypt.compare(req.body.password,loggeduser.Password,async(err,resp)=>{
            if(err) {
                return res.sendStatus(400)
            }
            if(resp){

                if(loggeduser.socket_id === ""){

                    req.session.userId = loggeduser.id
                    
                    return res.sendStatus(200)                
                }
                else{
                    return res.sendStatus(409)
                }
            }
            else{
                return res.sendStatus(401)                
            } 
        })
        
    }
    else{
        return res.sendStatus(400)
    }
    
})


router.post("/register",redirectHome,async(req,res)=>{

    
    const checkaval_email = await user.findOne({Email : req.body.email});
    const checkaval_user = await user.findOne({username : req.body.username});
    const checkaval_mobile = await user.findOne({Mobile : req.body.mobile});

    if(checkaval_email){
        res.status(409).json("Email already exists");
    }
    else if(checkaval_user){
        res.status(409).json("username already exists");
    }
    else if(checkaval_mobile){
        res.status(409).json("Mobile number already exists");
    }
    else{
        try{
            const salt = await bcrypt.genSalt();
            const hashedPass = await bcrypt.hash(req.body.password,salt);
            const newUser = await new user({username : req.body.username , Email : req.body.email,Password : hashedPass,Mobile : req.body.mobile});
            await newUser.save();
            req.session.userId = newUser.id
            res.sendStatus(200)
            
        }
        catch(err){
            res.status(400).send(err);
        }
        
    }
   
    
})

router.post('/logout',redirectLogin,(req,res)=>{

    req.session.destroy(err => {
        if(err){
            return res.redirect('/home')
        }
        
        res.clearCookie('user_sid')
        res.redirect('/')
    })

})





router.get('/home/inbox',redirectLogin,(req,res)=>{
    res.send("hello!!!!!")
})












module.exports = router