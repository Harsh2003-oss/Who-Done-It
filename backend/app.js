const express = require('express');
const app = express();
 const http = require('http');
const server = http.createServer(app);

const {Server} = require("socket.io");

const PORT = 3000;
const GameEngine = require("./src/core/engine/GameEngine");

const engine = new GameEngine();

const games = {};


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


    if(!games[roomId]){
games[roomId] = engine.createGame();
    }

    const game = games[roomId]

const player = engine.addPlayer(game,username);    

if (!player) {
    console.log("Player could not be added");
    return;
}

player.socketId = socket.id;
player.connected = true;

if (game.players.length === 1) {
    game.hostPlayerId = player.playerId;
}

socket.emit("room:joined", {
    roomId,
    player,
    isHost: game.hostPlayerId === player.playerId
});

    console.log(`${username} joined room ${roomId}`);

    socket.join(roomId);


    io.to(roomId).emit("room:update",{
        message :`${username} joined the room`,
        players:game.players
    })

})

    socket.on('disconnect',() =>{
        console.log("user disconnected")
    })
})


app.get("/try", (req, res) => {
        console.log("GET /try received");
    res.send("GET request is working");
});

app.post('/try',(req,res)=>{
console.log("recieved")
res.sendStatus(200);
})


server.listen(PORT,()=>{
console.log("listnening on")
})