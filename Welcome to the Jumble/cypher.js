/*
    Author: Karly Matthes
    Course: CSC 337
    File Name: cypher.js
    Description: JavaScript file for implementing ciphering actions.
*/

// startCipher allows for the user to take input from the website, and see their
// ciphered results while typing.
function startCipher() {
    let results = document.getElementsByClassName('result');
    var text = document.getElementById('inputText').value;
    for (i=0; i<results.length; i++) {
        results[i].innerText = text.toUpperCase();
    }
    return text;

}

// showVal allows for the slider to reveal the current value that it is on after
// sliding. 
function showVal(val) {
    document.getElementById("inputVal").value=val;
    return val;
}

// caesarCiph encrpyts the text that was typed by the user. It takes it in as the 
// parameter "text", and "val" is from the slider value in the previous function.
function caesarCiph(text, val) {
    var newMsg = "";

    for (var i=0; i<text.length; i++) {
        var coded = text.charCodeAt(i);
        if (coded >= 65 && coded <= 65 + 26 -1) {
            coded -= 65;
            coded = mod(code + val, 26);
            code += 65;
        }
        newMsg += String.fromCharCode(coded);
    }
    return newMsg;
}

// Mod is a math helper function for Caesar Ciph
function mod(x, y) {
    if (x<0) {  
        x = y - Math.abs(x) % y;
    }
    return x % y;
}

// updateSquare calls shuffleTable, which is called in the HTML while the button is 
// pressed.
function updateSquare() {
    return shuffleTable()
}

// shuffleTable takes the grid and grid elements and uses swapping to randomly shuffle
// the table used for the square cipher. 
function shuffleTable() {
    let table = document.getElementById("grid");
    let rows = table.querySelectorAll("tr");
    let rList = Array.from(rows);
  
    shuffle(rList);

    for (const row of rList) {
        table.appendChild(row);
    }
}

// shuffle takes in the array of grid elements and swaps values at random.
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
