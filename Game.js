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

  tabulate(header, data) {
    console.log(header);
    console.table(data);
  }

  createNewSocket(socketId, name) {
    const socket = new Socket(socketId, name);
    this.sockets.push(socket);
  }

  getPlayerBySocketId(socketId) {
    return this.players.filter((player) =>
      player.socketId.includes(socketId)
    )[0];
  }

  deleteRoomByPlayerName(name) {
    this.rooms = this.rooms.filter(
      (room) => !room.players.map((player) => player.name).includes(name)
    );
  }

  deletePlayerBySocketId(socketId) {
    this.players = this.players.filter(
      (player) => !player.id.includes(socketId)
    );
  }

  getOpponent(player) {
    return this.getPlayerByPlayerId(
      player.room.players.find((pId) => pId !== player.id)
    );
  }

  getPlayerByName(name) {
    return this.players.find((player) => player.name === name);
  }

  createNewPlayer(name, socketId) {
    const player = new Player(name, socketId);
    this.players.push(player);
    player.joinRoom(this.players, this.rooms);
    this.rooms = this.players.map((player) => player.room);
    return player;
  }

  assignPlayerToRoom(player, room) {}

  getAllRooms() {
    return this.rooms;
  }

  getCurrentPlayersRoom(player) {
    return player.room;
  }

  getCurrentPlayers() {
    return this.players;
  }

  findRoomByPlayerName(name) {
    return this.players
      .map((player) => {
        if (player.name === name) return player.room;
      })
      .filter((n) => n)[0];
  }

  getPlayerByPlayerId(playerId) {
    return this.players.find((player) => player.id === playerId);
  }

  setDefaultScores(room) {
    const playerNames = room.players.map(
      (playerId) => this.getPlayerByPlayerId(playerId).name
    );

    room.scores = {
      [playerNames[0]]: 0,
      [playerNames[1]]: 0,
    };
  }

  getRemainingPlayer(room) {
    const lastMovePlayerName = room.moves[0].playerName;
    return this.players.find((player) => player.name !== lastMovePlayerName);
  }

  decideWinner(room) {
    const [move1, move2] = room.moves.map((m) => m.move);

    console.log({ move1, move2 });

    const findWinner = (move1, move2) => {
      if (this.WINNERS[move1].includes(move2)) {
        const winner = this.getPlayerByName(
          room.moves.find((m) => m.move === move1).playerName
        );
        const method =
          this.WINNING_METHODS[move1][this.WINNERS[move1].indexOf(move2)];
        return { winner, method };
      }
    };

    if (move1 === move2) {
      return { winner: "Tie", method: "Tie" };
    } else {
      const winner1 = findWinner(move1, move2);
      const winner2 = findWinner(move2, move1);

      return winner1 || winner2;
    }
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
  }

  playMove(move) {
    this.room.moves.push(new Move(this.name, move));
  }

  joinRoom(players, rooms) {
    if (players.length % 2 == 0 && players.length > 0) {
      this.room = rooms[rooms.length - 1];
    } else {
      this.room = new Room(this);
    }
    this.room.players.push(this.id);
  }
}

class Room {
  constructor(player) {
    this.players = [];
    this.id = `Room-${player.name}-${player.socketId}`;
    this.scores = {};
    this.moves = [];
  }

  get playerLength() {
    return this.players.length;
  }

  getMoves() {
    return this.moves;
  }

  clearMoves() {
    this.moves = [];
  }

  incrementScore(name, score = 1) {
    this.scores[name] += score;
  }

  getScores() {
    return this.scores;
  }
}

class Move {
  constructor(playerName, move) {
    this.playerName = playerName;
    this.move = move;
  }
}

module.exports = { Game, Player, Room };
