let socket;
const kastat = document.getElementById("kastat");
const playElt = document.getElementById("play");
const markElt = document.getElementById("mark");
const display = document.getElementById("display");
const kong = document.getElementById("kong");
const pong = document.getElementById("pong");
const shao = document.getElementById("shao");
const dra = document.getElementById("dra");
const hand = document.getElementById("hand");
let weatherstreck = "";
let bricks = [];
let activeplayer = "E";
let started = false;
let bricktopong = "";
let canpong = false;
let cankong = false;
let compassimg = document.getElementById("kompassimg");
let state = "init";
playElt.onclick = () => {
    socket = new WebSocket("ws://localhost:8000");
    socket.onopen = () => {
        display.value = "Väntar på motståndare...";
        playElt.disabled = true;
        kong.disabled = true;
        pong.disabled = true;
        shao.disabled = true;
        dra.disabled = true;
    };
    socket.onmessage = (event) => {
        if (event.data == "drog") {
            pong.disabled = true;
            kong.disabled = true;
        }
        else if (event.data.endsWith("pong")) {
            kastat.lastElementChild.remove();
            activeplayer = event.data[0];
            dra.disabled = true;
            if (weatherstreck != activeplayer) {
                state = "wait";
            }
            else {
                state = "play";
            }
            display.value = (activeplayer + " pongade " + bricktopong);
        }
        else if (event.data.endsWith("kong")) {
            console.log(event.data[2]);
            console.log((event.data.slice(0, 2)));
            kastat.lastElementChild.remove();
            if (event.data.endsWith(weatherstreck + "kong")) {
                bricks.push(event.data.slice(0, 2));
                showbricks();
            }
            activeplayer = event.data[2];
            display.value = (activeplayer + " kongade " + bricktopong);
            dra.disabled = true;
            if (weatherstreck != activeplayer) {
                state = "wait";
            }
            else {
                state = "play";
            }
        }
        else {
            switch (state) {
                case "init": {
                    weatherstreck = event.data;
                    markElt.value = ("Du är " + weatherstreck);
                    state = "waitforbricks";
                    break;
                }
                case "play": {
                    break;
                }
                case "dra": {
                    bricks.push(event.data);
                    display.value = event.data;
                    state = "play";
                    dra.disabled = true;
                    showbricks();
                    break;
                }
                case "wait": {
                    let brickid = event.data;
                    bricktopong = brickid;
                    canpong = false;
                    cankong = false;
                    for (let index = 0; index < bricks.length; index++) {
                        if (canpong == false) {
                            if (bricks[index] == brickid) {
                                if (bricks[index + 1] == brickid) {
                                    pong.disabled = false;
                                    canpong = true;
                                    if (bricks[index + 2] == brickid) {
                                        kong.disabled = false;
                                    }
                                    else {
                                        kong.disabled = true;
                                    }
                                }
                                else {
                                    pong.disabled = true;
                                }
                            }
                        }
                    }
                    let throwawaybrick = document.createElement("img");
                    throwawaybrick.src = ("./tiles/" + brickid + ".png");
                    kastat.appendChild(throwawaybrick);
                    if (activeplayer == "N") {
                        activeplayer = "E";
                        display.value = "det är östans tur";
                    }
                    else if (activeplayer == "W") {
                        activeplayer = "N";
                        display.value = "det är nordans tur";
                    }
                    else if (activeplayer == "E") {
                        activeplayer = "S";
                        display.value = "det är sunnans tur";
                    }
                    else if (activeplayer == "S") {
                        activeplayer = "W";
                        display.value = "det är västans tur";
                    }
                    if (weatherstreck == activeplayer) {
                        display.value = "det är din tur";
                        dra.disabled = false;
                        state = "dra";
                    }
                    break;
                }
                case "waitforbricks": {
                    bricks = JSON.parse(event.data);
                    bricks.sort();
                    showbricks();
                    break;
                }
            }
        }
        ;
    };
    socket.onclose = (event) => console.log(event);
    socket.onerror = (event) => console.log(event);
};
dra.onclick = () => {
    socket.send("dra");
};
pong.onclick = () => {
    kastat.lastElementChild.remove();
    state = "play";
    bricks.push(bricktopong);
    console.log(bricktopong);
    console.log(bricks);
    bricks.sort();
    pong.disabled = true;
    dra.disabled = true;
    kong.disabled = true;
    socket.send(weatherstreck + "pong");
    showbricks();
};
kong.onclick = () => {
    kastat.lastElementChild.remove();
    state = "play";
    bricks.push(bricktopong);
    bricks.sort();
    pong.disabled = true;
    dra.disabled = true;
    kong.disabled = true;
    socket.send(weatherstreck + "kong");
};
function showbricks() {
    bricks.sort();
    let hand = document.getElementById("hand");
    hand.innerHTML = "";
    for (let index = 0; index < bricks.length; index++) {
        let mahjongbricka = document.createElement("button");
        let hand = document.getElementById("hand");
        let img = document.createElement("img");
        img.onclick = () => {
            if (state == "play") {
                socket.send(bricks[index]);
                state = "wait";
                console.log("skickat");
                bricks.splice(index, 1);
                console.log(bricks);
                mahjongbricka.remove();
            }
        };
        img.src = ("./tiles/" + bricks[index] + ".png");
        mahjongbricka.appendChild(img);
        hand.appendChild(mahjongbricka);
    }
    if (started == false) {
        if (weatherstreck == "E") {
            display.value = "det är din tur";
            state = "play";
        }
        else {
            display.value = "det är östans tur";
            state = "wait";
        }
    }
    else {
        state = "play";
    }
    started = true;
}
export {};
//# sourceMappingURL=script.js.map