import type { Card, Combo } from "./lib/models";
import { calculateHandHandEquities } from "./lib/fast_hand_hand";

const texasHoldEmOdds = (hands: String, board: String) => {
  if (hands === undefined || hands === null) {
    return JSON.stringify({ error: "u need to put hands" });
  }

  if (board === undefined) {
    return JSON.stringify({ error: "parsing board" });
  }

  if (hands.length % 4) {
    return JSON.stringify({
      error: "check what u wrote in hands wrong length",
    });
  }

  const boardLength = board?.length ? board.length : 0;
  if (boardLength % 2 || boardLength > 10) {
    return JSON.stringify({ error: "board wrong length" });
  }

  var parsedHands: Array<Combo> = [];

  for (var i = 0; i < hands.length / 4; i++) {
    var idx = i * 4;
    var holeCard1 = hands.slice(idx, idx + 2);
    var holeCard2 = hands.slice(idx + 2, idx + 4);
    if (!(holeCard1 as Card) && !(holeCard2 as Card)) {
      return JSON.stringify({ error: "error parsing hands" });
    }

    // @ts-ignore
    parsedHands[i] = [holeCard1, holeCard2];
  }

  var parsedBoard: Array<Card> = [];
  if (boardLength > 0) {
    // @ts-ignore
    var parsedBoard: Array<Card> = board?.match(/.{1,2}/g);
  }

  const result = calculateHandHandEquities(parsedHands, parsedBoard);

  const results = parsedHands.map((hand, index) => {
    var combos = result[2];
    // @ts-ignore
    return {
      [hand.join("")]: {
        win: result[0][index] / combos,
        tie: result[1][index] / combos,
      },
    };
  });
  return JSON.stringify(results, null, 2);
};

export default texasHoldEmOdds;
