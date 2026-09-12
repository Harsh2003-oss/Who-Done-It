const express = require('express');
const app = express();
 const http = require('http');
const server = http.createServer(app);

const {Server} = require("socket.io");

const io = new Server(server,{
    cors:{
        origin:"*",
        methods: ["GET", "POST"]
    }
});

// --- Socket.io Event Handling Pipeline ---

io.on('connection',(socket) =>{
    console.log("new connection established")

socket.on("room:join",(data) => {
    const roomId = data.roomId;
    const username = data.username;

    socket.join(roomId);


    io.to(roomId).emit("room:update",{
        message :`${username} joined the room`
    })

})

    socket.on('disconnect',() =>{
        console.log("user disconnected")
    })
})



const PORT = 3000;
const GameEngine = require("./src/core/engine/GameEngine");

const engine = new GameEngine();

const game = engine.createGame();


engine.addPlayer(game, "Rahul");
engine.addPlayer(game, "Priya");
engine.addPlayer(game, "Aman");
engine.addPlayer(game,'Harsh')
engine.addPlayer(game,"Aayush")

engine.startGame(game);


app.post('/try',(req,res)=>{
console.log("recieved")
res.sendStatus(200);
})


server.listen(PORT,()=>{
console.log("listnening on")
})