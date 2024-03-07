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

const port = process.env.PORT || 4000;

const rooms = [];
const connectedUsers = new Set();
let NUMBERS_OF_CARDS = 0;

io.on("connection", (socket) => {
  if (connectedUsers.has(socket.id)) {
    console.log("User already connected:", socket.id);
    return;
  }
  connectedUsers.add(socket.id);
  console.log("User connected:", socket.id);

  socket.on("createRoom", handleCreateRoom);
  console.log("backend Rooms after create room: ", rooms);
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
  }

  function handleJoinRoom({ room, username }) {
    const selectedRoom = rooms.find((r) => r.name === room);
    
    selectedRoom.players.push({ id: socket.id, name: username });
    console.log("selectedRoom", selectedRoom);
    socket.join(room);
    console.log(`${username} joined room ${selectedRoom.name}`);

    if (selectedRoom.players.length === 2) {
      const deck = new Deck(NUMBERS_OF_CARDS);
      console.log("deck", deck);
      console.log("selectedRoom", selectedRoom);
      const  player1  = selectedRoom.players[0];
      const  player2  = selectedRoom.players[1];
      const playersHand = deck.deal();
      const player1Hand = playersHand[0];
      const player2Hand = playersHand[1];
      //const player2Hand = deck.deal();
      console.log("player1", player1);
      console.log("player2", player2);
      console.log("player1Hand", player1Hand);

      /* const player1Deck = deck.getCards();
      const player2Deck = deck.getCards();
      io.to(selectedRoom.name).emit("startGame", {
        playerHand: username === player1 ? player1Hand : player2Hand,
        opponentHand: username === player1 ? player2Hand : player1Hand,
        playerDeck: username === player1 ? player1Deck : player2Deck,
        opponentDeck: username === player1 ? player2Deck : player1Deck,
      }); */
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
  }
});


server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
