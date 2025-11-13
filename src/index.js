// src/lib/constants.ts
var RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
var SUITS = ["s", "h", "c", "d"];

// src/lib/lookup.ts
var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
var MAX_STRAIGHT_FLUSH = 10;
var MAX_FOUR_OF_A_KIND = 166;
var MAX_FULL_HOUSE = 322;
var MAX_FLUSH = 1599;
var MAX_STRAIGHT = 1609;
var MAX_THREE_OF_A_KIND = 2467;
var MAX_TWO_PAIR = 3325;
var MAX_PAIR = 6185;
var FLUSH_LOOKUP = /* @__PURE__ */ new Map();
var UNSUITED_LOOKUP = /* @__PURE__ */ new Map();
function flushes() {
  const straightFlushes = [7936, 3968, 1984, 992, 496, 248, 124, 62, 31, 4111];
  const flushes2 = [];
  const gen = getLexicographicallyNextBitSequence(31);
  for (let i = 0; i < 1286; i++) {
    const f = gen.next().value;
    let notSF = true;
    for (const sf of straightFlushes) {
      if (!(f ^ sf)) {
        notSF = false;
      }
    }
    if (notSF) {
      flushes2.push(f);
    }
  }
  let rank = 1;
  for (const sf of straightFlushes) {
    const primeProduct = primeProductFromRankbits(sf);
    FLUSH_LOOKUP.set(primeProduct, rank);
    rank += 1;
  }
  rank = MAX_FULL_HOUSE + 1;
  for (let i = flushes2.length - 1; i >= 0; i--) {
    const primeProduct = primeProductFromRankbits(flushes2[i]);
    FLUSH_LOOKUP.set(primeProduct, rank);
    rank += 1;
  }
  straightAndHighcards(straightFlushes, flushes2);
}
function straightAndHighcards(straights, highcards) {
  let rank = MAX_FLUSH + 1;
  for (const s of straights) {
    const primeProduct = primeProductFromRankbits(s);
    UNSUITED_LOOKUP.set(primeProduct, rank);
    rank += 1;
  }
  rank = MAX_PAIR + 1;
  for (let i = highcards.length - 1; i >= 0; i--) {
    const primeProduct = primeProductFromRankbits(highcards[i]);
    UNSUITED_LOOKUP.set(primeProduct, rank);
    rank += 1;
  }
}
function multiples() {
  const backwardsRanks = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  let rank = MAX_STRAIGHT_FLUSH + 1;
  for (const i of backwardsRanks) {
    const kickers = [...backwardsRanks];
    removeItem(kickers, i);
    for (const k of kickers) {
      const product = PRIMES[i] ** 4 * PRIMES[k];
      UNSUITED_LOOKUP.set(product, rank);
      rank += 1;
    }
  }
  rank = MAX_FOUR_OF_A_KIND + 1;
  for (const i of backwardsRanks) {
    const pairranks = [...backwardsRanks];
    removeItem(pairranks, i);
    for (const pr of pairranks) {
      const product = PRIMES[i] ** 3 * PRIMES[pr] ** 2;
      UNSUITED_LOOKUP.set(product, rank);
      rank += 1;
    }
  }
  rank = MAX_STRAIGHT + 1;
  for (const r of backwardsRanks) {
    const kickers = [...backwardsRanks];
    removeItem(kickers, r);
    const gen = combinations(kickers, 2);
    for (const kickers2 of gen) {
      const c1 = kickers2[0];
      const c2 = kickers2[1];
      const product = PRIMES[r] ** 3 * PRIMES[c1] * PRIMES[c2];
      UNSUITED_LOOKUP.set(product, rank);
      rank += 1;
    }
  }
  rank = MAX_THREE_OF_A_KIND + 1;
  const tpgen = combinations(backwardsRanks, 2);
  for (const tp of tpgen) {
    const pair1 = tp[0];
    const pair2 = tp[1];
    const kickers = [...backwardsRanks];
    removeItem(kickers, pair1);
    removeItem(kickers, pair2);
    for (const kicker of kickers) {
      const product = PRIMES[pair1] ** 2 * PRIMES[pair2] ** 2 * PRIMES[kicker];
      UNSUITED_LOOKUP.set(product, rank);
      rank += 1;
    }
  }
  rank = MAX_TWO_PAIR + 1;
  for (const pairrank of backwardsRanks) {
    const kickers = [...backwardsRanks];
    removeItem(kickers, pairrank);
    const kgen = combinations(kickers, 3);
    for (const k of kgen) {
      const k1 = k[0];
      const k2 = k[1];
      const k3 = k[2];
      const product = PRIMES[pairrank] ** 2 * PRIMES[k1] * PRIMES[k2] * PRIMES[k3];
      UNSUITED_LOOKUP.set(product, rank);
      rank += 1;
    }
  }
}
function* getLexicographicallyNextBitSequence(bits) {
  let t = (bits | bits - 1) + 1;
  let next = t | (Math.floor((t & -t) / (bits & -bits)) >> 1) - 1;
  yield next;
  while (true) {
    t = (next | next - 1) + 1;
    next = t | (Math.floor((t & -t) / (next & -next)) >> 1) - 1;
    yield next;
  }
}
function removeItem(array, item) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}
function combinations(elements, k) {
  if (k > elements.length || k === 0) {
    return [];
  }
  const indices = [];
  for (let i = k - 1; i >= 0; i--) {
    indices.push(i);
  }
  const combs = [];
  while (true) {
    const comb = [];
    for (const ind of indices) {
      comb.push(elements[ind]);
    }
    combs.push(comb);
    for (let i = 0; i < k; i++) {
      indices[i] += 1;
      if (indices[i] < elements.length - i) {
        for (let j = i - 1; j >= 0; j--) {
          indices[j] = indices[j + 1] + 1;
        }
        break;
      }
    }
    if (indices[0] >= elements.length) {
      break;
    }
  }
  return combs;
}
function primeProductFromRankbits(rankbits) {
  let product = 1;
  for (let i = 0; i <= 12; i++) {
    if (rankbits & 1 << i) {
      product *= PRIMES[i];
    }
  }
  return product;
}
flushes();
multiples();

