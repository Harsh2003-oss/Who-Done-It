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

resolveNight(game){
    const killActions = game.nightActions.filter(
        action => action.action === "KILL"
    )

    if(killActions.length===0){
        game.phase = "DAY";
        return
    }

    const saveAction = game.nightActions.find(
        action => action.action === "SAVE"
    )

actions.forEach(kill => {
    const targetPlayer = game.players.find(
        player => player.playerId === kill.targetPlayerId
    )
})

if(!targetPlayer){
    return
}

if(
    saveAction && saveAction.targetPlayerId === kill.targetPlayerId
){
    return
}

targetPlayer.alive = false;


game.nightActions = []

game.phase = "DaY"

}

startVoting(game){
 
    if(game.phase !== "DAY"){
        return;
    }

    game.votes = [];

    game.phase = "VOTING";
}


submitVote(game, voterId, targetPlayerId){
    const isVoter = game.players.find(
        voter => voter.player === voterId
    )

    if(!isVoter){
        return
    }

    if(!isVoter.alive){
        return
    }

    if(game.phase !== "VOTING"){
        return;
    }

    const target = game.players.find(
        target => target.playerId === targetPlayerId
    )

    if(!target  || !target.alive ){
        return;
    }

const existingVote = game.votes.find(
    vote => vote.voterId === voterId
)


if(existingVote){
    return
}


const vote = {
    voterId:voterId,
    targetPlayerId:targetPlayerId,
    round:game.round
}

game.votes.push(vote);

}


resolveVotes(game) {

    if (game.phase !== "VOTING") {
        return;
    }

    const voteCounts = {};

    // Count votes
    for (const vote of game.votes) {

        if (!voteCounts[vote.targetPlayerId]) {
            voteCounts[vote.targetPlayerId] = 0;
        }

        voteCounts[vote.targetPlayerId]++;
    }

    // No votes
    if (Object.keys(voteCounts).length === 0) {
        game.votes = [];
        game.phase = "NIGHT";
        game.round++;
        return;
    }

    // Find player with highest votes
    let eliminatedPlayerId = null;
    let highestVotes = 0;

    for (const playerId in voteCounts) {

        if (voteCounts[playerId] > highestVotes) {
            highestVotes = voteCounts[playerId];
            eliminatedPlayerId = playerId;
        }
    }

    // Find eliminated player
    const eliminatedPlayer = game.players.find(
        player => player.playerId === eliminatedPlayerId
    );

    if (eliminatedPlayer) {
        eliminatedPlayer.alive = false;
    }

    // Clear votes
    game.votes = [];

    // Move to next round
    game.round++;
    game.phase = "NIGHT";
} 

checkWinCondition(game) {

    // Find alive Mafia
    const aliveMafia = game.players.filter(
        player => player.role === "MAFIA" && player.alive
    );

    // Find alive Town players
    const aliveTown = game.players.filter(
        player => player.role !== "MAFIA" && player.alive
    );

    // Town wins if no Mafia are alive
    if (aliveMafia.length === 0) {
        game.status = "FINISHED";
        game.phase = "GAME_OVER";
        game.winner = "TOWN";

        return "TOWN";
    }

    // Mafia wins if Mafia >= Town
    if (aliveMafia.length >= aliveTown.length) {
        game.status = "FINISHED";
        game.phase = "GAME_OVER";
        game.winner = "MAFIA";

        return "MAFIA";
    }

    // Game continues
    return null;
}

}

module.exports = GameEngine;