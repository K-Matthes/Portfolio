/*
    Author: Karly Matthes
    File Name: doStuff.js
    Course: CSc 337
    Description: Communicates with the html file by providing the AJAX element
    to the server, which allows the server to render the information without
    having to reload the page. This also allows for the button to trigger
    the translation. 
*/

function getTranslation() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log(httpRequest.responseText);
                let translateText = document.getElementById('textBox2');
                translateText.value = httpRequest.responseText;
            }
            else {
                alert('ERROR');
            }
        }
    }

    let selectLang1 = document.getElementById('translate').value;
    let selectLang2 = document.getElementById('translated').value;
    let beforeT = document.getElementById('textBox1').value;
    let url = 'http://localhost:5000/' + 'translate' + '/' + selectLang1 + '2' + selectLang2 + '/' + beforeT;
    httpRequest.open('GET', url);
    httpRequest.send();
}
