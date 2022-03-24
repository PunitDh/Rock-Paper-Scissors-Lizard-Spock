const cors = require("cors");
const express = require("express");
const app = express();
var http = require("http").Server(app);
const io = require("socket.io")(http);
const { unique } = require("./utils");

app.use(cors());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.status(200).sendFile("index.html", { root: __dirname });
});

let PLAYERS = [];
const SOCKETS = {};
let ROOMS = [];
let MOVES = {};
let SCORES = {
  "blah-room": { "blah1-name": 0, "blah2-name": 0 },
};

const WINNERS = {
  Rock: ["Scissors", "Lizard"],
  Scissors: ["Paper", "Lizard"],
  Paper: ["Rock", "Spock"],
  Lizard: ["Spock", "Paper"],
  Spock: ["Scissors", "Rock"],
};

const WINNING_METHODS = {
  Rock: ["crushes Scissors", "crushes Lizard"],
  Scissors: ["cuts Paper", "decapitates Lizard"],
  Paper: ["covers Rock", "disproves Spock"],
  Lizard: ["poisons Spock", "eats Paper"],
  Spock: ["smashes Scissors", "vaporizes Rock"],
};

io.on("connection", (socket) => {
  console.log("New connection started with socketID:", socket.id);

  socket.on("new-user", (name) => {
    SOCKETS[socket.id] = name;
    const newPlayer = {
      id: socket.id,
      name,
      room: `Room-${name}-${socket.id}`,
    };
    PLAYERS.push(newPlayer);
    joinRoom(PLAYERS);
    console.log("Current users connected:");
    console.table(PLAYERS);
    const current_rooms = Array.from(new Set(PLAYERS.map((user) => user.room)));
    ROOMS = current_rooms.map((room) => ({
      room,
      users: PLAYERS.filter((user) => room === user.room),
    }));
    const current_users_room = PLAYERS.filter((user) => user.name === name)[0];
    console.log("Current rooms:");
    console.table(ROOMS);
    io.emit("room-joining-message", current_users_room.room, name);
    const currentRoom = ROOMS.filter(
      (room) => room.room === current_users_room.room
    )[0];
    if (currentRoom.users.length == 2) {
      const opponent_user = currentRoom.users;
      io.emit("opponent-joining-message", opponent_user);
      MOVES[currentRoom.room] = [];
      SCORES[currentRoom.room] = {
        [name]: 0,
        [opponent_user.filter((r) => r.name !== name)[0].name]: 0,
      };
      console.log(SCORES);
    }
  });

  socket.on("new-game", (name) => {
    const room = PLAYERS.filter((user) => user.name === name)[0]?.room;
    if (room in MOVES) {
      MOVES[room] = [];
    }
  });

  socket.on("make-move", ({ name, move }) => {
    if (ROOMS) {
      const currentRoom = ROOMS.filter((room) =>
        room.users.filter((user) => user.name === name)
      )[0];
      const movesInCurrentRoom = MOVES[currentRoom.room];
      console.log({ currentRoom });
      console.log("room: ", currentRoom.room);
      if (movesInCurrentRoom) {
        movesInCurrentRoom.push({ name, move });

        console.log({ moves: movesInCurrentRoom.length });

        if (movesInCurrentRoom.length == 2) {
          io.emit("all-moves-in");
          const { winner, method } = decideWinner(movesInCurrentRoom);
          if (currentRoom.room in SCORES) {
            SCORES[currentRoom.room][winner.name] += 1;
            io.emit(
              "winner-decided",
              winner,
              method,
              movesInCurrentRoom,
              SCORES[currentRoom.room]
            );
          }
        } else {
          const remainingPerson = currentRoom.users.filter(
            (user) => user.name !== name
          )[0];
          io.emit("one-move-in", remainingPerson);
        }
      }
      console.log(MOVES);
      console.log(SCORES);
    }
  });

  socket.on("disconnect", () => {
    console.log(
      "Disconnected",
      PLAYERS.filter((user) => user.id === socket.id)[0]
    );
    console.log("Current users connected:");
    console.table(PLAYERS);
    io.emit(
      "disconnect-message",
      PLAYERS.filter((user) => user.id === socket.id)[0]
    );
    room = ROOMS.filter((it) => !it.room.includes(socket.id));
    PLAYERS = PLAYERS.filter((user) => user.id !== socket.id);
  });
});

function joinRoom(users) {
  users.forEach((user, index) => {
    if (index != 0 && index % 2 != 0) {
      user.room = users[index - 1].room;
    }
  });
}

function decideWinner(moves) {
  const individual_moves = moves.map((move) => move.move);
  const [move1, move2] = individual_moves;
  if (unique(individual_moves).length == 1) {
    return { winner: "Tie", method: "Tie" };
  } else {
    if (WINNERS[move1].includes(move2)) {
      const winner = moves.filter((m) => m.move === move1)[0];
      console.log(WINNERS[move1].indexOf(move2));
      const method = WINNING_METHODS[move1][WINNERS[move1].indexOf(move2)];
      return { winner, method };
    }
    if (WINNERS[move2].includes(move1)) {
      const winner = moves.filter((m) => m.move === move2)[0];
      console.log(WINNERS[move2].indexOf(move1));
      const method = WINNING_METHODS[move2][WINNERS[move2].indexOf(move1)];
      return { winner, method };
    }
  }
}

http.listen(5010, () => console.log("Server started on port 5010"));
