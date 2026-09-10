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

submitNightAction(game, playerId, action, targetPlayerId) {

    // 1. Find the player
    const player = game.players.find(
        player => player.playerId === playerId
    );

    // 2. Player must exist
    if (!player) {
        return;
    }

    // 3. Player must be alive
    if (!player.alive) {
        return;
    }

    // 4. Game must currently be in NIGHT phase
    if (game.phase !== "NIGHT") {
        return;
    }

    // Check whether the player's role allows the action
    if (player.role === "MAFIA" && action !== "KILL") {
        return;
    }

    if (player.role === "DOCTOR" && action !== "SAVE") {
        return;
    }

    if (player.role === "VILLAGER") {
        return;
    }

    const targetPlayer = game.players.find(
        player => player.playerId === playerId
    )

    if(!targetPlayer){
        return;
    }

    if(!targetPlayer.alive){
        return
    }

    const nightAction = {
        playerId: playerId,
        action: action,
        targetPlayerId: targetPlayerId,
        round: game.round
    };

    // 10. Store the action
    game.nightActions.push(nightAction);

    return nightAction;

}

}

module.exports = GameEngine;