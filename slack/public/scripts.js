const username = prompt('what is your username');
// const socket = io('http://localhost:9000');
const socket = io('http://localhost:9000', {
    query: {
        username
    }
});
let nsSocket = '';

socket.on('nsList', (nsData) => {
    let namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = '';
    nsData.forEach((ns) => {
        namespacesDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.img}"></div>`;
    });

    document.querySelectorAll('.namespace').forEach((elem) => {
        elem.addEventListener('click', (e) => {
            const nsEndpoint = e.currentTarget.getAttribute('ns');
            joinNs(nsEndpoint);
        });
    });

    joinNs('/wiki');
});