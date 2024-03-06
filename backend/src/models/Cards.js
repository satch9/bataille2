const _ = require('lodash');

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    static suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    static symbols = ['♥', '♦', '♣', '♠'];

    static values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    static labels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    static fromNumber(n, totalCards) {
        if (totalCards === 32) {
            const values32 = [5, 6, 7, 8, 9, 10, 11, 12];
            const labels32 = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            return n > 31
                ? null
                : new Card(Card.suits[Math.trunc(n / 8)], values32[n % 8], labels32[n % 8]);
        } else {
            return n > 51
                ? null
                : new Card(Card.suits[Math.trunc(n / 13)], Card.values[n % 13], Card.labels[n % 13]);
        }
    }

    toString() {
        return Card.symbols[_.indexOf(Card.suits, this.suit)] + Card.labels[this.value];
    }
}

module.exports = Card;