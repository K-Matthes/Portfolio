/**
 * file: server.js
 * authors: Karly Matthes and Landon Krell
 * purpose: to represent the server-side functions for the
 * moviePick application. allows clients to request the server
 * for data regarding users, movies, and friend requests and responds
 * according to the purpose of the request.
 */

/*
included modules
 */
const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});
const app = express();

app.use(cookieParser());
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/movie';

var sessionKeys = {};
const iterations = 1000;

/**
 * keeps the current list of sessions up to date. if a session's key
 * is older than the cookies max life, delete the session from the
 * session keys.
 */
function updateSession() {
    let now = Date.now();
    for (e in sessionKeys) {
        if (sessionKeys[e][1] < (now - 600000)) {
            delete sessionKeys[e];
        }
    }
}

setInterval(updateSession, 3000);

var Schema = mongoose.Schema;

// MOVIE SCHEMA
var MovieSchema = new Schema({
 title: String,
 rating: String,
 image: String,
 synopsis: String,
 genre: String,
 likes: Number,
 review: String
});
var Movie = mongoose.model('Movie', MovieSchema);

// USER SCHEMA
var UserSchema = new Schema({
 username: String,
 salt: String,
 hash: String,
 likedMovies: [{type: Schema.Types.ObjectID, ref: 'Movie'}],
 friendsList: [{type: Schema.Types.ObjectID, ref: 'User'}],
});

var FrequestSchema = new Schema({
    to: {type: Schema.Types.ObjectID, ref: 'User' },
    from: {type: Schema.Types.ObjectID, ref: 'User' }
});

var frequest = mongoose.model('frequest', FrequestSchema);

var User = mongoose.model('User', UserSchema);

mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error'));

/**
 * function that authenticates a valid user. ensures their stored
 * session key is equal to their current cookie's key. keys are updated
 * in updateSessions.
 * @param req
 * @param res
 * @param next
 */
function authorize(req, res, next) {
    if(req.cookies === undefined) {
        res.redirect('/index.html')
    } else if(req.cookies.login === undefined) {
        res.redirect('/index.html')
    }

    if (Object.keys(req.cookies).length > 0) {
          let u = req.cookies.login.username;
          let key = req.cookies.login.key;
          if ( Object.keys(sessionKeys[u]).length > 0 && sessionKeys[u][0] == key) {
            next();
          } else {
              res.redirect('/index.html');
          }
    } else {
        //if the user does not have a valid cookie, send them back to the login page.
        res.redirect('/index.html');
    }
}

app.use('/home.html', authorize);
app.use('/create.html', authorize);
app.use('/match.html', authorize);
app.use('/', express.static('public_html'));

/**
 * Remembers who is logged in so their data can be retrieved.
*/
app.get('/getUser', (req, res) => {
    res.send(req.cookies.login.username);
});

/**
 * validates that a user is logged in based on the provided info. if the
 * information is correct the user gets redirected to the home page
 * and is given a cookie, and a valid session is started with them. If the
 * information is incorrect then a messgage is returned that the login was
 * unsucessful.
 */
app.get('/login/:username/:password', (req, res) => {
     let u = req.params.username;
     User.find({username: u})
     .exec(function(error, results) {
         if (results.length == 1) {
            let p = req.params.password;
            var salt = results[0].salt;
            crypto.pbkdf2(p, salt, iterations, 64, 'sha512', (err, hash) => {
                if (err) throw err;
                let hashStr = hash.toString('base64');
                if (results[0].hash == hashStr) {
                    let sessionKey = Math.floor(Math.random() * 1000);
                    sessionKeys[u] = [sessionKey, Date.now()];
                    res.cookie("login", {username: u, key: sessionKey}, {maxAge: 600000});
                    res.send('OK');
                }
                else {
                    res.send('Oh no! Invalid Login.');
                }
            });
         }
         else{
            res.send('Oh no! Invalid Login.');
         }
     });
});

/**
 * get request to create a new user. if the username is already taken,
 * do not create/save new account and respond that the username is taken.
 * if username is free, save the new account to the db.
 */
