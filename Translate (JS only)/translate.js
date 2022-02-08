/*
    Author: Karly Matthes
    Course: CSC 337
    File Name: translate.js
    Description: This file is able to translate words or phrases in and 
    from the following languages: German/Spanish/English. These translations
    are triggered from the path of the website, using e to represent English,
    s to represent Spanish, and g to represent German. If one wishes to translate
    text to or from any of these three languages, one would simply type: s2g
    (English to German). The following part of the path would be the word or phrase
    to translate. If more than one word, spaces would be represented by '+'.
*/

const { read } = require('fs');
const http = require('http');
const fs = require('fs');
const { listenerCount } = require('events');
const { runInNewContext } = require('vm');
const hostname = '127.0.0.1';
const port = 5000;

var spanDict = {}
// Loading Spanish.txt

/* This function creates the Spanish dictionary by parsing the file 
and creating key values pairs of each word. The keys are the English
word, and the values are the Spanish words that translate.
*/
fs.readFile('./Spanish.txt', 'utf8', function(err,data){
    if (err) { return console.log(err); }
    // Split file by new line
    lines = data.split('\n')
    count = lines.length;
    // Trim white space, split by misc characters
    for ( i=0; i<count; i++ ) {
        arr = lines[i].replace('/','').replace('[Adverb]','').replace('[Noun]','')
        .replace('[Verb]','').replace('(pluralinformal)','').replace('[Pronoun]','')
        .trim().split('\t').join(',').split('/n').join(',').split(',');
        // Make Spanish translation into one string
        def = arr.slice(1).join('');
         // English : Spanish
        spanDict[arr[0]] = [def];
    }
})

var germDict = {}
// Loading German.txt

/* This function creates the German dictionary by parsing the file 
and creating key values pairs of each word. The keys are the English
word, and the values are the German words that translate.
*/
fs.readFile('./German.txt', 'utf8', function(err,data){
    if (err) { return console.log(err); }
    // Split file by new line
    lines = data.split('\n')
    count = lines.length;
    // Trim white space, split by misc characters
    for ( i=0; i<count; i++ ) {
        arr = lines[i].replace('/','').replace('[Adverb]','').replace('[Noun]','')
        .replace('[Verb]','').replace('(pluralinformal)','').replace('[Pronoun]','')
        .replace('(f)','').replace('(m)','').trim().split('\t').join(',').split('/n').join(',').split(',');
        // Make German translation into one string
        def = arr.slice(1).join('');
         // English : German
        germDict[arr[0]] = def;
    }
})

/*
This function implements the actual translations by various conditional 
statements. This function takes in the parameters req and res which allow
the results to be printed in the console, and for the results to be printed
out on the website's interface. 
*/
const server = http.createServer(
    function(req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        req.url = req.url.trim().split('/');
        // Grabs TYPE
        if (req.url[1] == 'translate' && req.url[2] == 'e2s') {
            // Grabs CONTENT
            content = req.url[3];
            // Splits word 
            trimContent = content.split('+');
            result = " ";
            for ( i=0; i<trimContent.length; i++ ) {
                // Checks if key(en word) is in the dictionary
                checker = trimContent[i] in spanDict;
                // Translates the en to span by grabbing value pair
                trans = spanDict[trimContent[i]];
                // Adds value to a string to put words on the same line
                result += trans + " ";
                console.log(result);
            }
            res.end(result);
        }
        // grabs TYPE 
        else if (req.url[1] == 'translate' && req.url[2] == 's2e') {
            // grabs CONTENT
            content = req.url[3];
            // splits content by word.
            trimContent = content.split('+');
            stringRep = "";
            for ( i=0; i<trimContent.length; i++ ) {
                // Combines instances of words if 'los', 'las', 'el' 
                // or 'la' are a predecessor.
                if(trimContent[i] == 'los' || trimContent[i] == 'las' ||
                trimContent[i] == 'el' || trimContent[i] == 'la') {
                    newStr = trimContent[i] + " " + trimContent[i+1];
                    trimContent[i] = newStr;
                }
                // Maps the spanish word to the english word(key), and joins them to
                // make a string.
                for (const [key, value] of Object.entries(spanDict)) {
                    if (trimContent[i] == value) {
                        stringRep += key + " ";
                        console.log(stringRep);
                    }
                        
                }
            }
            res.end(stringRep);
        }
        // grabs TYPE 
        else if (req.url[1] == 'translate' && req.url[2] == 'e2g') {
            // Grabs CONTENT
            content = req.url[3];
            // Splits word 
            trimContent = content.split('+');
            result = "";
            for ( i=0; i<trimContent.length; i++ ) {
                // Checks if key(en word) is in the dictionary
                checker = trimContent[i] in germDict;
                // Translates the en to span by grabbing value pair
                trans = germDict[trimContent[i]];
                // Adds value to a string to put words on the same line
                result += trans + " ";
                console.log(result);
            }
            res.end(result);
        }
        // grabs TYPE 
        else if (req.url[1] == 'translate' && req.url[2] == 'g2e') {
            // grabs CONTENT    
            content = req.url[3];
            trimContent = content.split('+');
            concatString = "";
            // Grabs the key of the value being searched in order to 
            // translate German back to English
            for ( i=0; i<trimContent.length; i++ ) {
                for (const [key, value] of Object.entries(germDict)) {
                    if (trimContent[i] == value) {
                        concatString += key + " ";
                        console.log(concatString);
                    }
                }
            }
            res.end(concatString);
        }
        // grabs TYPE
        else if (req.url[1] == 'translate' && req.url[2] == 'g2s') {
            // grabs CONTENT
            content = req.url[3];
            trimContent = content.split('+');
            newString = "";
            blank = ""
            // Translates German to English
            for ( i=0; i<trimContent.length; i++ ) {
                for (const [key, value] of Object.entries(germDict)) {
                    if (trimContent[i] == value) {
                        // Translates English to Spanish
                        newString += key;
                        check = newString in spanDict;
                        trans = spanDict[newString];
                        blank += trans + " ";
                        console.log(blank);
                    }
                }
            }
            res.end(blank);
        }
        else if (req.url[1] == 'translate' && req.url[2] == 's2g') {
            // grabs CONTENT
            content = req.url[3];
            // splits content by word.
            trimContent = content.split('+');
            toEng = "";
            toGerm = "";
            for ( i=0; i<trimContent.length; i++ ) {
                // Combines instances of words if 'los', 'las', 'el'
                // or 'la' are a predecessor.
                if(trimContent[i] == 'los' || trimContent[i] == 'las'
                || trimContent[i] == 'el' || trimContent[i] == 'la') {
                    newStr = trimContent[i] + " " + trimContent[i+1];
                    trimContent[i] = newStr;
                }
                // Maps the spanish word to the english word(key), and then maps 
                // the english word to the german word. 
                for (const [key, value] of Object.entries(spanDict)) {
                    if (trimContent[i] == value) {
                        toEng += key;
                        toCheck = toEng in germDict;
                        // Translates the Eng to Germ by grabbing value pair
                        translate = germDict[toEng];
                        // Adds value to a string to put words on the same line
                        toGerm += translate + " ";
                        console.log(toGerm);
                    }
                                    
                }
            }
            res.end(toGerm);
        }
        else {
            res.end('OK');
        }
    }
);

server.listen(port, hostname, 
    function(){
        console.log(`Server running at http://${hostname}:${port}/`);
    }
);