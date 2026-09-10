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

}

module.exports = GameEngine;