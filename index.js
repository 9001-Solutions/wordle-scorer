const allWords = require("./possible-words.json");

const allLetters = "abcdefghijklmnopqrstuvwxyz".split("");

//////////////////////////////
// FILL THESE OUT AS YOU GO //
//////////////////////////////
const confirmedLetters = {
  pos0: undefined,
  pos1: undefined,
  pos2: undefined,
  pos3: undefined,
  pos4: undefined,
};

// const nebulousLetters = [{ letter: "a", notIn: [0] }];
const nebulousLetters = [
  // { letter: "s", notIn: [0, 2] },
  // { letter: "p", notIn: [0] },
];
const wrongLetters = [];
const noMoreLetters = [];
//////////////////////////////
//////////////////////////////
//////////////////////////////

const graph = {};
for (const letter of allLetters) {
  graph[letter] = { pos0: 0, pos1: 0, pos2: 0, pos3: 0, pos4: 0 };
}

const isPossibleDailyWord = (word) => allWords.dailyWords.includes(word);

const remainingDailyWords = [];
const remainingGuessableWords = [];
for (const dailyWord of [...allWords.dailyWords, ...allWords.guessableWords]) {
  // Remove words that don't have exact matches
  if (confirmedLetters.pos0 && dailyWord[0] !== confirmedLetters.pos0) continue;
  if (confirmedLetters.pos1 && dailyWord[1] !== confirmedLetters.pos1) continue;
  if (confirmedLetters.pos2 && dailyWord[2] !== confirmedLetters.pos2) continue;
  if (confirmedLetters.pos3 && dailyWord[3] !== confirmedLetters.pos3) continue;
  if (confirmedLetters.pos4 && dailyWord[4] !== confirmedLetters.pos4) continue;

  // Remove words with wrong letters
  if (dailyWord.split("").some((letter) => wrongLetters.includes(letter)))
    continue;

  // Remove words that don't have nebulous letters outside of confirmed positions
  const remainingLetters = dailyWord.split("").reduce((acc, curr, i) => {
    if (confirmedLetters[`pos${i}`]) {
      return acc;
    } else {
      return [...acc, curr];
    }
  }, []);
  if (
    nebulousLetters
      .map((nl) => nl.letter)
      .some((nl) => !remainingLetters.includes(nl))
  )
    continue;

  // Remove words that have nebulous letters in the wrong spot
  let shouldSkip = false;
  for (const nebulousLetter of nebulousLetters) {
    for (const pos of nebulousLetter.notIn) {
      if (dailyWord[pos] === nebulousLetter.letter) {
        console.log("Should SKip", dailyWord, { nebulousLetter });
        shouldSkip = true;
        break;
      }
    }
  }
  if (shouldSkip) continue;

  // Remove words that attempt to use an existing letter that has already been placed when there aren't duplicates
  for (const noMore of noMoreLetters) {
    const existingCount = [
      confirmedLetters.pos0,
      confirmedLetters.pos1,
      confirmedLetters.pos2,
      confirmedLetters.pos3,
      confirmedLetters.pos4,
    ].filter((letter) => letter === noMore).length;

    if (
      dailyWord.split("").filter((letter) => letter === noMore).length >
      existingCount
    ) {
      shouldSkip = true;
      break;
    }
  }
  if (shouldSkip) continue;

  if (isPossibleDailyWord(dailyWord)) {
    remainingDailyWords.push(dailyWord);
    for (let i = 0; i < 5; i++) {
      graph[dailyWord[i]][`pos${i}`]++;
    }
  } else {
    remainingGuessableWords.push(dailyWord);
  }
}

const getRankings = (pos) =>
  allLetters
    .reduce((acc, curr) => {
      acc.push({ letter: curr, amount: graph[curr][`pos${pos}`] });
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount);

const pos0Rankings = getRankings(0);
const pos1Rankings = getRankings(1);
const pos2Rankings = getRankings(2);
const pos3Rankings = getRankings(3);
const pos4Rankings = getRankings(4);

console.log({
  pos0Rankings,
  pos1Rankings,
  pos2Rankings,
  pos3Rankings,
  pos4Rankings,
});

const getScore = (word) => {
  const score =
    pos0Rankings.find((r) => r.letter === word[0]).amount +
    pos1Rankings.find((r) => r.letter === word[1]).amount +
    pos2Rankings.find((r) => r.letter === word[2]).amount +
    pos3Rankings.find((r) => r.letter === word[3]).amount +
    pos4Rankings.find((r) => r.letter === word[4]).amount;

  return score;
};

// TODO: Don't include confirmed letter positions in subscore
const getSubScore = (word) => {
  return (
    pos1Rankings.find((r) => r.letter === word[0]).amount +
    pos2Rankings.find((r) => r.letter === word[0]).amount +
    pos3Rankings.find((r) => r.letter === word[0]).amount +
    pos4Rankings.find((r) => r.letter === word[0]).amount +
    pos0Rankings.find((r) => r.letter === word[1]).amount +
    pos2Rankings.find((r) => r.letter === word[1]).amount +
    pos3Rankings.find((r) => r.letter === word[1]).amount +
    pos4Rankings.find((r) => r.letter === word[1]).amount +
    pos0Rankings.find((r) => r.letter === word[2]).amount +
    pos1Rankings.find((r) => r.letter === word[2]).amount +
    pos3Rankings.find((r) => r.letter === word[2]).amount +
    pos4Rankings.find((r) => r.letter === word[2]).amount +
    pos0Rankings.find((r) => r.letter === word[3]).amount +
    pos1Rankings.find((r) => r.letter === word[3]).amount +
    pos2Rankings.find((r) => r.letter === word[3]).amount +
    pos4Rankings.find((r) => r.letter === word[3]).amount +
    pos0Rankings.find((r) => r.letter === word[4]).amount +
    pos1Rankings.find((r) => r.letter === word[4]).amount +
    pos2Rankings.find((r) => r.letter === word[4]).amount +
    pos3Rankings.find((r) => r.letter === word[4]).amount
  );
};

const finalRankings = [...remainingDailyWords, ...remainingGuessableWords]
  .map((rdw) => ({
    word: rdw,
    score: getScore(rdw),
    subScore: getSubScore(rdw),
  }))
  .sort((a, b) => b.score - a.score)
  .sort((a, b) => (a.score === b.score ? b.subScore - a.subScore : 0));

for (let i = 0; i < finalRankings.length && i < 10; i++) {
  console.log(
    `[${i}] ${JSON.stringify(finalRankings[i])}${
      isPossibleDailyWord(finalRankings[i].word) ? "*" : ""
    }`
  );
}
