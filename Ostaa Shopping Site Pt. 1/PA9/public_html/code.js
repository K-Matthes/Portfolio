/*
    Author: Karly Matthes
    Couse: CSC 337, Summer 2021
    File Name: code.js
    Description: Client-side of Ostaa site. It allows for the information
    to be requested and sent to the server using JSON and AJAX.
*/

function addUser() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                alert('Successfully added user!')
            }
            else {
                alert('ERROR');
            }
        }
    }
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;
    let url = 'http://localhost:3000/add/user/';
    let addUser = {username: user, password: pass};
    let addUser_str = JSON.stringify(addUser);
    let params = 'addUser=' + addUser_str;
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpRequest.send(params);
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
}

function addItems() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                alert('Successfully added items!')
            }
            else {
                alert('ERROR');
            }
        }
    }
    let title = document.getElementById('title').value;
    let desc = document.getElementById('desc').value;
    let image = document.getElementById('image').value;
    let price = document.getElementById('price').value;
    let stat = document.getElementById('stat').value;
    let user = document.getElementById('username2').value;
    let url = 'http://localhost:3000/add/item/' + user;
    let addItem = {title: title, description: desc, image: image,
        price: price, status: stat, user: user};
    let addItem_str = JSON.stringify(addItem);
    let params = 'addItem=' + addItem_str;
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpRequest.send(params);

    document.getElementById('title').value = "";
    document.getElementById('desc').value = "";
    document.getElementById('image').value = "";
    document.getElementById('price').value = "";
    document.getElementById('stat').value = "";
    document.getElementById('username2').value = "";
}