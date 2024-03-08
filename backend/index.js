const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "https://silver-umbrella-jjggxjrvv5q3rw6-5173.app.github.dev",
    methods: ["GET", "POST"],
  }
});
const Deck = require("../backend/src/models/Deck");
const Room = require("../backend/src/models/Room");
const Player = require('../backend/src/models/Player');

const port = process.env.PORT || 4000;

const rooms = [];
const connectedUsers = new Set();
let NUMBERS_OF_CARDS = 0;

io.on("connection", (socket) => {

  const userId = socket.id;
  connectedUsers.add(userId);
  console.log(`User ${userId} has connected.`);



  // Handle user creation of a new room
  socket.on("createRoom", (params) => {
    if (getRoomByName(params.roomName)) {
      io.to(userId).emit("error", "Room  already exists.");
      return;
    }

    const newRoom = new Room(params);
    rooms.push(newRoom);
    connectedUsers.add(userId);
    NUMBERS_OF_CARDS = parseInt(params.numCards);
    socket.emit("roomCreated", { created: "ok" });
    io.emit("roomsAvailable", rooms)
    console.log(`Room ${newRoom.name} created by ${socket.id}`);
    console.log("backend Rooms after create room: ", rooms);
  });

  // handle user joining a room
  socket.on("joinRoom", ({ roomName, username }) => {

    console.log("roomName, username", `${roomName}, ${username}`);
    const room = getRoomByName(roomName);
    console.log("room joinRoom", room);
    if (!room) {
      console.log('----------here1----------------');
      socket.emit("error", "Room not found");
      return;
    }

    if (room.players.length !== 0 && room.players.some((player) => player.name === username)) {
      console.log('----------here2----------------');
      socket.emit("error", "Username already taken");
      return;
    }

    const newPlayer = new Player(userId, username);
    console.log("newPlayer", newPlayer);
    room.players.push(newPlayer);
    console.log("room.players", room);
    socket.join(room.name);
    socket.emit("joinedRoom", { roomName: room.name, username: username });
    //io.to(roomName).emit("playerJoined", { roomName: room.name, username: username });
  });

  // Handle user playing a card
  socket.on("playCard", ({ roomName, username, card }) => {
    const room = getRoomByName(roomName);
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }
    const player = getPlayerByName(room.players, username);
    if (!player) {
      socket.emit("error", "Player not found");
      return;
    }

    const cardIndex = player.hand.findIndex((c) => c.value === card.value);
    if (cardIndex === -1) {
      io.to(userId).emit("error", "Card not found");
      return;
    }

    player.hand.splice(cardIndex, 1);

    if (room.lastCard) {
      const lastCard = room.lastCard;
      if (card.value === lastCard.value) {
        room.lastCard = null;
        const winner = Math.random() < 0.5 ? player : room.players.find((p) => p.name !== username);
        io.to(roomName).emit("win", winner)
      } else if (Deck.order.indexOf(card.value) > Deck.order.indexOf(lastCard.value)) {
        room.lastCard = card;
      }
    } else {
      room.lastCard = card;
    }

    io.to(roomName).emit("playCard", { player: player, card });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User ${userId} has disconnected.`);
    
    //connectedUsers.delete(userId);
  });


});

function getRoomByName(name) {
  return rooms.find((r) => r.name === name);
}

function getRoomByPlayerId(id) {
  if (rooms.length !== 0) {
    return rooms.find((r) => r.players.some((p) => p.id === id));
  }
}

function getPlayerByName(roomName, username) {
  return roomName.find((p) => p.name === username);
}


/* if (connectedUsers.has(socket.id)) {
  console.log("User already connected:", socket.id);
  return;
}
connectedUsers.add(socket.id);
console.log("User connected:", socket.id);

socket.on("createRoom", handleCreateRoom);
socket.on("joinRoom", handleJoinRoom);
socket.on("playCard", handlePlayCard);
socket.on("disconnect", handleDisconnect);

function handleCreateRoom({ roomName, numCards }) {
  const newRoom = new Room(roomName, numCards);
  console.log("newRoom", newRoom);
  NUMBERS_OF_CARDS = parseInt(numCards);
  rooms.push(newRoom);
  socket.emit("roomCreated", { room: newRoom });
  io.emit("roomsAvailable", rooms)
  console.log(`Room ${newRoom.name} created by ${socket.id}`);
  console.log("backend Rooms after create room: ", rooms);
}

function handleJoinRoom({ room, username }) {
  const selectedRoom = rooms.find((r) => r.name === room);

  selectedRoom.players.push({ id: socket.id, name: username });

  socket.join(room);
  console.log(`${username} joined room ${selectedRoom.name}`);

  // When the user leaves the room, emit a "disconnectRoom" event instead of relying on the socket's disconnection
  socket.on("disconnectRoom", () => {
    // Remove the user from the room and perform any necessary cleanup
    selectedRoom.players = selectedRoom.players.filter((player) => player.id !== socket.id);
    socket.leave(room);
    console.log(`${username} left room ${selectedRoom.name}`);

  });

  if (selectedRoom.players.length === 2) {
    const deck = new Deck(NUMBERS_OF_CARDS);
    console.log("deck", deck);
    console.log("selectedRoom", selectedRoom);
    const player1 = selectedRoom.players[0];
    const player2 = selectedRoom.players[1];
    const playersHand = deck.deal();
    const player1Hand = playersHand[0];
    player1.hand = player1Hand;
    const player2Hand = playersHand[1];
    //const player2Hand = deck.deal();
    console.log("player1", player1);
    console.log("player2", player2);
    console.log("player1Hand", player1Hand);

    // const player1Deck = deck.getCards();
    // const player2Deck = deck.getCards();
    // io.to(selectedRoom.name).emit("startGame", {
    //  playerHand: username === player1 ? player1Hand : player2Hand,
    //  opponentHand: username === player1 ? player2Hand : player1Hand,
    //  playerDeck: username === player1 ? player1Deck : player2Deck,
    //  opponentDeck: username === player1 ? player2Deck : player1Deck,
    // }); 
  }
}

function handlePlayCard({ room, username, card }) {
  const selectedRoom = rooms.find((r) => r.name === room);
  const opponent = selectedRoom.players.find((p) => p !== username);
  io.to(room).emit("playCard", { player: username, card });
  if (selectedRoom.lastCard) {
    const lastCard = selectedRoom.lastCard;
    if (card.value === lastCard.value) {
      selectedRoom.lastCard = null;
      const winner = Math.round(Math.random());
      const winningPlayer = winner === 0 ? username : opponent;
      io.to(room).emit("win", winningPlayer);
    } else if (Deck.order.indexOf(card.value) > Deck.order.indexOf(lastCard.value)) {
      selectedRoom.lastCard = card;
    }
  } else {
    selectedRoom.lastCard = card;
  }
}

function handleDisconnect() {
  console.log("User disconnected");
  // Find the user's room and remove them from it
  const user = connectedUsers.find((id) => id === socket.id);

  if (user) {
    const selectedRoom = rooms.find((r) => r.players.some((p) => p.id === user.id));
    if (selectedRoom) {
      const index = selectedRoom.players.findIndex((p) => p.id === user.id);
      selectedRoom.players.splice(index, 1);
      // If the user was in a room, notify other players that they have left
      io.to(selectedRoom.name).emit("playerLeft", user.id);
    }
  }
  // Remove the user from the connectedUsers set
  connectedUsers.delete(socket.id); 
}*/



server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
