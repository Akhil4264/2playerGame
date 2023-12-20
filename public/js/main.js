const users_list = document.querySelector('.users-list')
const start_game = document.querySelector('.start-game')


const socket = io();


socket.on('Sess-Error',(data) => {
    window.location.replace("http://localhost:4000/sess-error")
    console.log(data)
})

socket.on('newUser',(data) => {
    console.log('new user : ', data)
    el = document.createElement('li')
    el.innerText = data.username
    el.id = data.username
    el.onclick = `challenge(${data.username})`
    users_list.appendChild(el)

})

socket.on('allUsers',(data) => {
    console.log('list of all users : ',data)
    data.forEach(element => {
        el = document.createElement('li')
        el.innerText = element.username
        el.id = element.username
        el.onclick = `challenge(${element.username})`
        users_list.appendChild(el)
    });
})

socket.on('leftUser',(data) => {
    console.log('user left : ',data)
    const ele = document.getElementById(data.username)
    console.log(ele)
    if(ele) users_list.removeChild(ele);
})

socket.on('No users',() => {
    console.log('no users')
})


socket.on('Game',(data) => {
    console.log('a game started between u and ',data.opponent)
    start_game.style.display = 'grid'
})

socket.on('opponent left',(game) => {

    console.log('opponent left , you won !!!!')
    won(game)
})


function won(data){
    // send if the current user won the game
    console.log('submitting your success')
    socket.emit('won',data)
    start_game.style.display = 'none'
}

function lost(data){
    socket.emit('lost',data)
    start_game.style.display = 'none'
}



