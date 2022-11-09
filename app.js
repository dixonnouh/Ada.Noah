/*----- user connection -----*/
let socket = io("/private");

let roomNumber;
let promptButton = document.createElement('button');

//listen for confirmation of connection
socket.on('connect', () => {
    console.log("socket");

    /*----- sockets join room -----*/
    socket.on('userArray', (theArray) => {
        roomNumber = theArray.length;

        if (roomNumber <= 4) {
            let playerRoom = { room: "room" + roomNumber, number: roomNumber }
            // console.log(playerRoom);
            socket.emit('playerRoom', playerRoom);
            // message for 4 gamers
            if (roomNumber < 4) {
                addMsgToPage("You are the " + roomNumber + " gamer arrived. Battle field soon to be filled!")
            } else {
                addMsgToPage("You are the " + roomNumber + " gamer arrived. Just about the right time! GAME ON")
            }

        } else {
            let main_room = {
                viewer_room: "main_room",
                viewer_msg: "Game has already started! You are the viewer number: " + roomNumber,
                broadcast_msg: "Viewer number: " + roomNumber + " joined room"
            }
            socket.emit('to main room', main_room);
        };
    })

    /*----- gamer sockets drawing communication -----*/
    socket.on('gameOn', (theArray) => {
        if (theArray.length <= 4) {
            let playerClient = { playerArray: theArray }
            socket.emit('enable draw room', playerClient);
        }
    })


    let buttons = document.getElementsByClassName("user_signal_button");
    // console.log(buttons[0]);
    let appendPrompt = document.getElementById("prompt-button-slot");

    /*----- room button color change -----*/
    socket.on('msg', (private_msg) => {
        // -1 for the button array order
        let room_number = private_msg.msg - 1;
        //
        // console.log(buttons[room_number]);
        buttons[room_number].style.background = "#f0f081"
        buttons[room_number].style.boxShadow = "8px 10px 1px #252936";

        // !!! add gamer message on board

        const signal_all = { button: room_number, msg: ":)" }
        socket.emit('other user', signal_all);
    })

    /*----- show other room occupancy -----*/
    socket.on('signal_all', (signal_msg) => {
        console.log(signal_msg);
        let occpuied_number = signal_msg.button;
        let button_text = signal_msg.msg;
        buttons[occpuied_number].innerHTML = button_text;
        buttons[occpuied_number].style.background = "#9140f1";
        buttons[occpuied_number].style.boxShadow = "8px 10px 1px #3b70ff";
        // console.log(button_text);
    })

    /*----- room1 sockets, prompt listener (game start) -----*/
    socket.on('prompt', (prompt) => {

        setTimeout(() => {
            // console.log(prompt.msg_one);
            addMsgToTitle(prompt.msg_one);
        }, 1000);

        setTimeout(() => {
            addMsgToTitle(prompt.msg_two);
        }, 2000);

        setTimeout(() => {
            addMsgToTitle(prompt.msg_three);
        }, 3000);

        setTimeout(() => {

            addMsgToTitle(prompt.msg_four);
            // let promptButton = document.createElement('button');
            promptButton.innerHTML = "PROMPT";
            promptButton.style.height = '2em';
            promptButton.style.width = '5em';
            promptButton.style.fontSize = '51px';
            promptButton.style.marginLeft = '1em';
            promptButton.style.textAlign = 'center';
            promptButton.style.backgroundColor = '#3b70ff';
            promptButton.style.color = '#f0f081';
            promptButton.style.textShadow = '2px 0px 6px #f0f081, 4px 0px 4px #ff0a966b, 6px 0px 2px #c75df6, 8px 0px 0px #3b70ff';
            appendPrompt.appendChild(promptButton);

            //*----- start game by room1 click on button
            promptButton.addEventListener('click', function () {
                // console.log("prompt button clicked, game on")

                //*----- room1 prompt button
                // 1.clear canvas
                background(255);

                // 2.adding random prompt on title
                let objectPrompt = {
                    data: ["apple", "shrimp", "bicycle", "avacado", "pumpkin", "pizza", "car", "hot dog", "computer", "cat"]
                }

                let object = objectPrompt.data
                let randomNum = Math.floor(Math.random() * object.length);
                let randomPrompt = object[randomNum];
                // console.log(randomPrompt)
                addMsgToTitle(randomPrompt);
                promptButton.innerHTML = "DRAW";


                //3. notify gamers and users & clear all canvas
                let startMsg = { msg: "GAME ON" }
                socket.emit('clear canvas', startMsg)

                //4. ROOM1, countDown for gamer
                let countDownMsg = { msg: "TIME'S UP" }
                socket.emit('room1 count down', countDownMsg);
            });

        }, 4000);


    })

    /*----- game "loading message" for gamer room1-4-----*/
    socket.on('gamer_msg', (gamer_msg) => {
        console.log(gamer_msg.msg);
        addMsgToPage(gamer_msg.msg);
    });


    /*----- main room entrance notifiers-----*/
    //*----- "you are viewer"
    socket.on('to main room', (msg) => {
        addMsgToPage(msg);
        // let msgElement = document.createElement('p');
        // msgElement.innerHTML = msgMain;
        // messageBoard.appendChild(msgElement);
    });
    //*----- "viewer xth joined"
    socket.on('main room msg', (msg) => {
        // console.log(msg);
        addMsgToPage(msg);
    })

}); // socket.connection