app.get('/create/:username/:password', (req, res) => {
    let u = req.params.username;
    let p = req.params.password;
    User.find({username: u})
    .exec(function(error, results) {
         if (results.length == 0) {
            var salt = crypto.randomBytes(64).toString('base64');
            crypto.pbkdf2(p, salt, iterations, 64, 'sha512', (err, hash) => {
                if (err) throw err;
                let hashStr = hash.toString('base64');
                var account = new User({'username' : u, 'salt': salt, 'hash': hashStr});
                account.save(function (err) { if (err) console.log('an error occured saving the account'); });
                res.send('Account successfully created!');
            });
        }
         else {
             res.send('It looks like this username is already taken!');
        }
    })
});

/**
 * path that adds a post to the database scheme. when a user creates a uploads
 * a movie, this path is called.
 */
app.post('/add/post', (req, res) => {
    var add = JSON.parse(req.body.addPost);
    var newPost = new Movie(add);
    newPost.save(function(err) { if (err) console.log('an error occurred.'); });
    res.send('success');

});

/**
 * function for receiving an image file upload
 */
app.post('/upload', upload.single('photo'), (req, res) => {
    res.redirect('home.html');
});


/**
 * a get path to be able to send a friend request to another user. first ensures
 * that both users exist. if both users do exist, creates a friend request document
 * and saves it to the db.
 */
app.get('/send/friendRequest/:user', (req,res) => {
    let toUser = req.params.user;
    let fromUser = req.cookies.login.username; // get sender username from cookie
    // search to see if recipient exists
    User.find({username: toUser}).exec((toErr,toResults) => {
        // if recipient exists, get a reference to the senders user account and create friend request
        if(toResults.length == 1) {
            // find reference to sender
            User.find({username: fromUser}).exec( (fromErr, fromResults) => {
                if(fromResults.length == 1) {
                    let newFrequest = new frequest({
                        to: toResults[0]._id,
                        from: fromResults[0]._id
                    })
                    //save the newly formed friend request to the db
                    newFrequest.save((err) => {if(err) console.log('error saving friend request')});
                    res.send('Friend Request Sent to ' + toUser + '!');
                }

            });

        } else{
            res.send('DNE'); // if the user does not exist, tell the requester
        }

    });

});

/**
 * find friend requests for a given user based on their cookie's username.
 * sends back an html string that displays the friend requests for the user to
 * look through but only the friend requests that have been sent TO that user.
 * On client side this request is pinged every 20 seconds
 */
app.get('/get/friendRequests/', (req,res) => {
    if(req.cookies.login === undefined) {
        res.send('no friend requests right now.');
    } else {
        let username = req.cookies.login.username;
        // find reference to current user
        User.find({username: username}).exec((userErr, userResults) => {
            if (userResults.length == 1) {
                // find a friend request dedicated to this user
                frequest.find({to: userResults[0]._id})
                    .populate('to')
                    .populate('from')
                    .exec((err, results) => {
                        // if at least one friend request is found
                        if (results.length > 0) {
                            newHtml = '';
                            //create divs for each friend request
                            for (let i = 0; i < results.length; i++) {
                                newHtml += '<div class=\"frequest\">';
                                newHtml += '<b>' + results[i].from.username + '</b>' + ' wants to be friends with you! ';
                                newHtml += '<button class=\"acceptFrequest\" onclick=\"' + 'acceptFriendRequest('
                                newHtml += '\'' + results[i].from.username + '\')\">' + 'Accept' + '</button>'
                                newHtml += '<button class=\"declineFrequest\" onclick=\"' + 'declineFriendRequest('
                                newHtml += '\'' + results[i].from.username + '\')\">' + 'Decline' + '</button>'
                                newHtml += '</div>'
                            }
                            res.send(newHtml);
                        } else {
                            res.send('no friend requests right now.')
                        }

                    });
            } else {
                res.send('couldnt find user');
            }


        })

    }

});

/**
 * path to delete a friend request if the user elects to decline
 */
app.post('/del/fRequest', (req,res) => {
    let username = req.cookies.login.username; //retrieve users username
    let fromUser = req.body.fromUser;
    //ensure that a friendRequest actually exists
    User.find({username: username}).exec((toErr,toRes) => {
        let toUser = toRes[0];
        User.find({username: fromUser}).exec((fromErr, fromRes) => {
            let fromUser = fromRes[0];
            //delete this request from the database
            frequest.deleteOne({to: toUser, from: fromUser}, (err) =>
             {if(err) console.log('error deleting frequest')});
        });
    });
});