// src/lib/evaluation_utils.ts
var PRIMES2 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
var CHAR_RANK_TO_INT_RANK = {
  "2": 0,
  "3": 1,
  "4": 2,
  "5": 3,
  "6": 4,
  "7": 5,
  "8": 6,
  "9": 7,
  T: 8,
  J: 9,
  Q: 10,
  K: 11,
  A: 12
};
var CHAR_SUIT_TO_INT_SUIT = {
  s: 1,
  h: 2,
  d: 4,
  c: 8
};
var cardToInt = (card) => {
  const rankChar = card[0];
  const suitChar = card[1];
  const rankInt = CHAR_RANK_TO_INT_RANK[rankChar];
  const suitInt = CHAR_SUIT_TO_INT_SUIT[suitChar];
  const rankPrime = PRIMES2[rankInt];
  const bitRank = 1 << rankInt << 16;
  const suit = suitInt << 12;
  const rank = rankInt << 8;
  return bitRank | suit | rank | rankPrime;
};
var combinations2 = (elements, k) => {
  if (k > elements.length || k === 0) {
    return [];
  }
  const indices = [];
  for (let i = k - 1; i >= 0; i--) {
    indices.push(i);
  }
  const combs = [];
  while (true) {
    const comb = [];
    for (let i = 0; i < k; i++) {
      comb.push(elements[indices[i]]);
    }
    combs.push(comb);
    for (let i = 0; i < k; i++) {
      indices[i] += 1;
      if (indices[i] < elements.length - i) {
        for (let j = i - 1; j >= 0; j--) {
          indices[j] = indices[j + 1] + 1;
        }
        break;
      }
    }
    if (indices[0] >= elements.length) {
      break;
    }
  }
  return combs;
};
var combinations75 = (elements) => {
  return [
    [elements[0], elements[1], elements[2], elements[3], elements[4]],
    [elements[0], elements[1], elements[2], elements[3], elements[5]],
    [elements[0], elements[1], elements[2], elements[3], elements[6]],
    [elements[0], elements[1], elements[2], elements[4], elements[5]],
    [elements[0], elements[1], elements[2], elements[4], elements[6]],
    [elements[0], elements[1], elements[2], elements[5], elements[6]],
    [elements[0], elements[1], elements[3], elements[4], elements[5]],
    [elements[0], elements[1], elements[3], elements[4], elements[6]],
    [elements[0], elements[1], elements[3], elements[5], elements[6]],
    [elements[0], elements[1], elements[4], elements[5], elements[6]],
    [elements[0], elements[2], elements[3], elements[4], elements[5]],
    [elements[0], elements[2], elements[3], elements[4], elements[6]],
    [elements[0], elements[2], elements[3], elements[5], elements[6]],
    [elements[0], elements[2], elements[4], elements[5], elements[6]],
    [elements[0], elements[3], elements[4], elements[5], elements[6]],
    [elements[1], elements[2], elements[3], elements[4], elements[5]],
    [elements[1], elements[2], elements[3], elements[4], elements[6]],
    [elements[1], elements[2], elements[3], elements[5], elements[6]],
    [elements[1], elements[2], elements[4], elements[5], elements[6]],
    [elements[1], elements[3], elements[4], elements[5], elements[6]],
    [elements[2], elements[3], elements[4], elements[5], elements[6]]
  ];
};
var combinations65 = (elements) => {
  return [
    [elements[0], elements[1], elements[2], elements[3], elements[4]],
    [elements[0], elements[1], elements[2], elements[3], elements[5]],
    [elements[0], elements[1], elements[2], elements[4], elements[5]],
    [elements[0], elements[1], elements[3], elements[4], elements[5]],
    [elements[0], elements[2], elements[3], elements[4], elements[5]],
    [elements[1], elements[2], elements[3], elements[4], elements[5]]
  ];
};
var evaluate = (cards, board) => {
  const allCards = board.concat(cards);
  let minimum = 7462;
  if (allCards.length === 7) {
    const combs = combinations75(allCards);
    for (const comb of combs) {
      const score = five(comb);
      if (score < minimum) {
        minimum = score;
      }
    }
    return minimum;
  } else if (allCards.length === 6) {
    const combs = combinations65(allCards);
    for (const comb of combs) {
      const score = five(comb);
      if (score < minimum) {
        minimum = score;
      }
    }
    return minimum;
  } else if (allCards.length === 5) {
    return five(allCards);
  }
  return minimum;
};
var five = (cards) => {
  if (cards[0] & cards[1] & cards[2] & cards[3] & cards[4] & 61440) {
    const handOR = (cards[0] | cards[1] | cards[2] | cards[3] | cards[4]) >> 16;
    const prime = primeProductFromRankbits2(handOR);
    return FLUSH_LOOKUP.get(prime) || 7462;
  } else {
    const prime = primeProductFromHand(cards);
    return UNSUITED_LOOKUP.get(prime) || 7462;
  }
};
var primeProductFromHand = (cardInts) => {
  return cardInts.reduce((product, cardInt) => product * (cardInt & 255), 1);
};
var primeProductFromRankbits2 = (rankbits) => {
  let product = 1;
  for (let i = 0; i <= 12; i++) {
    if (rankbits & 1 << i) {
      product *= PRIMES2[i];
    }
  }
  return product;
};
var findWinners = (results) => {
  const min = Math.min(...results);
  return results.reduce((winners, result, index) => {
    if (result === min) {
      winners.push(index);
    }
    return winners;
  }, []);
};
var evaluateRainbow = (cards, board) => {
  const allCards = board.concat(cards);
  let minimum = 7462;
  if (allCards.length === 7) {
    const combs = combinations75(allCards);
    for (let i = 0; i < combs.length; i++) {
      const score = fiveRainbow(combs[i]);
      if (score < minimum) {
        minimum = score;
      }
    }
    return minimum;
  } else if (allCards.length === 6) {
    const combs = combinations65(allCards);
    for (let i = 0; i < combs.length; i++) {
      const score = fiveRainbow(combs[i]);
      if (score < minimum) {
        minimum = score;
      }
    }
    return minimum;
  } else if (allCards.length === 5) {
    return five(allCards);
  }
  throw "Unexpected number of cards";
};
var evaluateFlush = (cards, board) => {
  const allCards = board.concat(cards);
  let minimum = 7462;
  if (allCards.length === 7) {
    const combs = combinations75(allCards);
    for (let i = 0; i < combs.length; i++) {
      const score = fiveFlush(combs[i]);
      if (score < minimum) {
        minimum = score;
      }
    }
    return minimum;
  } else if (allCards.length === 6) {
    const combs = combinations65(allCards);
    for (let i = 0; i < combs.length; i++) {
      const score = fiveFlush(combs[i]);
      if (score < minimum) {
        minimum = score;
      }
    }
    return minimum;
  } else if (allCards.length === 5) {
    return five(allCards);
  }
  throw "Unexpected number of cards";
};
var fiveRainbow = (cards) => {
  const prime = primeProductFromHand(cards);
  return UNSUITED_LOOKUP.get(prime);
};
var fiveFlush = (cards) => {
  const handOR = (cards[0] | cards[1] | cards[2] | cards[3] | cards[4]) >> 16;
  const prime = primeProductFromRankbits2(handOR);
  return FLUSH_LOOKUP.get(prime);
};

