const socketio = require("socket.io")

const initializeSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "http://localhost:5173", // Modifier en fonction de votre configuration frontend
            methods: ["GET", "POST"],
        }

        /* const io = socketio(server, {
            cors: {
                origin: "https://silver-umbrella-jjggxjrvv5q3rw6-5173.app.github.dev", // Modifier en fonction de votre configuration frontend
                methods: ["GET", "POST"],
            }
        }); */
    });

    const Deck = require("../backend/src/models/Deck");
    const Room = require("../backend/src/models/Room");
    const Player = require('../backend/src/models/Player');

    const rooms = [];
    let NUMBERS_OF_CARDS;

    io.on('connection', (socket) => {
        const userId = socket.id;
        console.log(`User ${userId} has connected.`);

        // Handle user creation of a new room
        socket.on("createRoom", (params) => {
            if (getRoomByName(params.roomName)) {
                io.to(userId).emit("error", "Room  already exists.");
                return;
            }

            const newRoom = new Room(params);
            rooms.push(newRoom);
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
            io.to(roomName).emit("playerJoined", { roomName: room.name, players: room.players });
        });

        // handle start game
        socket.on("startGame", ({ room }) => {
            console.log("Starting Game in room : ", room);
            let r = getRoomByName(room);

            if (r.creatorId != socket.id) {
                console.log("Only the creator  can start the game");
                return;
            }

            r.gameStarted = true;
            const deck = new Deck(NUMBERS_OF_CARDS);

            const player1 = r.players[0];
            const player2 = r.players[1];
            
            const playersHand = deck.deal();
            const player1Hand = playersHand[0];
            player1.hand = player1Hand;
            const player2Hand = playersHand[1];
            player2.hand = player2Hand;

            console.log("player1", player1);
            console.log("player2", player2);

            io.to(r.name)

            io.to(r.name).emit("gameStarted", {
                message: `The game has started!`,

            });

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
            // Supprimer l'utilisateur des salles et effectuer tout nettoyage nécessaire
            for (let room of rooms) {
                room.players = room.players.filter((player) => player.id !== socket.id);
                io.to(room.name).emit("playerLeft", { playerId: socket.id, players: room.players });
            }
        });
    });

    function getRoomByName(name) {
        return rooms.find((r) => r.name === name);
    }

    function getPlayerByName(roomName, username) {
        return roomName.find((p) => p.name === username);
    }

    function getRoomByPlayerId(id) {
        if (rooms.length !== 0) {
            return rooms.find((r) => r.players.some((p) => p.id === id));
        }
    }
}

module.exports = initializeSocket;