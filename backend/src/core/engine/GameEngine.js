const GameState = require("../state/GameState");
const crypto = require("crypto");

class GameEngine {

    createGame() {
        const game = new GameState();

        game.gameId = crypto.randomUUID();

        return game;
    }

    addPlayer(game, username) {

        if (!username) {
            return;
        }

         if (game.players.length >= 5) {
            return;
        }

        const player = {
            playerId: crypto.randomUUID(),
            username: username,
            role: null,
            alive: true,
            connected: false
        };

        game.players.push(player);      

        return player;

         
    }

    startGame(game) {

        if (game.players.length !== 5) {
            return;
        }

        const roles = [
            "MAFIA",
            "MAFIA",
            "DOCTOR",
            "VILLAGER",
            "VILLAGER"
        ];

        for (let i = roles.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        for (let i = 0; i < game.players.length; i++) {
            game.players[i].role = roles[i];
        }

        game.status = "RUNNING";
        game.phase = "NIGHT";
        game.round = 1;

        return game;
    }

    submitNightAction(game, playerId, action, targetPlayerId) {

        if (game.phase !== "NIGHT") {
            return;
        }

        const player = game.players.find(
            player => player.playerId === playerId
        );

        if (!player) {
            return;
        }

        if (!player.alive) {
            return;
        }

        const existingAction = game.nightActions.find(
            action => action.playerId === playerId
        );

        if (existingAction) {
            return;
        }

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
            player => player.playerId === targetPlayerId
        );

        if (!targetPlayer) {
            return;
        }

        if (!targetPlayer.alive) {
            return;
        }

        const nightAction = {
            playerId: playerId,
            action: action,
            targetPlayerId: targetPlayerId,
            round: game.round
        };

        game.nightActions.push(nightAction);

        return nightAction;
    }

    resolveNight(game) {

        if (game.phase !== "NIGHT") {
            return;
        }

        const killActions = game.nightActions.filter(
            action => action.action === "KILL"
        );

        const saveAction = game.nightActions.find(
            action => action.action === "SAVE"
        );

        killActions.forEach(kill => {

            const targetPlayer = game.players.find(
                player => player.playerId === kill.targetPlayerId
            );

            if (!targetPlayer) {
                return;
            }

            if (
                saveAction &&
                saveAction.targetPlayerId === kill.targetPlayerId
            ) {
                return;
            }

            targetPlayer.alive = false;
        });

        game.nightActions = [];

        const winner = this.checkWinCondition(game);

        if (winner) {
            return;
        }

        game.phase = "DAY";

        return game;
    }

    startVoting(game) {

        if (game.phase !== "DAY") {
            return;
        }

        game.votes = [];

        game.phase = "VOTING";

        return game;
    }

    submitVote(game, voterId, targetPlayerId) {

        if (game.phase !== "VOTING") {
            return;
        }

        const voter = game.players.find(
            player => player.playerId === voterId
        );

        if (!voter) {
            return;
        }

        if (!voter.alive) {
            return;
        }

        const target = game.players.find(
            player => player.playerId === targetPlayerId
        );

        if (!target || !target.alive) {
            return;
        }

        const existingVote = game.votes.find(
            vote => vote.voterId === voterId
        );

        if (existingVote) {
            return;
        }

        const vote = {
            voterId: voterId,
            targetPlayerId: targetPlayerId,
            round: game.round
        };

        game.votes.push(vote);

        return vote;
    }

    resolveVotes(game) {

        if (game.phase !== "VOTING") {
            return;
        }

        const voteCounts = {};

        for (const vote of game.votes) {

            if (!voteCounts[vote.targetPlayerId]) {
                voteCounts[vote.targetPlayerId] = 0;
            }

            voteCounts[vote.targetPlayerId]++;
        }

        if (Object.keys(voteCounts).length === 0) {

            game.votes = [];
            game.round++;
            game.phase = "NIGHT";

            return game;
        }

        let highestVotes = 0;

        for (const playerId in voteCounts) {

            if (voteCounts[playerId] > highestVotes) {
                highestVotes = voteCounts[playerId];
            }
        }

        const playersWithHighestVotes = [];

        for (const playerId in voteCounts) {

            if (voteCounts[playerId] === highestVotes) {
                playersWithHighestVotes.push(playerId);
            }
        }

        if (playersWithHighestVotes.length > 1) {

            game.votes = [];
            game.round++;
            game.phase = "NIGHT";

            return game;
        }

        const eliminatedPlayerId = playersWithHighestVotes[0];

        const eliminatedPlayer = game.players.find(
            player => player.playerId === eliminatedPlayerId
        );

        if (eliminatedPlayer) {
            eliminatedPlayer.alive = false;
        }

        const winner = this.checkWinCondition(game);

        if (winner) {
            game.votes = [];

            return game;
        }

        game.votes = [];
        game.round++;
        game.phase = "NIGHT";

        return game;
    }

    checkWinCondition(game) {

        const aliveMafia = game.players.filter(
            player =>
                player.role === "MAFIA" &&
                player.alive
        );

        const aliveTown = game.players.filter(
            player =>
                player.role !== "MAFIA" &&
                player.alive
        );

        if (aliveMafia.length === 0) {

            game.status = "FINISHED";
            game.phase = "GAME_OVER";
            game.winner = "TOWN";

            return "TOWN";
        }

        if (aliveMafia.length >= aliveTown.length) {

            game.status = "FINISHED";
            game.phase = "GAME_OVER";
            game.winner = "MAFIA";

            return "MAFIA";
        }

        return null;
    }
}

module.exports = GameEngine;