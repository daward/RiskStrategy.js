const board = require("./board");
const fs = require("fs");
const thresholdSelector = require("./thresholdselector");


const scoreCompare = (a, b) => {
  return a.totalScore > b.totalScore ? -1 : 1;
}

const evaluate = ({ country, thresholdSelector }) => {
  const startingPath = riskBoard.createInitialBoardState([country]);

  let paths = [startingPath];
  nextPaths = [];
  const results = {};

  while (paths.length) {

    const currentPath = paths.shift();

    if (!currentPath.isComplete() && !currentPath.isRedundant) {
      const newPaths = currentPath.expand();
      newPaths.forEach(path => {
        if (!path.isRedundant) {
          nextPaths.push(path);
        }
      });
    }

    if (!paths.length && nextPaths.length) {
      nextPaths.sort(scoreCompare)
      const bestPath = nextPaths[0];

      paths = thresholdSelector({
        list: nextPaths,
        bestScore: bestPath.totalScore
      })
      nextPaths = [];

      results[bestPath.territories.size()] = bestPath
    }
  }

  return results;
}

// console.profile("profile");

const riskBoard = board();
const finalResults = []

const ts = thresholdSelector({
  fixedCapture: {
    minimum: 100,
    maximum: 100
  },
  partialCaptures: []
});

riskBoard.countryLookup.forEach(({ country }) => {

  const results = evaluate({
    country,
    thresholdSelector: ts
  });
  const conquestPath = results[41].conquestPath();

  finalResults.push({
    startingPosition: [country],
    finalScore: results[41].totalScore / 42,
    path: conquestPath
  })
})

finalResults.sort((a, b) => a.finalScore > b.finalScore ? -1 : 1)
fs.writeFileSync('results.json', JSON.stringify(finalResults));
