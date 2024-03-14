const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('../../database.db');

class Room {
    constructor(params) {
        this.name = params.roomName;
        this.numCards = params.numCards;
        this.players = [];
        this.lastCard = null;
        this.creatorName = params.creator;
    }

    addPlayer(player) {
        this.players.push(player);
        player.room = this;
    }

    getPlayerByName(name) {
        return this.players.find((player) => player.name === name);
    }

    getOpponent(player) {
        return this.players.find((p) => p !== player);
    }

    static create(name, numCards, callback) {
        const sql = `INSERT INTO rooms (name, num_cards) VALUES (?, ?)`;
        db.run(sql, [name, numCards], function (err) {
            if (err) return callback(err);
            callback(null, new Room(this.lastID, name, numCards));
        });
    }

    static getById(id, callback) {
        const sql = `SELECT * FROM rooms WHERE id = ?`;
        db.get(sql, [id], function (err, row) {
            if (err) return callback(err);
            if (!row) return callback(null, null);
            const room = new Room(row.id, row.name, row.num_cards);
            callback(null, room);
        });
    }
}

module.exports = Room;