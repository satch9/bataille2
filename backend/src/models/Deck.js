const _ = require('lodash');
const Card = require('./Cards')

class Deck{
    constructor(numCards){
        this.cards = _.shuffle(_.range(numCards).map(n => Card.fromNumber(n, numCards)))

    }

    draw(n){
        return n ? _.times(n, () => this.cards.pop()) : this.cards.pop();
    }

    deal(){
        const hands = [];
        let numCardsPerPlayer;
        if(this.cards.length === 32){
            numCardsPerPlayer = 16;
        }else{
            numCardsPerPlayer = 26
        }
        for (let i = 0; i < 2; i++) {
            const hand = [];
            for (let j = 0; j < numCardsPerPlayer; j++) {
                hand.push(this.draw());
            }
            hands.push(hand);
        }
        return hands;
    }
}

module.exports = Deck;