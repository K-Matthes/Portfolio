/**
 * file: client.js
 * authors: Karly Matthes and Landon Krell
 * purpose: to implement client side functions for the moviePick
 * application. functions are used for a variety of reasons, mainly to
 * retrieve data from the server. functions are used across most html
 * files in the project
 */

/**
  Gets username from logged in user
*/
function getUsername() {
    var user = "";
    $.ajax({
        url: '/getUser',
        method: 'GET',
        success: (res) => {
            user = res;
        },
        error: () => {
            console.log('no username');
        }
    });
}

/**
* logs in a user based on their inputted fields of a user name and password. if the server
* finds their username and password valid, they will be logged in and taken to the home page.
*/
function login() {
 let u = $('#username');
 let p = $('#password');
 console.log('/login/' + u.val() + '/' + p.val());
 $.ajax({
     url: '/login/' + u.val() + '/' + p.val(),
     method: 'GET',
     success: (res) => {
         console.log(res);
         if(res == 'Oh no! Invalid Login.') {
             // if invalid login, display server response message below the input fields
             $('#loginMessage').text(res);
         } else {
             console.log('success')
             window.location = '/home.html';
         }
         u.val("");
         p.val("");
     },
     error: () => {
         $('#loginMessage').text('Error Communicating with Server');
     }
 });

}

/**
 * create a new user account. sends to the server the potential username
 * and password combination for a new account. if the  username is taken, a
 * message will be displayed on the index page. if it is succesful, a success message
 * will appear on the login page
 */
function create() {
      // retrieve users inputted username and password fields
      let u = $('#newUsername');
      let p = $('#newPassword');
      console.log('/create/' + u.val() + '/' + p.val());
      $.ajax({
          url: '/create/' + u.val() + '/' + p.val(),
          method: 'GET',
          success: (res) => {
              // display response message in the div below the create fields
              $('#createMsg').text(res);
              //empty out text fields
              u.val("");
              p.val("");
          },
          error: () => {
              // if the server gives an error back, show error message in div below
              // the create fields
              $('#createMsg').text('Error Communicating with Server');
          }
      });
}

/**
 * function called to add a post to the databaes of posts. retrieves elements
 * inputted by the user in order to add a specified post to the database.
 */
function addPost() {
    let title = $('#title');
    let rating = $('#rating');
    let image = $('#imgpath');
    let synopsis = $('#synopsis');
    let genre = $('#genre');
    let review = $('#review');
    //let likes = 0;
    let newPost = JSON.stringify({title: title.val(), rating: rating.val(), image: image.val(),
        synopsis: synopsis.val(), genre: genre.val(), likes: 0, review: review.val()});
    $.ajax({
        url: '/add/post',
        method: 'POST',
        data: {addPost: newPost} ,
        success: (res) => {
            alert('successfully added items');
        },
    });
    title.val("");
    rating.val("");
    synopsis.val("");
    genre.val("");
    review.val("");
    image.val("");

}


/**
 * called when the user wants to like a movie that is being displayed. On
 * the server end it increases the movies total likes and adds the movie
 * to the user's liked movies list.
 */
function like(movieName) {
    $.ajax({
        url: '/like/movie/' + movieName,
        method: 'GET',
        success: (res) => {
            $('#likeMsg').html(res + ' ' + movieName + '!');
        },
        error: () => {
            $('#likeMsg').html(res + ' ' + movieName + '!');
        }
    });
}

/**
 * function that allows a user to accept a friend request
 */
function acceptFriendRequest(fromUser) {
    $.ajax({
        url: '/add/friend',
        method: 'POST',
        data: {fromUser: fromUser},
        success: (res) => {
            //update friend requests
            getFriendRequests();
        },
        error: () => {
            // if the server gives an error back, show error message in div below
            // the create fields
            alert('Error Communicating with Server');
        }
    });
}

/**
 * called when a user opts to decline an incoming friend request
 * @param fromUser string name of the user the request is from
 */
