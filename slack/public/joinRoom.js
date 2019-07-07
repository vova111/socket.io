function joinRoom(roomName) {
    nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
        document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
    });

    nsSocket.on('historyCatchUp', (history) => {
        const messagesUl = document.querySelector('#messages');
        messagesUl.innerHTML = '';
        history.forEach((msg) => {
            const newMsg = buildHtml(msg);
            const currentMessages = messagesUl.innerHTML;
            messagesUl.innerHTML =  currentMessages + newMsg;
        });
    });

    nsSocket.on('updateMembers', (numMembers) => {
        document.querySelector('.curr-room-num-users').innerHTML = `${numMembers} <span class="glyphicon glyphicon-user"></span>`;
        document.querySelector('.curr-room-text').innerText = roomName;
    });

    let searchBox = document.querySelector('#search-box');
    searchBox.addEventListener('input', (e) => {
        document.querySelectorAll('.message-text').forEach((msg) => {
            if (msg.innerHTML.indexOf(e.target.value) === -1) {
                msg.style.display = 'none';
            } else {
                msg.style.display = 'block';
            }
        });
    });
}