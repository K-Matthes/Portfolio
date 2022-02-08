/*
  Author: Karly Matthes
  File Name: code.js
  Course: CSC 337, Summer 2021
  Description: Client-side of Ostaa
*/

/*
  Gets username so that the program remembers who is logged in
  in order for this user to see their puchases and listings. 
*/
var user = "";
var httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = () => {
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
        user = httpRequest.responseText; 
    } 
    else { 
        console.log('no username'); 
    }
  }
}

httpRequest.open('GET', '/getUser', true);
httpRequest.send();

/*
  Called from the login button on the index.html page. Allows 
  for the user to login if credentials match. If the user does
  not exist, they will not have access to the site. 
*/
function login() {
    var httpRequest = new XMLHttpRequest();
    
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;
  
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          if (httpRequest.responseText == 'This account does not exist') {
              window.alert('This account does not exist');
          } else {
            let url = '/home.html';
            window.location = url;
          }       
        } else { 
            alert('ERROR'); }
      }
    }
  
    httpRequest.open('GET', '/login/' + user + '/' + pass);
    httpRequest.send();

    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
  }
  
/*
  Called from the Create Account button, and allows for the user
  to create a new account by sending their username and password 
  to the database. 
*/
function create() {
    var httpRequest = new XMLHttpRequest();

    let u = document.getElementById('newUsername').value;
    let p = document.getElementById('newPassword').value;
  
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          alert(httpRequest.responseText);
        } 
        else { 
            alert('ERROR'); 
        }
      }
    }

    httpRequest.open('GET', '/create/' + u + '/' + p, true);
    httpRequest.send();

    document.getElementById('newUsername').value = "";
    document.getElementById('newPassword').value = "";
}

/*
  Called by the Add item button. Adds a new item to the 
  database by providing information such as title, description,
  image, price, status and the user who posted the listing. 
*/
function addItems() {
    let title = document.getElementById('title').value;
    let desc = document.getElementById('desc').value;
    let image = document.getElementById('image').value;
    let price = document.getElementById('price').value;
    let stat = document.getElementById('stat').value;
    let user = document.getElementById('username2').value;

    var httpRequest = new XMLHttpRequest();

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
    let url = '/add/item/' + user;
    let addItem = {title: title, description: desc, image: image,
        price: price, status: stat, user: user};
    let addItem_str = JSON.stringify(addItem);
    let params = 'addItem=' + addItem_str;
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpRequest.send(params);
}

/*
  Called from the view listings button. Prints the HTML of the listing
  onto the screen. 
*/
function viewLists() {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
          console.log(httpRequest.responseText);
          let postList = document.getElementById('right');
          postList.innerHTML = httpRequest.responseText;
        } 
        else { 
          alert('ERROR'); 
        }
      }
    }

    httpRequest.open('GET', '/get/listings/' + user, true);
    httpRequest.send();

}

/*
  Called from the view purchases button. Prints the HTML of the purchases
  onto the screen. 
*/
function viewPurch() {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
          console.log(httpRequest.responseText);
          let postList = document.getElementById('right');
          postList.innerHTML = httpRequest.responseText;
      } 
      else { 
          alert('ERROR'); 
      }
    }
  }

  httpRequest.open('GET', '/get/purchases/' + user, true);
  httpRequest.send();
}

/*
  Called from the search by listings button. Prints the HTML of the purchases
  items with the keywords provided by the textbox in their descriptions. 
*/
function search() {
  let keyword = document.getElementById('searchBy').value;
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
          console.log(httpRequest.responseText);
          let postList = document.getElementById('right');
          postList.innerHTML = httpRequest.responseText;
      } 
      else { 
          alert('ERROR'); 
      }
    }
  }

  httpRequest.open('GET', '/search/items/' + keyword, true);
  httpRequest.send();
}

/*
  Allows for the status of the listing to be changed from SALE to 
  SOLD after clicking buy now
*/
function status() {
  let title = document.getElementById('title').value;
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
          console.log('success');
      } 
      else { 
          console.log('ERROR'); 
      }
    }
  }

  httpRequest.open('GET', '/change/' + title, true);
  httpRequest.send();
}
