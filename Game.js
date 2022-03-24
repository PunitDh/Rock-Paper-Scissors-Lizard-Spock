class Game {
  constructor() {
    this.rooms = [];
    this.players = [];
  }

  get roomIDs() {
    return this.rooms.map((room) => room.id);
  }

  get playerIds() {
    return this.players.map((player) => player.id);
  }

  createRoom(roomName) {
    const room = new Room(roomName);
    room.id = `Room-${roomName}-${this.rooms.length}`;
    this.rooms.push(room);
    return room;
  }

  createPlayer(playerName, socketId) {
    const player = new Player(playerName, socketId);
    this.players.push(player);
    return player;
  }

  findPlayerByPlayerId(playerId) {
    return this.players.filter((player) => player.id === playerId)[0];
  }

  findRoomByRoomId(roomId) {
    return this.rooms.filter((room) => room.id === roomId)[0];
  }

  findPlayersInRoom(room) {
    return this.rooms.filter((r) => room.id === r.id)[0].players;
  }

  addPlayerToRoom(roomId, player) {
    const room = this.findRoomByRoomId(roomId);
    const player = this.findPlayerByPlayerId(player.id);
    room.addPlayer(player);
  }

  deleteRoom(roomId) {
    this.rooms = this.rooms.filter((room) => room.id !== roomId);
  }
}

const game = new Game();

class Player {
  constructor(name, socketId) {
    this.game = game;
    this.name = name;
    this.id = `Player-${socketId}`;
    this.room = null;
  }

  find(finder) {
    if (typeof finder === "string") {
      return this.game.findPlayerByPlayerId(finder);
    }
  }

  get opponent() {
    return this.room;
  }

  assignRoom(roomId) {
    this.game.addPlayerToRoom(roomId, this);
  }
}

class Room {
  constructor(roomName) {
    this.game = game;
    this.roomName = roomName;
    this.players = [];
    this.scores = {};
    this.moves = [];
  }

  setScore(player, score) {
    if (player.name in this.scores) {
      scores[player.id] = score;
    }
  }

  getScore(player) {
    if (player.id in this.scores) {
      return scores[player.name];
    }
  }

  addPlayer(player) {
    player.room = this.id;
    this.players.push(player);
  }

  find(roomId) {
    if (typeof roomId === "string") {
      return this.game.findRoomByRoomId();
    }
  }

  getAllPlayers() {
    return this.players;
  }

  getPlayer(playerId) {
    return this.players.filter((player) => player.id === playerId)[0];
  }
}

function Moves() {
  return game.moves;
}

module.exports = { Player, Room, Moves };
