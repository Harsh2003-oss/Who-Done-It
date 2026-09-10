class GameState {
    constructor() {
        this.gameId = null;
        this.status = "LOBBY";
        this.phase = "LOBBY";
        this.round = 0;

        this.players = [];
        this.nightActions = [];
        this.votes = [];

        this.winner = null;
    }
}


module.exports = GameState;