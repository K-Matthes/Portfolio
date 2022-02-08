/*
    Author: Karly Matthes
    File Name: server.js
    Course: CSC 337, Summer 2021
    Description: Creates a server that allows for messages in a chat room
    to be added to a mongoDB database. 
*/

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/chat';

// SCHEMA
var Schema = mongoose.Schema;
var ChatMessageSchema = new Schema({
    time: Number,
    alias: String,
    message: String
});
var ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema );

app.use(express.static('public_html'));

mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error'));

app.get('/chats', (req, res) => {
    var c = mongoose.model('ChatMessage', ChatMessageSchema);
    c.find({})
    .exec(function(error, results) {
        let result = "";
        for (i in results) {
            // Prints the messages as ALIAS: MESSAGE
            result += results[i].alias.bold() + ':' + results[i].message + '<br>';
        }
        res.send(result);
    });
})

app.get('/chats/post/:name/:msg', (req, res) => {
    let variableName = new Date().getTime();
    // Formats the information in the database.
    var newMsg = new ChatMessage({alias: req.params.name,
        message: req.params.msg,
        time: variableName});
    
    var m = mongoose.model('ChatMessage', ChatMessageSchema);
    m.find({})
    .exec(function(error, results) {
        console.log(results);
    })

    // Saves every new message to the database. 
    newMsg.save(function(err) { if (err) console.log('an error occurred'); });
});

const port = 3000;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
