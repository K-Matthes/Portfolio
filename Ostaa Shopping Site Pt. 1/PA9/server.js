/*
    Author: Karly Matthes
    Course: CSC 337, Summer 2021
    File Name: server.js
    Description: Allows for the user to shop and sell items and 
    provides information of those items and users per URL path.
*/

const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const app = express();
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaa';

app.use(express.static('public_html'));

mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error'));

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

/*
    Adds a user to the database by providing the 
    username and password chosen by the user. 
*/
app.post('/add/user/', (req, res) => {
    var add = JSON.parse(req.body.addUser);
    var newUser = new User(add);
    
    var u = mongoose.model('User', UserSchema);
    u.find({})
    .exec(function(error, results) {
        console.log(results);
    })

    newUser.save(function(err) { if (err) console.log('an error occurred.'); });
});

/*
    Adds and item listing by specified user.
    This updates the already existing user object 
    by adding the listing item to the list of 'Listings'
    by that user. 
*/
app.post('/add/item/:user', (req, res) => {
    var add = JSON.parse(req.body.addItem);
    var newItems = new Item(add);
 
    var u = mongoose.model('User', UserSchema);

    u.find({username: req.params.user})
    .populate('listings') 
    .exec(function(error, results) {
        // Gets item title
        let newTitle = newItems.title;
        for (i in results) {
            // Adds item to 'listings'
            results[i].listings.push(newTitle);
            // Saves the user object so it can continue to be updates
            // as more listings are made. 
            results[i].save(function(err) { if (err) console.log('an error occurred.'); });
        }
            console.log(results[i]);
    });

    newItems.save(function(err) { if (err) console.log('an error occurred.'); });
});

/*
    Gets all existings users
*/
app.get('/get/users', (req, res) => {
    var user = mongoose.model('User', UserSchema);
    user.find({})
    .exec(function(error, results) {
        res.end(JSON.stringify(results, null, 2));
        
    })
});

/*
    Gets all existings items 
*/
app.get('/get/items', (req, res) => {
    var item = mongoose.model('Item', ItemSchema);
    item.find({})
    .exec(function(error, results) {
        res.end(JSON.stringify(results, null, 2));
        
    })
});

/*
    Gets all existings listings ('SALE') from the user
    specifies from the URL path. If no listings exist,
    '[]' is printed. 
*/
app.get('/get/listings/:user', (req, res) => {
    var listing = mongoose.model('Item', ItemSchema);
    listing.find({user : req.params.user, status: 'SALE'})
    .exec(function(error, results) {
        res.end(JSON.stringify(results, null, 2));
    })
});

/*
    Gets all existings purchases ('SOLD') from the user
    specifies from the URL path. If no purchase exist,
    '[]' is printed. 
*/
app.get('/get/purchases/:user', (req, res) => {
    var purchase = mongoose.model('Item', ItemSchema);
    purchase.find({user : req.params.user, status: 'SOLD'})
    .exec(function(error, results) {
        res.end(JSON.stringify(results, null, 2));
    })
});

/*
    searches through all existing users and finds the 
    keyword provided by the URL path. Prints the users 
    with the keyword.
*/
app.get('/search/users/:keyword', (req, res) => {
    var keyUser = mongoose.model('User', UserSchema);
    // Searches through all existing users
    keyUser.find({})
    .exec(function(error, results) {
        if (error) {
            console.log(error);
        }
        let temp = [];
        // Makes a list of usernames that include the keyword
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
    searches through all existing items and finds the 
    keyword provided by the URL path that is present
    in the item description. Prints the items with 
    the keyword.
*/
app.get('/search/items/:keyword', (req, res) => {
    var keyItem = mongoose.model('Item', ItemSchema);
    // Searches through all existing items
    keyItem.find({})
    .exec(function(error, results) {
        if (error) {
            console.log(error);
        }
        let temp = [];
        for (i in results) {
            // Makes a list of items that include the keyword
            let desc = results[i].description;
            if (desc.includes(req.params.keyword)) {
                temp.push(results[i]);
            }
        }
        res.end(JSON.stringify(temp, null, 2));
    })
});


const port = 3000;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})