function declineFriendRequest(fromUser) {

    $.ajax({
        url: '/del/fRequest',
        method: 'POST',
        data: JSON.stringify({fromUser: fromUser}),
        success: (res) => {
            //update friend requests
            getFriendRequests();
        }
    });
}

/**
 * function that retrieves a user's pending friend requests.server
 * responds with an html string that represents the users friend
 * requests.
 */
function getFriendRequests() {
    $.ajax({
        url: '/get/friendRequests/',
        method: 'GET',
        success: (res) => {
            // display response message in the div below the create fields
            $('#friendRequests').html(res);
            //empty out text fields

        },
        error: () => {
            // if the server gives an error back, show error message in div below
            // the create fields
            $('#friendRequests').text('Error Communicating with Server');
        }
    });
}

// ask for friend requests every 5 seconds
setInterval(getFriendRequests, 5000);

/**
 * function to be able to send a friend request to another user.
 * generates a friend request document on the server side.
 */
function sendFriendRequest() {
    console.log('sending Friend request');
    console.log('/send/friendRequest/' + $('#sender').val());
    $.ajax({
        url: '/send/friendRequest/' + $('#sender').val() ,
        method: 'GET',
        success: (res) => {
            // display response message in the div below the create fields
            console.log(res);
            if(res == 'DNE') {
                $('#sendRes').text('Unfortunately, the user you requested is not a member of MoviePick :(')
            } else {
                $('#sendRes').text(res);
            }
        },
        error: () => {
            // if the server gives an error back, show error message in div below
            // the create fields
            console.log('error');
            $('#sendRes').text('Error Communicating with Server');
        }
    });
}

/**
 * function to retrieve users friends. server responds
 * with an html string that displays each friend on the users
 * friends list
 */

function getFriends() {
    $.ajax({
        url: '/get/friends',
        method: 'GET',
        success: (res) => {
            // display response message in the div below the create fields
            $('#friendsList').html(res);
            //empty out text fields

        },
        error: () => {
            // if the server gives an error back, show error message in div below
            // the create fields
            $('#friendsList').text('Error Communicating with Server');
        }
    });
}

// ask for the users friends list every 5 seconds
setInterval(getFriends, 5000);

/**
 * called when the match page is loaded. calls functions
 * to set up the html page such as pendign friend requests,
 * a friends list, and the match page header
 */
function initialize() {
    matchHeader();
    getFriends();
    getFriendRequests();
}

/**
 * the header displayed on the match page requires having the useranme
 * retrieved from the cookie. This asks the server for that username
 * and displays it on the page
 */
function matchHeader() {
    $.ajax({
        url: '/getUser',
        method: 'GET',
        success: (res) => {
            console.log(res);
            $('#matchHead').text('Welcome to MoviePick: Social,  ' + res);
        },
        error: () => {
            console.log('error communicating with server');
        }
    });
}

/**
 * the header displayed on the home page requires having the useranme
 * retrieved from the cookie. This asks the server for that username
 * and displays it on the page
 */
function homeHeader() {
    $.ajax({
        url: '/getUser',
        method: 'GET',
        success: (res) => {
            console.log(res);
            $('#header').text('Welcome to MoviePick, ' + res + '!');
        },
        error: () => {
            console.log('error communicating with server');
        }
    });
}

/**
 * retrieves matched movies between a user and one of
 * their specified friends. server replies with an html
 * string that is displayed for the user on the match page.
 */
function getMatches() {
    let matchWith = $('#matcher').val();
    console.log('/get/matches/' + matchWith);
    $.ajax({
        url: '/get/matches/' + matchWith,
        method: 'GET',
        success: (res) => {
            $('#matchDisp').html(res);
        },
        error: () => {
            $('#matchDisp').html('error communicating with server');
        }
    });
}

/**
 * function that retrieves some movies for the user to
 * like. server responds with an html string that is
 * displayed for the user on the home page
 */
function getMovies() {
    $.ajax({
        url: '/get/movies',
        method: 'GET',
        success: (res) => {
            $('#mcolumn').html(res);
        },
        error: () => {
            $('#mcolumn').html('error communicating with server');
        }
    });
}


