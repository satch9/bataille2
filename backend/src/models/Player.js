class Player {
    constructor(id, name){
        this.id = id;
        this.name = name;
        this.hand = [];

    }

    addCard(card){
        this.hand.push(card);
    }

    playCard(card){
        const cardIndex = this.hand.findIndex((c) => c.value === card.value);
        this.hand.splice(cardIndex, 1);
    }
}

module.exports = Player;