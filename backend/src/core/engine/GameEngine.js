const GameState = require("../state/GameState");
const crypto = require('crypto');


class GameEngine {

    createGame() {
        const game = new GameState();

        return game;
    }

    addPlayer(game,username){
        const player = {
            playerId: crypto.randomUUID() ,
             username: username,
        role: null,
        alive: true,
        connected: false
        }

        game.players.push(player);
    }

    startGame(game){
        const role = ["MAFIA", "MAFIA", "DOCTOR", "VILLAGER", "VILLAGER"];
   
        for(let i=role.length-1;i>=0;i--){
const j = Math.floor(Math.random() * (i+1));

[role[i] ,role[j] = role[j] ,role[i]]

game.players[i].role = role[i];


        }

        game.status = "RUNNING";
game.phase = "NIGHT";
game.round = 1;
   
    }

}

module.exports = GameEngine;