/*--------------- CALLBACK FUNCTIONs ---------------*/
let messageBoard = document.getElementById("message_page");
let msgElement = document.getElementById('game_title');

function addMsgToTitle(msg) {
    msgElement.innerHTML = msg;
    // messageBoard.appendChild(msgElement);
}

function addInputbox() {
    let iptElement = document.createElement('INPUT');
    iptElement.setAttribute("type", "text");

    messageBoard.appendChild(iptElement);
}

function addMsgToPage(msg) {
    let msgElement = document.createElement('p');
    msgElement.innerHTML = msg;
    messageBoard.appendChild(msgElement);

    messageBoard.scrollTop = messageBoard.scrollHeight
}

let canvasBoard = document.getElementById("canvas_id");

function addMsgToCanvas(msg) {
    let msgElement = document.createElement('h6');
    msgElement.innerHTML = msg;
    canvasBoard.appendChild(msgElement);

    // messageBoard.scrollTop = messageBoard.scrollHeight
}

// countdown timer
// counter 减一遍，1000走一遍

function countDown(sec) {
    let counter = sec
    const interval = setInterval(() => {
        counter--;
        if (counter < 0) {
            clearInterval(interval);
            console.log("time is up");
            background(255);
        }
    }, 1000)
}


/*--------------- DRAWING DATA ---------------*/

//*----- room1 click on PROMPT button
//boardcast clear the canvas for all & send title
socket.on('clear canvas', (start_game) => {
    // title notifer
    addMsgToTitle(start_game.msg);
    // message board notifier
    addMsgToPage("ALL PLAYERS have arrived.");
    addMsgToPage("Players: Good luck with the TELEGRAM");
    addMsgToPage("Viewers: Enjoy the CHAOS");
    background(255);
})

socket.on('drawToRoom', (ToRoom) => {
    // drawing data
    socket.emit('ToRoom', ToRoom);

    // message board
    // let msg = ToRoom.msg;
    // // console.log(msg)
    // addMsgToPage("player" + msg + "is drawing...");
})

/*--------------- COUNTDOWN CODE ---------------*/
// room1
socket.on('room1 count down', (msg) => {
    console.log("you should see this in room1 after prompt pressed")
    countDown(10);
    setTimeout(() => {
        addMsgToPage(msg.msg);
        socket.emit('room2 count down', msg)
    }, 10000);
})
// room2
socket.on('room2 count down', (msg) => {
    console.log("you should see this in room2 after canvas clear in room1")
    background(255);
    countDown(10);
    setTimeout(() => {
        addMsgToPage(msg.msg);
        socket.emit('room3 count down', msg)
    }, 10000);
})
// room3
socket.on('room3 count down', (msg) => {
    console.log("you should see this in room3 after canvas clear in room2")
    background(255);
    countDown(10);
    setTimeout(() => {
        addMsgToPage(msg.msg);
        socket.emit('room4 count down', msg)
    }, 10000);
})

