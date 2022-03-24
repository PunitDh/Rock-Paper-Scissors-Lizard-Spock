class Game {
  constructor() {
    this.rooms = [];
    this.players = [];
  }

  createRoom(roomName) {
    const room = new Room(roomName);
    room.id = this.rooms.length;
    this.rooms.push(room);
    return room;
  }

  createPlayer(playerName) {
    const player = new Player(playerName);
    player.id = this.players.length;
    this.players.push(player);
    return player;
  }

  deleteRoom(roomId) {}
}

class Player {
  constructor(name) {
    this.name = name;
  }

  assignRoom(roomId) {}
}

class Room {
  constructor(roomName) {
    this.roomName = roomName;
    this.players = [];
  }

  addPlayer(player) {
    player.room = this.id;
    this.players.push(player);
  }
}

module.exports = { Game, Player, Room };
