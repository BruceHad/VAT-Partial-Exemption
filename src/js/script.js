let p = document.getElementById('js-test');
let ellip = p.querySelector('span');
let language = 'javascript';
let message = `<em>Yep, looks like ${language} is up and running.</em>`;

let frames = ['.', '..', '...'];
let i = 0, timer = 0;

let intid = setInterval(function(){
    i += 1; timer += 1;
    if (i > 2) {i = 0;}
    ellip.innerHTML = frames[i];
    if (timer > 10){
        clearInterval(intid);
        ellip.innerHTML = '...';
        p.innerHTML += message;
    }
}, 250);