// room4
socket.on('room4 count down', (msg) => {
    console.log("you should see this in room4 after canvas clear in room3");
    addMsgToPage(msg.msg);
    setTimeout(() => {
        addMsgToPage("Input your best guess, please")
    }, 3000)
    setTimeout(() => {
        addMsgToTitle("Guess Now");
        // addInputbox();
        let anwser = window.prompt("I know is confusing, but you think is: ")
        if (anwser) {
            socket.emit('final', { anwser: anwser });
        } else {
            alert("Enter a valid anwser")
        }
    }, 5000)
})

// room1 compare
socket.on('compare', (anwser) => {
    const prompt = msgElement.innerHTML
    const guess = anwser.anwser
    console.log(guess, prompt);

    const compareValue = guess.localeCompare(prompt);
   
    let Msg = {win:"WIN", fail:"FAIL"}
    if (compareValue == 0){
        // console.log("damn")
        socket.emit('win message',Msg.win)
    }else{
        socket.emit('fail message',Msg.fail)
    }
})

// final output
socket.on('win message',(msg)=>{
    addMsgToTitle(msg);
})

socket.on('fail message',(msg)=>{
    addMsgToTitle(msg);
})

socket.on('win message_',(msg)=>{
    addMsgToTitle(msg);
})

socket.on('fail message_',(msg)=>{
    addMsgToTitle(msg);
})


/*--------------- P5 CANVAS CODE ---------------*/
let myCanvas;

function setup() {
    myCanvas = createCanvas(800, 600);
    myCanvas.parent("canvas_id");
    background(255);

    console.log("P5");

    // *----- room2-4 sockets, recieving drawData from room1-3
    socket.on('mousePos', (drawObj) => {
        Draw(drawObj)
    })
}

function mouseDragged() {
    stroke(0);
    line(mouseX, mouseY, pmouseX, pmouseY);

    // 1) emit the draw event to server
    let mousePos = {
        x: mouseX,
        y: mouseY,
        px: pmouseX,
        py: pmouseY
    };
    socket.emit('data', mousePos);
    // collectDrawData(mousePos);

}

function Draw(drawObj) {
    stroke(255, 0, 0);
    line(drawObj.x, drawObj.y, drawObj.px, drawObj.py);
}


// function collectDrawData(mousePos) {
//     // console.log("data from call back");
//     socket.emit('data', mousePos);
// }





/*--------------- countdown timer ---------------*/
// counter 减一遍，1000走一遍

// function countDown(sec) {
//     let counter = sec
//     const interval = setInterval(() => {
//         counter--;
//         if (counter < 0) {
//             clearInterval(interval);
//             console.log("time is up")
//         }
//     }, 1000)
// }

// countDown(3)


// socket.on('enable draw', (msg)=>{
//     console.log(msg.msg);

//     let mousePos = {
//         x: mouseX,
//         y: mouseY,
//         px: pmouseX,
//         py: pmouseY
//     };
//     collectDrawData(mousePos);
// })







// xxxxxxxxxxxxxxxxxxxxxxxxxxx ignore the rest

// /*--------------- Window Prompt ---------------*/
// let userName = window.prompt("Vistor name");
// console.log(userName);

// //Check if a name was entered
// if (userName) {
//     //Emit Msg to join the room
//     socket.emit('user', { "user": userName });
// }
// else {
//     alert("Enter a vistor name to start the game");
// }

// socket.on('newUser',(Obj)=>{
//     console.log(Obj.userName,"status: ",Obj.msg)
// })


/*--------------- P5 CANVAS CODE ---------------*/
// let myR;
// let myG;
// let myB;

// function setup() {
//     let myCanvas = createCanvas(800, 600);
//     myCanvas.parent("canvas_id");
//     background(255);

//     myR = random(255);
//     myG = random(255);
//     myB = random(255);

//     // 4) ALL Clients Receive Message from Server 
//     socket.on('dataAll', (obj) => {
//         drawPos(obj);
//     })
// }

// function draw() {
//     stroke(0);
//     if (mouseIsPressed === true) {
//         line(mouseX, mouseY, pmouseX, pmouseY);

//         // 1) emit the draw event to server
//         let mousePos = {
//             x: mouseX,
//             y: mouseY,
//             px: pmouseX,
//             py: pmouseY
//         };
//         // socket.emit('data', mousePos);
//         collectDrawData(mousePos);
//     }
// }





