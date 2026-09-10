const express = require('express');
const app = express();

const PORT = 3000;
const GameEngine = require("./src/core/engine/GameEngine");

const engine = new GameEngine();

const game = engine.createGame();


engine.addPlayer(game, "Rahul");
engine.addPlayer(game, "Priya");
engine.addPlayer(game, "Aman");

console.log(game);

app.post('/try',(req,res)=>{
console.log("recieved")
res.status(200);
})


app.listen(PORT,()=>{
console.log("listnening on")
})