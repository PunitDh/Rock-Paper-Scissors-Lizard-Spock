class Game {
  constructor() {
    this.rooms = [];
    this.players = [];
    this.sockets = [];
    this.WINNERS = {
      Rock: ["Scissors", "Lizard"],
      Scissors: ["Paper", "Lizard"],
      Paper: ["Rock", "Spock"],
      Lizard: ["Spock", "Paper"],
      Spock: ["Scissors", "Rock"],
    };

    this.WINNING_METHODS = {
      Rock: ["crushes Scissors", "crushes Lizard"],
      Scissors: ["cuts Paper", "decapitates Lizard"],
      Paper: ["covers Rock", "disproves Spock"],
      Lizard: ["poisons Spock", "eats Paper"],
      Spock: ["smashes Scissors", "vaporizes Rock"],
    };
  }

  createNewSocket(socketId, name) {
    const socket = new Socket(socketId, name);
    this.sockets.push(socket);
  }

  getPlayerBySocketId(socketId) {
    return this.players.filter((player) => player.id.includes(socketId))[0];
  }

  deleteRoomByPlayerName(name) {
    this.rooms = this.rooms.filter((room) => !room.room.includes(name));
  }

  deletePlayerBySocketId(socketId) {
    this.players = this.players.filter(
      (player) => !player.id.includes(socketId)
    );
  }

  createNewPlayer(name, socketId) {
    const player = new Player(name, socketId);
    this.joinRoom();
    this.players.push(player);
    this.rooms = unique(this.players.map((player) => player.room));
    return player;
  }

  getAllRooms() {
    return unique(this.rooms);
  }

  getCurrentPlayersRoom(player) {
    return player.room;
  }

  getCurrentPlayers() {
    return this.players;
  }

  findRoomByPlayerName(name) {
    return this.players.filter((player) => player.name === name)[0].room;
  }

  joinRoom() {
    this.players.forEach((player, index) => {
      if (index != 0 && index % 2 != 0) {
        player.room = this.players[index - 1].room;
      }
    });
  }
}

class Socket {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Player {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.id = `Player-${socketId}`;
    this.room = new Room(name, socketId);
  }

  getOpponent() {
    return this.room.players.filter((player) => player.name !== this.name)[0];
  }
}

class Room {
  constructor(player) {
    this.players = [];
    this.roomId = `Room-${player.name}-${player.socketId}`;
    this.scores = {};
    this.moves = [];
  }

  getPlayerByName(name) {
    return this.players.filter((player) => player.name === name)[0];
  }

  playerLength() {
    return this.players.length;
  }

  decideWinner() {
    const [move1, move2] = this.moves;
    if (unique(this.moves).length == 1) {
      return { winner: "Tie", method: "Tie" };
    } else {
      if (this.WINNERS[move1].includes(move2)) {
        const winner = this.moves.filter((m) => m.move === move1)[0];
        console.log(this.WINNERS[move1].indexOf(move2));
        const method =
          this.WINNING_METHODS[move1][this.WINNERS[move1].indexOf(move2)];
        return { winner, method };
      }
      if (this.WINNERS[move2].includes(move1)) {
        const winner = moves.filter((m) => m.move === move2)[0];
        console.log(this.WINNERS[move2].indexOf(move1));
        const method =
          this.WINNING_METHODS[move2][this.WINNERS[move2].indexOf(move1)];
        return { winner, method };
      }
    }
  }

  getMoves() {
    return this.moves;
  }

  addMove(name, move) {
    const player = this.getPlayerByName(name);
    this.moves.push(new Move(player, move));
  }

  clearMoves() {
    this.moves = [];
  }

  incrementScore(name, score = 1) {
    this.scores[name] += score;
  }

  setDefaultScores() {
    this.scores = {
      [this.players[0].name]: 0,
      [this.players[1].name]: 0,
    };
  }

  remainingPlayer() {
    const lastMovePlayerName = this.moves[this.moves.length - 1].player.name;
    return this.players.filter(
      (player) => player.name !== lastMovePlayerName
    )[0];
  }

  getScores() {
    return this.scores;
  }
}

class Move {
  constructor(player, move) {
    this.player = player;
    this.move = move;
  }
}

function unique(arr) {
  const uniq = Array.from(new Set(arr));
  this.length = uniq.length;
  return uniq;
}

module.exports = { Game, Player, Room, Moves };
