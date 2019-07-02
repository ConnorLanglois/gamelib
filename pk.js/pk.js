function hasDuplicates(arr) {
    return (new Set(arr)).size !== arr.length;
}

function randomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

const SUIT = {
	HEARTS: 0,
	DIAMONDS: 1,
	SPADES: 2,
	CLUBS: 3,

	random: function random() {
		return randomInt(SUIT.HEARTS, SUIT.CLUBS);
	}
};

const RANK = {
	TWO: 2,
	THREE: 3,
	FOUR: 4,
	FIVE: 5,
	SIX: 6,
	SEVEN: 7,
	EIGHT: 8,
	NINE: 9,
	TEN: 10,
	JACK: 11,
	QUEEN: 12,
	KING: 13,
	ACE: 14,

	random: function random() {
		return randomInt(RANK.TWO, RANK.ACE);
	}
};

const SORT = {
	RANK: 0,
	SUIT: 1
};

class Card {
	constructor (suit, rank) {
		this._suit = suit;
		this._rank = rank;
	}

	get rank() {
		return this._rank;
	}

	get suit() {
		return this._suit;
	}

	static random() {
		return new Card(SUIT.random(), RANK.random());
	}
}

class Hand {
	constructor (cards) {
		this._cards = cards;
	}

	static random() {
		return new Hand([Card.random(), Card.random()]);
	}

	static sort(cards, by) {
		const sort = by === SORT.RANK ? 'rank' : by === SORT.SUIT ? 'suit' : '';

		return cards.sort(function (card1, card2) {
			return card1[sort] - card2[sort];
		});
	}

	getRoyalFlush(board) {
		const straightFlushes = this.getStraightFlushes(board);

		var royalFlush = [];

		straightFlushes.forEach(function (straightFlush) {
			if (straightFlush[0].rank === RANK.TEN &&
				straightFlush[1].rank === RANK.JACK &&
				straightFlush[2].rank === RANK.QUEEN &&
				straightFlush[3].rank === RANK.KING &&
				straightFlush[4].rank === RANK.ACE) {

				royalFlush = straightFlush;

				return;
			}
		});

		return  royalFlush;
	}

	getStraightFlushes(board) {
		const straights = this.getStraights(board);
		const flushes = this.getFlushes(board);

		var straightFlushes = [];

		straights.forEach(function (straight) {
			flushes.forEach(function (flush) {
				var isStraightFlush = true;

				flush.forEach(function (card, i) {
					if (!(card.rank === straight[i].rank && card.suit === straight[i].suit)) {
						isStraightFlush = false;
					}
				});

				if (isStraightFlush) {
					straightFlushes[straightFlushes.length] = straight;
				}
			});
		});

		return straightFlushes;
	}

	getStraightFlush(board) {
		var straightFlush = [];

		this.getStraightFlushes(board).forEach(function (aStraightFlush) {
			if (straightFlush.length === 0 || aStraightFlush[4].rank > straightFlush[4].rank) {
				straightFlush = aStraightFlush;
			}
		});

		return straightFlush;
	}

	getFlushes(board) {
		const cards = Hand.sort(this._cards.concat(board), SORT.SUIT);
		const flushes = [];

		cards.forEach(function (card1) {
			cards.forEach(function (card2) {
				cards.forEach(function (card3) {
					cards.forEach(function (card4) {
						cards.forEach(function (card5) {
							if (!(hasDuplicates([card1, card2, card3, card4, card5])) &&
								card1.suit === card2.suit &&
								card1.suit === card3.suit && 
								card1.suit === card4.suit && 
								card1.suit === card5.suit) {
								
								var found = false;

								for (var flush of flushes) {
									if (flush.includes(card1) &&
										flush.includes(card2) &&
										flush.includes(card3) &&
										flush.includes(card4) &&
										flush.includes(card5)) {

										found = true;

										break;
									}
								}

								if (!found) {
									flushes[flushes.length] = Hand.sort([card1, card2, card3, card4, card5], SORT.RANK);
								}
							}
						});
					});
				});
			});
		});

		return flushes;
	}

	getFlush(board) {
		var flush = [];

		this.getFlushes(board).forEach(function (aFlush) {
			if (flush.length === 0 || aFlush[4].rank > flush[4].rank) {
				flush = aFlush;
			}
		});

		return flush;
	}

	getStraights(board) {
		const cards = Hand.sort(this._cards.concat(board), SORT.RANK);
		const straights = [];

		cards.forEach(function (card1) {
			cards.forEach(function (card2) {
				cards.forEach(function (card3) {
					cards.forEach(function (card4) {
						cards.forEach(function (card5) {
							if (!(hasDuplicates([card1, card2, card3, card4, card5])) &&
								card2.rank - (card1.rank === RANK.ACE ? 1 : card1.rank) === 1 &&
								card3.rank - card2.rank === 1 &&
								card4.rank - card3.rank === 1 &&
								card5.rank - card4.rank === 1) {

								straights[straights.length] = Hand.sort([card1, card2, card3, card4, card5], SORT.RANK);
							}
						});
					});
				});
			});
		});

		return straights;
	}

	getStraight(board) {
		var straight = [];

		this.getStraights(board).forEach(function (aStraight) {
			if (straight.length === 0 || aStraight[0].rank > straight[0].rank) {
				straight = aStraight;
			}
		});

		return straight;
	}

	getPair(board) {
		const cards = this._cards.concat(board);
		var pair = [new Card(0, 0), 0];

		cards.forEach(function (card1) {
			cards.forEach(function (card2) {
				if (card1 !== card2 && card1.rank > pair[0].rank && card1.rank === card2.rank) {
					pair = [card1, card2];
				}
			});
		});

		return pair[0].rank !== 0 ? pair : [0, 0];
	}

	getHigh(board) {
		const cards = this._cards.concat(board);

		var high = new Card(0, 0);

		cards.forEach(function (card) {
			if (card.rank > high.rank) {
				high = card;
			}
		});

		return high
	}
}

class Deck {
	constructor (cards) {
		this._cards = cards;
	}

	static random() {
		var cards = [];

		for (var i = 0; i < 4; i++) {
			for (var j = 2; j < 15; j++) {
				cards.push(new Card(i, j));
			}
		}

		return (new Deck(cards)).shuffle();
	}

	deal(n) {
		return this._cards.splice(randomInt(0, this._cards.length - 1), n);
	}

	shuffle() {
		for (var i = 0, j = 0; i < this._cards.length; i++, j = randomInt(0, i)) {
	        [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
	    }

		return this;
	}
}
