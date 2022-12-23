const results = require("./result.json")

const compareCountries = (a, b) => {
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff += Math.abs(i - b.indexOf(a[i]))
  }
  return diff;
}

compareCountries(results["Congo"], results["Mongolia"]);

const countries = Object.keys(results);
const differences = {};
for (let i = 0; i < countries.length - 1; i++) {
  for (let j = i + 1; j < countries.length; j++) {
    const diff = compareCountries(results[countries[i]], results[countries[j]]);
    if (!differences[countries[i]]) {
      differences[countries[i]] = {}
    }
    if (!differences[countries[j]]) {
      differences[countries[j]] = {}
    }
    differences[countries[i]][countries[j]] = diff;
    differences[countries[j]][countries[i]] = diff;
  }
}
// console.log(JSON.stringify(differences));