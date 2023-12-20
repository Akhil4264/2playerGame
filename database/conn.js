const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/tictactoe')
.then(() => {
    console.log('connection to database is established')
})
.catch((e) => {
    throw e
})


