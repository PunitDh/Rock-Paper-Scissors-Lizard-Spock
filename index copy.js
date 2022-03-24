const cors = require("cors");
const express = require("express");
const app = express();
var http = require("http").Server(app);
const io = require("socket.io")(http);
const { unique, tabulate, log } = require("./utils");
const { Game, Player } = require("./Game_copy");

app.use(cors());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.status(200).sendFile("index.html", { root: __dirname });
});

let PLAYERS = [];
let current_rooms = [];
let MOVES = {};
let SCORES = {
  "blah-room": { "blah1-name": 0, "blah2-name": 0 },
};

const game = new Game();

io.on("connection", (socket) => {
  console.log("New connection started with socketID:", socket.id);

  socket.on("new-user", (name) => {
    game.createNewSocket(socket.id, name);
    const player = game.createNewPlayer(name, socket.id);
    tabulate("Current users connected:", game.getCurrentPlayers());
    const current_rooms = game.getAllRooms();
    const currentUsersRoom = game.getCurrentPlayersRoom(player);
    console.log("Current rooms:");
    tabulate(current_rooms);
    io.emit("room-joining-message", currentUsersRoom, player);

    if (currentUsersRoom.playerLength() == 2) {
      const opponentPlayer = player.getOpponent();
      io.emit("opponent-joining-message", opponentPlayer);
      currentUsersRoom.clearMoves();
      currentUsersRoom.setDefaultScores();
      console.log(currentUsersRoom.getScores());
    }
  });

  socket.on("new-game", (name) => {
    const room = game.findRoomByPlayerName(name);
    room.clearMoves();
  });

  socket.on("make-move", ({ name, move }) => {
    if (current_rooms) {
      const currentUsersRoom = game.findRoomByPlayerName(name);
      const movesInCurrentRoom = currentUsersRoom.getMoves();
      console.log({ currentUsersRoom });
      if (movesInCurrentRoom) {
        currentUsersRoom.addMove(name, move);

        console.log({ moves: movesInCurrentRoom.length });

        if (movesInCurrentRoom.length == 2) {
          io.emit("all-moves-in");
          const { winner, method } = currentUsersRoom.decideWinner();
          currentUsersRoom.incrementScore(winner.name);
          io.emit(
            "winner-decided",
            winner,
            method,
            movesInCurrentRoom,
            currentUsersRoom.getScores()
          );
        } else {
          const remainingPerson = currentUsersRoom.remainingPlayer();
          io.emit("one-move-in", remainingPerson);
        }
      }
      console.log(currentUsersRoom.getMoves());
      console.log(currentUsersRoom.getScores());
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", game.getPlayerBySocketId(socket.id));
    tabulate("Current users connected:", PLAYERS);
    io.emit("disconnect-message", game.getPlayerBySocketId(socket.id));
    game.deleteRoomByPlayerName(game.getPlayerBySocketId(socket.id).name);
    game.deletePlayerBySocketId(socket.id);
  });
});

http.listen(5010, () => console.log("Server started on port 5010"));
