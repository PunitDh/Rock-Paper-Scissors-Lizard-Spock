const cors = require("cors");
const express = require("express");
const app = express();
var http = require("http").Server(app);
const io = require("socket.io")(http);
const { Game } = require("./Game");

app.use(cors());
app.use(express.static(__dirname));

app.get("/", (_, res) => {
  res.status(200).sendFile("index.html", { root: __dirname });
});

const game = new Game();

io.on("connection", (socket) => {
  console.log("New connection started with socketID:", socket.id);

  socket.on("new-user", (name) => {
    game.createNewSocket(socket.id, name);
    const player = game.createNewPlayer(name, socket.id);
    game.tabulate("Current users connected:", game.getCurrentPlayers());
    const currentRooms = game.getAllRooms();

    io.emit("current-rooms", currentRooms);

    const currentUsersRoom = game.getCurrentPlayersRoom(player);
    game.tabulate("Current rooms:", currentRooms);

    io.emit("room-joining-message", currentUsersRoom, player);

    if (currentUsersRoom.playerLength == 2) {
      const players = currentUsersRoom.players.map((playerId) =>
        game.getPlayerByPlayerId(playerId)
      );
      io.emit("opponent-joining-message", players);
      currentUsersRoom.clearMoves();
      game.setDefaultScores(currentUsersRoom);
      console.log(currentUsersRoom.getScores());
    }
  });

  socket.on("new-game", (name) => {
    const room = game.findRoomByPlayerName(name);
    room.clearMoves();
  });

  socket.on("make-move", ({ name, move }) => {
    if (game.getAllRooms()) {
      const currentRoom = game.findRoomByPlayerName(name);
      const movesInCurrentRoom = currentRoom.getMoves();

      if (movesInCurrentRoom) {
        const player = game.getPlayerByName(name);
        player.playMove(move);

        console.log({ moves: movesInCurrentRoom.length });

        if (movesInCurrentRoom.length == 2) {
          io.emit("all-moves-in");
          const { winner, method } = game.decideWinner(currentRoom);
          console.log({ winner, method });

          currentRoom.incrementScore(winner.name);

          const winnerObj = {
            winner,
            method,
            moves: movesInCurrentRoom,
            scores: currentRoom.getScores(),
          };

          io.emit("winner-decided", winnerObj);
        } else {
          const remainingPerson = game.getRemainingPlayer(currentRoom);
          io.emit("one-move-in", remainingPerson);
        }
      }
      console.log(currentRoom.getMoves());
      console.log(currentRoom.getScores());
    }
  });

  socket.on("disconnect", () => {
    const currentPlayer = game.getPlayerBySocketId(socket.id);
    console.log({ currentPlayer });
    console.log("Disconnected", currentPlayer);
    game.tabulate("Current users connected:", game.getCurrentPlayers());
    io.emit("disconnect-message", currentPlayer);
    if (currentPlayer) {
      game.deleteRoomByPlayerName(currentPlayer.name);
      game.deletePlayerBySocketId(socket.id);
    }
  });
});

http.listen(process.env.PORT || 5010, () =>
  console.log("Server started on port", process.env.PORT)
);
