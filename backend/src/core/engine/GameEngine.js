const GameState = require("../state/GameState");
const crypto = require("crypto");

class GameEngine {

    // -----------------------------------
    // Create a new game
    // -----------------------------------
    createGame() {
        const game = new GameState();

        game.gameId = crypto.randomUUID();

        return game;
    }


    // -----------------------------------
    // Add a player to the game
    // -----------------------------------
    addPlayer(game, username) {

        if (!username) {
            return;
        }

        // V1: maximum 5 players
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


    // -----------------------------------
    // Start the game
    // -----------------------------------
    startGame(game) {

        // V1 requires exactly 5 players
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


        // Fisher-Yates shuffle
        for (let i = roles.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [roles[i], roles[j]] = [roles[j], roles[i]];
        }


        // Assign roles
        for (let i = 0; i < game.players.length; i++) {
            game.players[i].role = roles[i];
        }


        game.status = "RUNNING";
        game.phase = "NIGHT";
        game.round = 1;

        return game;
    }


    // -----------------------------------
    // Submit a night action
    // -----------------------------------
    submitNightAction(game, playerId, action, targetPlayerId) {

        // 1. Game must be in NIGHT phase
        if (game.phase !== "NIGHT") {
            return;
        }


        // 2. Find the player performing the action
        const player = game.players.find(
            player => player.playerId === playerId
        );


        // 3. Player must exist
        if (!player) {
            return;
        }


        // 4. Player must be alive
        if (!player.alive) {
            return;
        }


        // 5. Check whether player has already submitted
        // an action this night
        const existingAction = game.nightActions.find(
            action => action.playerId === playerId
        );

        if (existingAction) {
            return;
        }


        // 6. Check whether the role allows the action

        if (player.role === "MAFIA" && action !== "KILL") {
            return;
        }

        if (player.role === "DOCTOR" && action !== "SAVE") {
            return;
        }

        // Villagers don't have night actions
        if (player.role === "VILLAGER") {
            return;
        }


        // 7. Find target
        const targetPlayer = game.players.find(
            player => player.playerId === targetPlayerId
        );


        // 8. Target must exist
        if (!targetPlayer) {
            return;
        }


        // 9. Target must be alive
        if (!targetPlayer.alive) {
            return;
        }


        // 10. Create action
        const nightAction = {
            playerId: playerId,
            action: action,
            targetPlayerId: targetPlayerId,
            round: game.round
        };


        // 11. Store action
        game.nightActions.push(nightAction);

        return nightAction;
    }


    // -----------------------------------
    // Resolve night actions
    // -----------------------------------
    resolveNight(game) {

        if (game.phase !== "NIGHT") {
            return;
        }


        // Find all Mafia kill actions
        const killActions = game.nightActions.filter(
            action => action.action === "KILL"
        );


        // Find Doctor save action
        const saveAction = game.nightActions.find(
            action => action.action === "SAVE"
        );


        // Resolve every Mafia kill
        killActions.forEach(kill => {

            const targetPlayer = game.players.find(
                player => player.playerId === kill.targetPlayerId
            );


            // Target doesn't exist
            if (!targetPlayer) {
                return;
            }


            // Target was saved by Doctor
            if (
                saveAction &&
                saveAction.targetPlayerId === kill.targetPlayerId
            ) {
                return;
            }


            // Kill target
            targetPlayer.alive = false;
        });


        // Clear night actions
        game.nightActions = [];


        // Check whether someone has won
        const winner = this.checkWinCondition(game);

        if (winner) {
            return;
        }


        // Move to DAY
        game.phase = "DAY";

        return game;
    }


    // -----------------------------------
    // Start voting
    // -----------------------------------
    startVoting(game) {

        if (game.phase !== "DAY") {
            return;
        }


        // Clear previous votes
        game.votes = [];


        // Move to voting
        game.phase = "VOTING";

        return game;
    }


    // -----------------------------------
    // Submit a vote
    // -----------------------------------
    submitVote(game, voterId, targetPlayerId) {

        // Game must be in voting phase
        if (game.phase !== "VOTING") {
            return;
        }


        // Find voter
        const voter = game.players.find(
            player => player.playerId === voterId
        );


        // Voter must exist
        if (!voter) {
            return;
        }


        // Voter must be alive
        if (!voter.alive) {
            return;
        }


        // Find target
        const target = game.players.find(
            player => player.playerId === targetPlayerId
        );


        // Target must exist and be alive
        if (!target || !target.alive) {
            return;
        }


        // Player can vote only once
        const existingVote = game.votes.find(
            vote => vote.voterId === voterId
        );


        if (existingVote) {
            return;
        }


        // Create vote
        const vote = {
            voterId: voterId,
            targetPlayerId: targetPlayerId,
            round: game.round
        };


        // Store vote
        game.votes.push(vote);

        return vote;
    }


    // -----------------------------------
    // Resolve votes
    // -----------------------------------
    resolveVotes(game) {

        if (game.phase !== "VOTING") {
            return;
        }


        const voteCounts = {};


        // -----------------------------------
        // Count votes
        // -----------------------------------
        for (const vote of game.votes) {

            if (!voteCounts[vote.targetPlayerId]) {
                voteCounts[vote.targetPlayerId] = 0;
            }

            voteCounts[vote.targetPlayerId]++;
        }


        // -----------------------------------
        // No votes
        // -----------------------------------
        if (Object.keys(voteCounts).length === 0) {

            game.votes = [];

            game.round++;

            game.phase = "NIGHT";

            return game;
        }


        // -----------------------------------
        // Find highest vote count
        // -----------------------------------
        let highestVotes = 0;

        for (const playerId in voteCounts) {

            if (voteCounts[playerId] > highestVotes) {
                highestVotes = voteCounts[playerId];
            }
        }


        // -----------------------------------
        // Find everyone with highest votes
        // -----------------------------------
        const playersWithHighestVotes = [];

        for (const playerId in voteCounts) {

            if (voteCounts[playerId] === highestVotes) {
                playersWithHighestVotes.push(playerId);
            }
        }


        // -----------------------------------
        // Tie
        // -----------------------------------
        if (playersWithHighestVotes.length > 1) {

            // Nobody is eliminated on a tie
            game.votes = [];

            game.round++;

            game.phase = "NIGHT";

            return game;
        }


        // -----------------------------------
        // Eliminate player
        // -----------------------------------
        const eliminatedPlayerId = playersWithHighestVotes[0];


        const eliminatedPlayer = game.players.find(
            player => player.playerId === eliminatedPlayerId
        );


        if (eliminatedPlayer) {
            eliminatedPlayer.alive = false;
        }


        // -----------------------------------
        // Check winner
        // -----------------------------------
        const winner = this.checkWinCondition(game);

        if (winner) {
            game.votes = [];

            return game;
        }


        // -----------------------------------
        // Prepare next round
        // -----------------------------------
        game.votes = [];

        game.round++;

        game.phase = "NIGHT";

        return game;
    }


    // -----------------------------------
    // Check win condition
    // -----------------------------------
    checkWinCondition(game) {

        // Find alive Mafia
        const aliveMafia = game.players.filter(
            player =>
                player.role === "MAFIA" &&
                player.alive
        );


        // Find alive Town players
        const aliveTown = game.players.filter(
            player =>
                player.role !== "MAFIA" &&
                player.alive
        );


        // -----------------------------------
        // Town wins
        // -----------------------------------
        if (aliveMafia.length === 0) {

            game.status = "FINISHED";

            game.phase = "GAME_OVER";

            game.winner = "TOWN";

            return "TOWN";
        }


        // -----------------------------------
        // Mafia wins
        // -----------------------------------
        if (aliveMafia.length >= aliveTown.length) {

            game.status = "FINISHED";

            game.phase = "GAME_OVER";

            game.winner = "MAFIA";

            return "MAFIA";
        }


        // -----------------------------------
        // Game continues
        // -----------------------------------
        return null;
    }
}


module.exports = GameEngine;