/**
 * post path to add a friend. will first validate that a friend
 * request has been sent between the two users and if it has,
 * the friend request will be accepted. It will add both users
 * to eachothers friends lists then it will delete the friend
 * request between them from the db.
 */
app.post('/add/friend', (req,res) => {
    let username = req.cookies.login.username; //retrieve users username
    let fromUser = req.body.fromUser;
    User.find({username: username}).exec((toErr,toRes) => {
        // get reference to toUser
        let toUser = toRes[0];
        User.find({username: fromUser}).exec((fromErr, fromRes) => {
            //get reference to fromUser
            let fromUser = fromRes[0];
            //ensure that a friendRequest actually exists
            frequest.find({to: toUser, from:fromUser})
                .populate('to')
                .populate('from')
                .exec((err,results) => {
                    if(results.length == 1) {
                        // if the friend request exists...
                        let to = results[0].to; //get to user reference
                        let from = results[0].from; // get from user reference
                        // add each to the others friends list
                        if(to.friendsList.includes(from) || from.friendsList.includes(to)) {

                        } else {
                            to.friendsList.push(from);
                            from.friendsList.push(to);
                            to.save((err) => {if(err) console.log('error saving friend request')});
                            from.save((err) => {if(err) console.log('error saving friend request')});
                            // delete friend request from db
                            frequest.deleteOne({to: to, from: from}, (err) =>
                            {if(err) console.log('error deleting frequest')});
                        }

                    }
                });
            frequest.deleteOne({to: toUser, from: fromUser}, (err) =>
            {if(err) console.log('error deleting frequest')});
        });
    });
    frequest.find({fromUser: fromUser.fromUser, toUser: username})
        .populate('to','from')
        .exec((err,results) => {
        if(results.length == 1) {
            // if the friend request exists...
            let to = results[0].to; //get to user reference
            let from = results[0].from; // get from user reference
            // add each to the others friends list
            to.friendsList.push(from);
            from.friendsList.push(to);
            // delete friend request from db
            frequest.deleteOne({to: to, from: from}, (err) =>
                {if(err) console.log('error deleting frequest')});
        }
    });
});

/**
 * retrieves current friends list for user. returns an html string
 * that can be displayed for the user to see their current friends
 */
app.get('/get/friends', (req,res)=> {
    if(req.cookies.login === undefined) {
        res.send('')
    } else {
        let username = req.cookies.login.username; //retrieve users username
        User.find({username: username})
            .populate('friendsList')
            .exec((err,results)=> {
                if(results.length == 1) {
                    let friends = results[0].friendsList
                    newHtml = "";
                    for(let i =0; i < friends.length; i++) {
                        newHtml += '<div class=\"friendView\">'
                        newHtml += friends[i].username
                        newHtml += '</div>'
                    }
                    if(newHtml == "") {
                        res.send("no friends yet");
                    } else {
                        res.send(newHtml);
                    }
                }

            });
    }

});

/**
 * lets a user like a movie. if the movie exists in the db, the number
 * of likes on the movie are incremented and saved, and if the movie
 * is not already in the user's liked movies list, add it
 */
app.get('/like/movie/:moviename', (req,res) => {
    if(req.cookies.login === undefined) {
        res.send('Unsuccessful because of cookie')
    } else {
        let moviename = req.params.moviename;
        let user = req.cookies.login.username;
        Movie.find({title: moviename}).exec( (err,results) => {
            //if this movie exists in the db
            if(results.length == 1) {
                let curMovie = results[0];
                // add a like the movies like total
                let curLikes = curMovie.likes;
                curLikes += 1;
                curMovie.likes = curLikes;
                curMovie.save((err) => {if(err) console.log('error saving movie like')});
                //add this movie to the users likedMovies list
                User.find({username: user}).exec((userErr, userRes) =>{
                    // dont put movie into likes twice
                    if(userRes[0].likedMovies.includes(curMovie._id)) {

                    } else {
                        userRes[0].likedMovies.push(curMovie._id);
                        userRes[0].save((err) => {if(err) console.log('error saving movie to users list')});
                    }
                    res.send('You liked: ');

                });
            } else {
                res.send('Like not Registered')
            }

        });
    }
})