// src/lib/fast_hand_hand.ts
var SUIT_MASKS = [4096, 8192, 16384, 32768];
var pascalsTriangle = [
  [1],
  [1, 1],
  [1, 2, 1],
  [1, 3, 3, 1],
  [1, 4, 6, 4, 1],
  [1, 5, 10, 10, 5, 1]
];
var binomial = (n, k) => {
  if (k > n) {
    return 0;
  }
  return pascalsTriangle[n][k];
};
var getBinedDeck = (exclusions) => {
  const cards = [];
  const cardSuits = [];
  for (let i = 0; i < RANKS.length; i++) {
    const row = [];
    const rowSuits = [];
    for (let j = 0; j < 4; j++) {
      const card = cardToInt(RANKS[i] + SUITS[j]);
      if (!exclusions.has(card)) {
        row.push(card);
        rowSuits.push(SUIT_MASKS[j]);
      }
    }
    cards.push(row);
    cardSuits.push(rowSuits);
  }
  return { cards, cardSuits };
};
var countCards = (indices) => {
  const count = /* @__PURE__ */ new Map();
  for (const ind of indices) {
    count.set(ind, (count.get(ind) || 0) + 1);
  }
  return count;
};
var calcNumColorings = (cardCount, deck) => {
  let num = 1;
  for (const [k, v] of cardCount) {
    num *= binomial(deck.cards[k].length, v);
  }
  return num;
};
var mostCommon = (map) => {
  let most = 0;
  let mostKey = -1;
  for (const [k, v] of map) {
    if (v > most) {
      most = v;
      mostKey = k;
    }
  }
  return [mostKey, most];
};
var findCount2 = (map) => {
  const out = [];
  for (const [k, v] of map) {
    if (v === 2) {
      out.push(k);
    }
  }
  return out;
};
var flushColorings = (cardCount, deck) => {
  if (cardCount.size === 3) {
    return flushColorings3(cardCount, deck);
  } else if (cardCount.size === 4) {
    return flushColorings4(cardCount, deck);
  } else if (cardCount.size === 5) {
    return flushColorings5(cardCount, deck);
  }
  return [];
};
var flushColorings3 = (cardCount, deck) => {
  const colorings = [];
  const a = mostCommon(cardCount);
  let numVariations;
  if (a[1] === 2) {
    const [k1, k2] = findCount2(cardCount);
    numVariations = (deck.cards[k1].length - 1) * (deck.cards[k2].length - 1);
  } else {
    numVariations = binomial(deck.cards[a[0]].length - 1, 2);
  }
  for (let i = 0; i < SUIT_MASKS.length; i++) {
    const mask = SUIT_MASKS[i];
    const board = [];
    for (const k of cardCount.keys()) {
      if (deck.cardSuits[k].includes(mask)) {
        board.push(deck.cards[k][0] & 4294905855 | mask);
      } else {
        break;
      }
    }
    if (board.length === 3) {
      colorings.push({
        board,
        numVariations,
        color: mask,
        num: 3
      });
    }
  }
  return colorings;
};
var flushColorings4 = (cardCount, deck) => {
  const colorings = [];
  const a = mostCommon(cardCount);
  let numVariations;
  const cardCountKeys = Array.from(cardCount.keys());
  const combs = combinations2(cardCountKeys, 3);
  for (let i = 0; i < combs.length; i++) {
    const cards = combs[i];
    const excluded = cardCountKeys.filter((x) => {
      return !cards.includes(x);
    });
    for (let i2 = 0; i2 < SUIT_MASKS.length; i2++) {
      const mask = SUIT_MASKS[i2];
      const board = [];
      for (const k of cards) {
        if (deck.cardSuits[k].includes(mask)) {
          board.push(deck.cards[k][0] & 4294905855 | mask);
        } else {
          break;
        }
      }
      if (board.length === 3) {
        const excludedPossible = deck.cardSuits[excluded[0]].includes(mask);
        if (excludedPossible) {
          if (excluded[0] === a[0]) {
            numVariations = binomial(deck.cards[a[0]].length - 1, 2);
          } else {
            numVariations = (deck.cards[a[0]].length - 1) * (deck.cards[excluded[0]].length - 1);
          }
        } else {
          if (excluded[0] === a[0]) {
            numVariations = binomial(deck.cards[a[0]].length, 2);
          } else {
            numVariations = (deck.cards[a[0]].length - 1) * deck.cards[excluded[0]].length;
          }
        }
        colorings.push({
          board,
          numVariations,
          color: mask,
          num: 3
        });
      }
    }
  }
  numVariations = deck.cards[a[0]].length - 1;
  for (let i = 0; i < SUIT_MASKS.length; i++) {
    const mask = SUIT_MASKS[i];
    const board = [];
    for (const k of cardCount.keys()) {
      if (deck.cardSuits[k].includes(mask)) {
        board.push(deck.cards[k][0] & 4294905855 | mask);
      } else {
        break;
      }
    }
    if (board.length === 4) {
      colorings.push({
        board,
        numVariations,
        color: mask,
        num: 4
      });
    }
  }
  return colorings;
};
var flushColorings5 = (cardCount, deck) => {
  const colorings = [];
  let numVariations;
  const cardCountKeys = Array.from(cardCount.keys());
  let combs = combinations2(cardCountKeys, 3);
  for (let i = 0; i < combs.length; i++) {
    const cards = combs[i];
    const excluded = cardCountKeys.filter((x) => {
      return !cards.includes(x);
    });
    for (let i2 = 0; i2 < SUIT_MASKS.length; i2++) {
      const mask = SUIT_MASKS[i2];
      const board = [];
      for (const k of cards) {
        if (deck.cardSuits[k].includes(mask)) {
          board.push(deck.cards[k][0] & 4294905855 | mask);
        } else {
          break;
        }
      }
      if (board.length === 3) {
        const aPossible = deck.cardSuits[excluded[0]].includes(mask);
        const bPossible = deck.cardSuits[excluded[1]].includes(mask);
        if (aPossible && bPossible) {
          numVariations = (deck.cards[excluded[0]].length - 1) * (deck.cards[excluded[1]].length - 1);
        } else if (aPossible) {
          numVariations = (deck.cards[excluded[0]].length - 1) * deck.cards[excluded[1]].length;
        } else if (bPossible) {
          numVariations = deck.cards[excluded[0]].length * (deck.cards[excluded[1]].length - 1);
        } else {
          numVariations = deck.cards[excluded[0]].length * deck.cards[excluded[1]].length;
        }
        colorings.push({
          board,
          numVariations,
          color: mask,
          num: 3
        });
      }
    }
  }
  combs = combinations2(cardCountKeys, 4);
  for (let i = 0; i < combs.length; i++) {
    const cards = combs[i];
    const excluded = cardCountKeys.filter((x) => {
      return !cards.includes(x);
    });
    for (let i2 = 0; i2 < SUIT_MASKS.length; i2++) {
      const mask = SUIT_MASKS[i2];
      const board = [];
      for (const k of cards) {
        if (deck.cardSuits[k].includes(mask)) {
          board.push(deck.cards[k][0] & 4294905855 | mask);
        } else {
          break;
        }
      }
      if (board.length === 4) {
        const excludedPossible = deck.cardSuits[excluded[0]].includes(mask);
        if (excludedPossible) {
          numVariations = deck.cards[excluded[0]].length - 1;
        } else {
          numVariations = deck.cards[excluded[0]].length;
        }
        colorings.push({
          board,
          numVariations,
          color: mask,
          num: 4
        });
      }
    }
  }
  for (let i = 0; i < SUIT_MASKS.length; i++) {
    const mask = SUIT_MASKS[i];
    const board = [];
    for (const k of cardCount.keys()) {
      if (deck.cardSuits[k].includes(mask)) {
        board.push(deck.cards[k][0] & 4294905855 | mask);
      } else {
        break;
      }
    }
    if (board.length === 5) {
      colorings.push({
        board,
        numVariations: 1,
        color: mask,
        num: 5
      });
    }
  }
  return colorings;
};
var suitMatch = (card, suit) => {
  return (card & 61440) === suit;
};
var evalHandFlushFast = (hand, board, rainbowScore, color, numFlush) => {
  if (numFlush === 3) {
    if (suitMatch(hand[0], color) && suitMatch(hand[1], color)) {
      return Math.min(rainbowScore, evaluateFlush(hand, board));
    } else {
      return rainbowScore;
    }
  } else if (numFlush === 4) {
    const h0Match = suitMatch(hand[0], color);
    const h1Match = suitMatch(hand[1], color);
    if (h0Match && h1Match) {
      return Math.min(rainbowScore, evaluateFlush(hand, board));
    } else if (h0Match) {
      return Math.min(rainbowScore, evaluateFlush([hand[0]], board));
    } else if (h1Match) {
      return Math.min(rainbowScore, evaluateFlush([hand[1]], board));
    } else {
      return rainbowScore;
    }
  } else if (numFlush === 5) {
    const h0Match = suitMatch(hand[0], color);
    const h1Match = suitMatch(hand[1], color);
    if (h0Match && h1Match) {
      return Math.min(rainbowScore, evaluateFlush(hand, board));
    } else if (h0Match) {
      return Math.min(rainbowScore, evaluateFlush([hand[0]], board));
    } else if (h1Match) {
      return Math.min(rainbowScore, evaluateFlush([hand[1]], board));
    } else {
      return Math.min(rainbowScore, evaluateFlush([], board));
    }
  }
  throw "Unexpected number of flushes";
};
var fastHandHand = (hands) => {
  const wins = new Array(hands.length).fill(0);
  const ties = new Array(hands.length).fill(0);
  let n = 0;
  const exclusions = /* @__PURE__ */ new Set();
  for (const hand of hands) {
    exclusions.add(hand[0]);
    exclusions.add(hand[1]);
  }
  const deck = getBinedDeck(exclusions);
  const indices = [0, 0, 0, 0, 0];
  while (true) {
    const cardCount = countCards(indices);
    let boardPossible = true;
    for (const [k, v] of cardCount) {
      if (v > deck.cards[k].length) {
        boardPossible = false;
        break;
      }
    }
    if (boardPossible) {
      const numColorings = calcNumColorings(cardCount, deck);
      const board = [];
      for (let i = 0; i < 5; i++) {
        board.push(deck.cards[indices[i]][0]);
      }
      const rainbowScore = [];
      for (let i = 0; i < hands.length; i++) {
        rainbowScore.push(evaluateRainbow(hands[i], board));
      }
      let m = 0;
      const colorings = flushColorings(cardCount, deck);
      for (let i = 0; i < colorings.length; i++) {
        const coloring = colorings[i];
        const numVariations = coloring.numVariations;
        if (numVariations === 0) {
          continue;
        }
        const flushScore = [];
        for (let j = 0; j < hands.length; j++) {
          flushScore.push(
            evalHandFlushFast(
              hands[j],
              coloring.board,
              rainbowScore[j],
              coloring.color,
              coloring.num
            )
          );
        }
        const winners2 = findWinners(flushScore);
        if (winners2.length > 1) {
          for (let j = 0; j < winners2.length; j++) {
            ties[winners2[j]] += numVariations;
          }
        } else {
          wins[winners2[0]] += numVariations;
        }
        m += numVariations;
      }
      const winners = findWinners(rainbowScore);
      if (winners.length > 1) {
        for (let i = 0; i < winners.length; i++) {
          ties[winners[i]] += numColorings - m;
        }
      } else {
        wins[winners[0]] += numColorings - m;
      }
      n += numColorings;
    }
    for (let i = 0; i < 5; i++) {
      indices[i] += 1;
      if (indices[i] < 13) {
        for (let j = i - 1; j >= 0; j--) {
          indices[j] = indices[i];
        }
        break;
      }
    }
    if (indices[4] > 12) {
      break;
    }
  }
  return [wins, ties, n];
};
var ALLCARDS = [
  69634,
  73730,
  81922,
  98306,
  135427,
  139523,
  147715,
  164099,
  266757,
  270853,
  279045,
  295429,
  529159,
  533255,
  541447,
  557831,
  1053707,
  1057803,
  1065995,
  1082379,
  2102541,
  2106637,
  2114829,
  2131213,
  4199953,
  4204049,
  4212241,
  4228625,
  8394515,
  8398611,
  8406803,
  8423187,
  16783383,
  16787479,
  16795671,
  16812055,
  33560861,
  33564957,
  33573149,
  33589533,
  67115551,
  67119647,
  67127839,
  67144223,
  134224677,
  134228773,
  134236965,
  134253349,
  268442665,
  268446761,
  268454953,
  268471337
];
var getDeck = (exclusions) => {
  const cards = [];
  for (const card of ALLCARDS) {
    if (!exclusions.includes(card)) {
      cards.push(card);
    }
  }
  return cards;
};
var calculateHandHandEquities = (handStrings, dealtBoard) => {
  const hands = [];
  for (const hand of handStrings) {
    hands.push([cardToInt(hand[0]), cardToInt(hand[1])]);
  }
  const board = dealtBoard.map(cardToInt);
  if (board.length < 3) {
    return fastHandHand(hands);
  }
  let n = 0;
  const wins = new Array(hands.length).fill(0);
  const ties = new Array(hands.length).fill(0);
  if (board.length === 5) {
    const results = [];
    for (const h of hands) {
      results.push(evaluate(board, h));
    }
    const winners = findWinners(results);
    if (winners.length > 1) {
      for (const w of winners) {
        ties[w] += 1;
      }
    } else {
      wins[winners[0]] += 1;
    }
    n += 1;
  } else {
    const deck = getDeck(board.concat(...hands));
    const deals = combinations2(deck, 5 - board.length);
    for (const deal of deals) {
      const boardFull = board.concat(deal);
      const results = [];
      for (let j = 0; j < hands.length; j++) {
        results.push(evaluate(boardFull, hands[j]));
      }
      const winners = findWinners(results);
      if (winners.length > 1) {
        for (const w of winners) {
          ties[w] += 1;
        }
      } else {
        wins[winners[0]] += 1;
      }
      n += 1;
    }
  }
  return [wins, ties, n];
};

