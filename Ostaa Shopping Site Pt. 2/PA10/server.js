/*
    Author: Karly Matthes
    File Name: server.js
    Course: CSC 337, Summer 2021
    Description: Creates the express server for Ostaa shopping and 
    selling site.
*/

const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
const { resourceLimits } = require('worker_threads');
const app = express();
app.use(cookieParser());
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaaPt2';

var sessionKeys = {};

function updateSession() {
    let now = Date.now();
    for (e in sessionKeys) {
        if (sessionKeys[e][1] < (now - 20000)) {
            delete sessionKeys[e];
        }
    }
}

setInterval(updateSession, 3000);

var Schema = mongoose.Schema;

// Items Schema
var ItemSchema = new Schema({
    title: String,
    description: String,
    image: String,
    price: Number,
    status: String,
    user: String
});
var Item = mongoose.model('Item', ItemSchema);

// User Schema
var UserSchema = new Schema({
    username: String,
    password: String,
    listings: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    purchases: [{ type: Schema.Types.ObjectId, ref: 'Item' }] 
});
var User = mongoose.model('User', UserSchema);

mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error'));

/*
    Authenticates that the user exists in the database, and allows for
    the user to login and see the homepage. This is done by using cookies.
*/
function auth(req, res, next) {
    if (Object.keys(req.cookies).length > 0) {
      let u = req.cookies.login.username;
      let key = req.cookies.login.key;
      if ( Object.keys(sessionKeys[u]).length > 0 && sessionKeys[u][0] == key) {
        next();
      } else {
        res.send('NOoo');
      }
    } else {
      res.send('NO');
    } 
}

app.use('/public_html/home.html', auth);
app.use('/', express.static('public_html'));

/*
    Gets the user so that the program can remember whos account is logged in,
    which allows for the user to look at their listings and purchases.
*/
app.get('/getUser', (req, res) => {
    res.send(req.cookies.login.username);
});

/*
    Creates a new user and adds it to the database. If the user already exists
    in the database, they are not able to use that username and must pick something
    else. 
*/
app.get('/create/:user/:pass', (req, res) => {
   let u = req.params.user;
   let p = req.params.pass;
   User.find({username: u})
   .exec(function(error, results) {
       // Checks if username does not exist.
        if (results.length == 0) {
           var account = new User({'username' : u, 'password': p});
           // Adds new user to database
           account.save(function (err) { if (err) console.log('an error occured')});
           res.send('Account successfully created!');
       }
       else{
            res.send('Username already exists.');
       }
   })
});

/*
    Allows for the user to login given that their credentials already exist in
    the database. 
*/
app.get('/login/:user/:pass', (req, res) => {
    let u = req.params.user;
    let p = req.params.pass;
    User.find({username: u, password: p})
    .exec(function(error, results) {
        // If user exists, create a cookie for that user.
        if (results.length == 1) {
            let sessionKey = Math.floor(Math.random() * 1000);
            sessionKeys[u] = [sessionKey, Date.now()];
            // Cookie creates and exists for 10 minutes.
            res.cookie("login", {username: u, key:sessionKey}, {maxAge: 600000});
            res.send('OK');
        } 
        else {
        res.send('This account does not exist');
        }
    });
});

/*
    Adds a new item to the database per user that inputted it.
*/
app.post('/add/item/:user', (req, res) => {
    var add = JSON.parse(req.body.addItem);
    var newItems = new Item(add);
 
    var u = mongoose.model('User', UserSchema);

    u.find({username: req.params.user})
    .populate('listings') 
    .exec(function(error, results) {
        let newTitle = newItems.title;
        for (i in results) {
            results[i].listings.push(newTitle);
            results[i].save(function(err) { if (err) console.log('an error occurred.'); });
        }
    });
    newItems.save(function(err) { if (err) console.log('an error occurred.'); });
});

/*
    Adds new listings to the database per user that submitted it. After view purchases 
    is pressed, the user is able to see their listings and the option to buy. 
*/
app.get('/get/listings/:user', (req, res) => {
    var listing = mongoose.model('Item', ItemSchema);
    listing.find({user : req.params.user, status: 'SALE'})
    .exec(function(error, results) {
        var str = " ";
        for (i in results) {
            str += ("Item: ".bold() + results[i].title + '<br>' + "Description: ".bold() + 
            results[i].description + '<br>' + "Image: ".bold() + results[i].image + '<br>' + 
            "Price: ".bold() + results[i].price + '<br>' + "Status: ".bold() + results[i].status) +
            '<br>';

            str += ' <button onclick="status();">Buy Now</button><br><br> ';
        }
        res.send(str);
    })
});

/*
    User is able to view their purchases. These must alread exist in the database. 
*/
app.get('/get/purchases/:user', (req, res) => {
    var purchase = mongoose.model('Item', ItemSchema);
    purchase.find({user : req.params.user, status: 'SOLD'})
    .exec(function(error, results) {
        var str = " ";
        for (i in results) {
            str += ("Item: ".bold() + results[i].title + '<br>' + "Description: ".bold() + 
            results[i].description + '<br>' + "Image: ".bold() + results[i].image + '<br>' + 
            "Price: ".bold() + results[i].price + '<br>' + "Status: ".bold() + results[i].status)+
            '<br><br>';
        }
        res.send(str);
    })
});                                                             

/*
    Searches for users based off of keyword
*/
app.get('/search/users/:keyword', (req, res) => {
    var keyUser = mongoose.model('User', UserSchema);
    keyUser.find({})
    .exec(function(error, results) {
        if (error) {
            console.log(error);
        }
        let temp = [];
        for (i in results) {
            let user = results[i].username;
            if (user.includes(req.params.keyword)) {
                temp.push(results[i]);
            }
        }
        res.end(JSON.stringify(temp, null, 2));
    })
});

/*
    Searches all items based off of keyword
*/
app.get('/search/items/:keyword', (req, res) => {
    var keyItem = mongoose.model('Item', ItemSchema);
    keyItem.find({})
    .exec(function(error, results) {
        if (error) {
            console.log(error);
        }
        let temp = [];
        for (i in results) {
            let desc = results[i].description;
            if (desc.includes(req.params.keyword)) {
                temp.push(results[i]);
            }
            var str = " ";
            for (i in temp) {
                str += ("Item: ".bold() + temp[i].title + '<br>' + "Description: ".bold() + 
                temp[i].description + '<br>' + "Image: ".bold() + temp[i].image + '<br>' + 
                "Price: ".bold() + temp[i].price + '<br>' + "Status: ".bold() + temp[i].status)+
                '<br><br>';

            }
        }
        res.send(str);
    })
});

/*
    Changes status of item from SALE to SOLD indicating that the user has purchased an item.
*/
app.get('/change/:title', (req, res) => {
    var changeItem = mongoose.model('Item', ItemSchema);
    changeItem.find({title: req.params.title})
    .exec(function(error, results) {
        for (i in results) {
            console.log(results[i]);
            if (results[i].status == "SALE") {
                results[i].status == "SOLD";
                results[i].save(function(err) { if (err) console.log('an error occurred.'); });
            }
        }
    })
});


const port = 3000;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})