/**
 * retrives a list of matches between two users
 */
app.get('/get/matches/:matchName', (req,res) => {
    if(req.cookies.login === undefined) {
        res.send('Unsuccessful')
    } else {
        let matchUsername = req.params.matchName;
        let curUsername = req.cookies.login.username;
        // find the user that the current user is trying to match with
        User.find({username: matchUsername})
            .populate('likedMoves')
            .exec((err1, results1) => {
                // if the matched user is found
            if(results1.length == 1) {
                let matchUser = results1[0]; //reference to the match user
                //find the current user
                User.find({username: curUsername})
                    .populate('likedMovies')
                    .exec((err,results1) => {
                        let curUser = results1[0];
                        // check to see if match user is on current users friends list
                        if(curUser.friendsList.includes(matchUser._id)) {
                            let mutualLikes = [];
                            // for every movie in the current users liked movies list, see
                            // if it also appears on the matched users list
                            for(let i =0; i < curUser.likedMovies.length; i ++) {
                                if(matchUser.likedMovies.includes(curUser.likedMovies[i]._id)) {
                                    mutualLikes.push(curUser.likedMovies[i]);
                                }
                            }
                            // if the resulting array has no elements in it...
                            if(mutualLikes.length == 0) {
                                res.send('No Matches with this Friend, Apparently you have different taste!')
                            } else {
                                newHtml='';
                                for(let j=0; j < mutualLikes.length; j++) {
                                    newHtml+= createMovieDispString(mutualLikes[j], false);
                                }
                                res.send(newHtml);
                            }
                        // if the matche user is not on the current users friends list
                        } else {
                            res.send('Please enter one of your friends!')
                        }
                    })
            } else {
                res.send('Please enter one of your friends!')
            }
        });



    }
});

/**
 * retrieves movies for a user to scroll through. Gets up to 20 moves out of the database
 * and puts them in an html string for the user to scroll through and like
 */
app.get('/get/movies', (req,res)=>{
    Movie.find({}).exec((err,results) => {
        if(results.length == 0) {
            res.send('no movies in Db')
        } else {
            newHtml = '';
            for(let i = 0; ((i < results.length) && i < 20); i++) {
                newHtml += createMovieDispString(results[i],true);
            }
            res.send(newHtml);
        }
    })
});

/**
 * creates a string that can be displayed on the client
 * in its html. puts all of the attributes of a movie document in the db into a usable html string
 * @param movie movie that will be displayed
 * @param needLikeButton boolean to say if the like button needs to be displayed with this string
 */
function createMovieDispString(movie,needLikeButton) {
    let newHtml="";
    newHtml+= '<div class=\"homeMovie\">'
    newHtml+=   '<h2>' + movie.title + '</h2>'
    newHtml+=    '<img class=\"movieImg\" src=\"' + movie.image + '\" alt=\"' + movie.title +'\">'
    newHtml+=        '<p><b>Rating:</b> ' + movie.rating + '</p>'
    newHtml+=        '<p><b>Synopsis:</b> ' + movie.synopsis +  '</p>'
    newHtml+=        '<p><b>Genre:</b> '+ movie.genre +'</p>'
    newHtml+=        '<p><b>Review:</b> <i> ' + movie.review + '</i></p>'
    // if we want to give the user the ability to like the movie, include the like button below it
    if(needLikeButton) {
        newHtml+=        '<p><b>Likes: </b> ' + movie.likes + '</p>'
        newHtml +=       '<div class="buttonDiv">'
        newHtml+=        '<button class="likeBtn" name="' + movie.title + '\"' +  ' onClick="like(\'' + movie.title + '\');\"'
        newHtml+=        '>Like Now</button>'

        newHtml+=       '</div>'
    }
    newHtml+=   '</div>'
    return newHtml
}

/**
 * when live will listen for connections on http port 80
 */
const port = 3000;
app.listen(port, () => {
    console.log(`server listening at http://147.182.196.72:80`);
})