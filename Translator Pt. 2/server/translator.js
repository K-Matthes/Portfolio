/*
    Author: Karly Matthes
    File Name: translator.js
    Course: CSc 337
    Description: Translates between English, German and Spanish depending on the request 
    of the client. 
*/
const express = require('express');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(express.static('public_html'));

/*
    This function parses the Spanish.txt file and creates a dictionary 
    by mapping English words to its corresponding Spanish translation.
*/
var spanDict = {}
fs.readFile('./Spanish.txt', 'utf8', function(err,data){
    if (err) { return console.log(err); }
    lines = data.split('\n')
    count = lines.length;
    for ( i=0; i<count; i++ ) {
        // Removes all unnecessary characters and phrases.
        arr = lines[i].replace('/','').replace('[Adverb]','').replace('[Noun]','')
        .replace('[Verb]','').replace('(pluralinformal)','').replace('[Pronoun]','')
        .replace('[Article]','').trim().split('\t').join(',').split('/n').join(',').split(',');
        def = arr.slice(1).join('');
        spanDict[arr[0]] = [def];
    }
})

/*
    This function parses the German.txt file and creates a dictionary 
    by mapping English words to its corresponding German translation.
*/
var germDict = {}
fs.readFile('./German.txt', 'utf8', function(err,data){
    if (err) { return console.log(err); }
    lines = data.split('\n')
    count = lines.length;
    for ( i=0; i<count; i++ ) {
        // Removes all unnecessary characters and phrases.
        arr = lines[i].replace('/','').replace('[Adverb]','').replace('[Noun]','')
        .replace('[Verb]','').replace('(pluralinformal)','').replace('[Pronoun]','')
        .replace('(f)','').replace('(m)','').trim().split('\t').join(',').split('/n').join(',').split(',');
        def = arr.slice(1).join('');
        germDict[arr[0]] = def;
    }
})

/*
    E2S translates English to Spanish if provided the correct URL path 
    as shown below. 
*/
app.get('/translate/e2s/:content', (req, res) => {
    splitContent = req.params.content.split(' ');
    result = "";
    for (i=0; i<splitContent.length; i++) {
        // Checks if the English word is a key in the dictionary
        // and returns the Spanish value of that key. 
        checker = splitContent[i] in spanDict;
        trans = spanDict[splitContent[i]];
        result += trans + " ";
    }
  res.send(result);
})

/*
    S2E translates Spanish to English if provided the correct URL path 
    as shown below. 
*/
app.get('/translate/s2e/:content', (req, res) => {
    splitContent = req.params.content.split(' ');
    result = "";
    for (i=0; i<splitContent.length; i++) {
        // Checks for predecessor words such as 'los' and 'el'
        if(splitContent[i] == 'los' || splitContent[i] == 'las' ||
            splitContent[i] == 'el' || splitContent[i] == 'la') {
                newStr = splitContent[i] + " " + splitContent[i+1];
                splitContent[i] = newStr;
        }
        // Checks if the value exists in the dictionary and returns 
        // the mapping key (English word).
        for (const [key, value] of Object.entries(spanDict)) {
            if (splitContent[i] == value) {
                result += key + " ";
            }
        }
    }
  res.send(result);
})

/*
    E2G translates English to German if provided the correct URL path 
    as shown below. 
*/
app.get('/translate/e2g/:content', (req, res) => {
    splitContent = req.params.content.split(' ');
    result = "";
    for ( i=0; i<splitContent.length; i++ ) {
        // Checks if the English word is a key in the dictionary
        // and returns the German value of that key. 
        checker = splitContent[i] in germDict;
        trans = germDict[splitContent[i]];
        result += trans + " ";
    }
    
  res.send(result);
})

/*
    G2E translates German to English if provided the correct URL path 
    as shown below. 
*/
app.get('/translate/g2e/:content', (req, res) => {
    splitContent = req.params.content.split(' ');
    result = "";
    for (i=0; i<splitContent.length; i++) {
        // Checks if the value exists in the dictionary and returns 
        // the mapping key (English word).
        for (const [key, value] of Object.entries(germDict)) {
            if (splitContent[i] == value) {
                result += key + " ";
            }
        }
    }
    
  res.send(result);
})

/*
    G2S translates German to Spanish if provided the correct URL path 
    as shown below. 
*/
app.get('/translate/g2s/:content', (req, res) => {
    splitContent = req.params.content.split(' ');
    newString = "";
    result = "";
    for (i=0; i<splitContent.length; i++) {
        for (const [key, value] of Object.entries(germDict)) {
            // Translates German to English, and then checks if that 
            // English word is a key of the Spanish dictonary and returns
            // that value.
            if (splitContent[i] == value) {
                newString += key;
                checker = newString in spanDict;
                trans = spanDict[newString];
                result += trans + " ";

            }
        }
    }
  res.send(result);
})

/*
    S2G translates Spanish to German if provided the correct URL path 
    as shown below. 
*/
app.get('/translate/s2g/:content', (req, res) => {
    splitContent = req.params.content.split(' ');
    toEng = "";
    toGerm = "";
    for ( i=0; i<splitContent.length; i++ ) {
        // Checks for predecessor words such as 'los' and 'el'
        if(splitContent[i] == 'los' || splitContent[i] == 'las'
            || splitContent[i] == 'el' || splitContent[i] == 'la') {
                newStr = splitContent[i] + " " + splitContent[i+1];
                splitContent[i] = newStr;
        }
        for (const [key, value] of Object.entries(spanDict)) {
            // Translates Spanish to English and then English to
            // German
            if (splitContent[i] == value) {
                toEng += key;
                checker = toEng in germDict;
                translate = germDict[toEng];
                toGerm += translate + " ";
            }
        }
    }

  res.send(toGerm);
})

// Incorrect Input
app.get('/translate/:type/:content', (req, res) => {
  res.send('OK');
})

// Incorrect Input
app.get('/', (req, res) => {
    res.send('OK');
  })

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})