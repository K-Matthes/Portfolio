/*
    Author: Karly Matthes
    File Name: chattyBox.js
    Course: CSC 337, Summer 2021
    Description: Client-side file for site. This allows for the HTTP requests.
*/

function update() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                // Posts the text on the chat wall.
                let postMsg = document.getElementById('chatRoom');
                postMsg.innerHTML = httpRequest.responseText;
            }
            else {
                alert('ERROR');
            }
        }
    }
    let url = 'http://localhost:3000/chats';
    httpRequest.open('GET', url);
    httpRequest.send();
}

setInterval(update, 1000);

function sendMsg() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        return false;
    }

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log('msg added');
            }
            else {
                alert('Response Failure');
            }
        }
    }

    let name = document.getElementById('alias').value;
    let msg = document.getElementById('message').value;
    let url = 'http://localhost:3000/chats/post/' + name + '/' + msg;
    httpRequest.open('GET', url);
    httpRequest.send();
    // Clears 'message' text box after each message sent. 
    document.getElementById('message').value = "";
    update()
}



