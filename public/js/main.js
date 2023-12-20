const users_list = document.querySelector('.users-list')



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
    users_list.appendChild(el)

})
socket.on('allUsers',(data) => {
    console.log('list of all users : ',data)
    data.forEach(element => {
        el = document.createElement('li')
        el.innerText = element.username
        el.id = data.username
        users_list.appendChild(el)
    });
})
socket.on('leftUser',(data) => {
    console.log('user left : ',data)
    const ele = document.getElementById(data.username)
    ele.parentNode.removeChild(ele)
    // users_list.removeChild(ele)
})




