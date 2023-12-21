const users_list = document.querySelector('.users-list')
const start_game = document.querySelector('.start-game')
let gameDetails= {}
let your_turn = false

const socket = io();


socket.on('Sess-Error',(data) => {
    window.location.replace("http://localhost:4000/sess-error")
})

socket.on('newUser',(data) => {
    el = document.createElement('li')
    el.innerText = data.username
    el.id = data.username
    el.onclick = `challenge(${data.username})`
    users_list.appendChild(el)

})

socket.on('allUsers',(data) => {
    data.forEach(element => {
        el = document.createElement('li')
        el.innerText = element.username
        el.id = element.username
        el.onclick = `challenge(${element.username})`
        users_list.appendChild(el)
    });
})

socket.on('leftUser',(data) => {
    const ele = document.getElementById(data.username)
    if(ele) users_list.removeChild(ele);
})

socket.on('No users',() => {
    console.log('no users')
})


socket.on('Game',(data) => {
    start_game.style.display = 'grid'
    your_turn = data.your_turn
    gameDetails = data

})

socket.on('opponent left',(game) => {

    console.log('opponent left , you won !!!!')
    won(game)
})


function won(data){
    // send if the current user won the game
    socket.emit('won',data)
    start_game.style.display = 'none'
}

function lost(data){
    socket.emit('lost',data)
    start_game.style.display = 'none'
}




// game logics


let gameover = false
const boxes = document.querySelectorAll(".box")
const reset = document.querySelector(".reset")
reset.style.display = "none"


boxes.forEach((box)=>{
    box.addEventListener("click",()=>{
        if(box.innerHTML == "" && !gameover && your_turn){
            let index = Array.prototype.indexOf.call(boxes, box);
            box.innerHTML = "X"
            const myMove = {...gameDetails , opp_choice : index }
            socket.emit('myMove',myMove)
            your_turn = false
            checkwin(index)

        }
    })
})

function Reset(){
    boxes.forEach((box)=>{
        box.innerHTML = ""
    })
    if(start == "X"){
        start = "0"
        turn = "0"
    }
    else{
        start = "X"
        turn = "X"
    }
    reset.style.display = "none"
    gameover = false
}

const checkwin = (index) =>{
    win = {
        0 : [[0,1,2],[0,3,6],[0,4,8]],
        1 : [[0,1,2],[1,4,7]],
        2 : [[0,1,2],[2,5,8],[2,4,6]],
        3 : [[0,3,6],[3,4,5]],
        4 : [[3,4,5],[1,4,7],[0,4,8],[2,4,6]],
        5 : [[2,5,8],[3,4,5]],
        6 : [[0,3,6],[6,7,8],[2,4,6]],
        7 : [[1,4,7],[6,7,8]],
        8 : [[2,5,8],[6,7,8],[0,4,8]]
    }
    win[index].forEach((check)=>{
        if(boxes[check[0]].innerHTML === boxes[check[1]].innerHTML && boxes[check[1]].innerHTML === boxes[check[2]].innerHTML && boxes[check[0]].innerHTML !=""){
            winner = boxes[check[0]].innerHTML  
            gameover = true              
            // await blink(boxes[check[0]],winner)
            // await blink(boxes[check[1]],winner)
            // await blink(boxes[check[2]],winner)
            reset.style.display = "grid"
            if(boxes[check[0]].innerHTML === "X"){
                won(gameDetails)
            }
            else{
                lost(gameDetails)
            }
            return ;
        }
    })
}

const blink =(element,winner)=>{
    let x = 0
    var intervalId =setInterval(function() {
        element.innerHTML = (element.innerHTML == '' ? winner : '');
        x++;
        if(x === 6){
            window.clearInterval(intervalId)
        }
    }, 100);
}


socket.on('opponent move',(data) => {
    boxes[data.opp_choice].innerHTML = "0"
    your_turn = true
    checkwin(data.opp_choice)
})