// src/texasHoldEmOdds.ts
function texasHoldEmOdds(hands, board) {
  if (hands === void 0 || hands === null) {
    return JSON.stringify({ error: "u need to put hands" });
  }
  if (board === void 0) {
    return JSON.stringify({ error: "parsing board" });
  }
  if (hands.length % 4) {
    return JSON.stringify({
      error: "check what u wrote in hands wrong length"
    });
  }
  const boardLength = board?.length ? board.length : 0;
  if (boardLength % 2 || boardLength > 10) {
    return JSON.stringify({ error: "board wrong length" });
  }
  var parsedHands = [];
  for (var i = 0; i < hands.length / 4; i++) {
    var idx = i * 4;
    var holeCard1 = hands.slice(idx, idx + 2);
    var holeCard2 = hands.slice(idx + 2, idx + 4);
    if (!holeCard1 && !holeCard2) {
      return JSON.stringify({ error: "error parsing hands" });
    }
    parsedHands[i] = [holeCard1, holeCard2];
  }
  var parsedBoard = [];
  if (boardLength > 0) {
    var parsedBoard = board?.match(/.{1,2}/g);
  }
  const result = calculateHandHandEquities(parsedHands, parsedBoard);
  const results = parsedHands.map((hand, index) => {
    var combos = result[2];
    return {
      [hand.join("")]: {
        win: result[0][index] / combos,
        tie: result[1][index] / combos
      }
    };
  });
  return JSON.stringify(results, null, 2);
}
export {
  texasHoldEmOdds
};
