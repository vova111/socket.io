function joinNs(endpoint) {
    if (nsSocket) {
        nsSocket.close();

        document.querySelector('#user-input').removeEventListener('submit', formSubmission);
    }

    nsSocket = io(`http://localhost:9000${endpoint}`);

    nsSocket.on('nsRoomLoad', (nsRooms) => {
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = '';
        nsRooms.forEach((room) => {
            const glpyh = room.privateRoom ? 'lock' : 'globe';
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glpyh}"></span>${room.roomTitle}</li>`;
        });

        document.querySelectorAll('.room').forEach((elem) => {
            elem.addEventListener('click', (e) => {
                // console.log(e.currentTarget);
                joinRoom(e.currentTarget.innerText);
            });
        });

        const topRoom = document.querySelector('.room');
        const topRoomName = topRoom.innerText;

        joinRoom(topRoomName);
    });

    nsSocket.on('messageToClients', (msg) => {
        const newMsg = buildHtml(msg);
        document.querySelector('#messages').innerHTML = newMsg;
    });

    document.querySelector('.message-form').addEventListener('submit', formSubmission);
}

function formSubmission(event) {
    event.preventDefault();
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer', {
        text: newMessage
    });
}

function buildHtml(msg) {
    const convertedDate = new Date(msg.time).toLocaleString();
    const newHtml = `
        <li>
            <div class="user-image">
                <img src="${msg.avatar}" />
            </div>
            <div class="user-message">
                <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
                <div class="message-text">${msg.text}</div>
            </div>
        </li>
    `;

    return newHtml;
}