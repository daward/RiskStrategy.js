const TerritorySet = require('./territoryset');
const Path = require("./path");
const { add } = require('sorted-array-functions');

class RiskBoard {
  constructor() {
    this.countryIndex = {};
    this.countryLookup = [];
    this.continents = [];
  }

  createInitialBoardState(territoryNames) {
    this.countryLookup.forEach(country => {
      country.paths = {}
    })
    const territorySet = new TerritorySet();
    territoryNames.forEach(territory => {
      territorySet.add(this.index(territory))
    })
    const retVal = new Path({ map: this, territories: territorySet });
    retVal.detectBorders();
    return retVal;
  }

  territoryName(territory) {
    return this.countryLookup[Number(territory)].country;
  }

  index(country) {
    let retVal = this.countryIndex[country];
    if (retVal === undefined) {
      retVal = this.countryLookup.length;
      this.countryLookup.push({
        country,
        borders: [],
        paths: {}
      });
      this.countryIndex[country] = retVal;
    }
    return retVal;
  }

  addBorders(country, borders) {
    const c1 = this.index(country);
    const add = (borders, value) => {
      if (borders.find(v => v === Number(value)) === undefined) {
        borders.push(Number(value))
      }
    }
    borders.forEach(borderCountry => {
      const c2 = this.index(borderCountry);
      add(this.countryLookup[Number(c1)].borders, c2)
      add(this.countryLookup[Number(c2)].borders, c1)
    })
  }

  addContinent({ continent, bonus, countries }) {

    const territorySet = new TerritorySet();
    countries.forEach(country => {
      territorySet.add(this.index(country))
    });
    this.continents.push({
      continent,
      bonus,
      territorySet
    })
  }

  scanNeighbors(territoryId, territoryWalker) {
    const { borders } = this.countryLookup[Number(territoryId)];
    for (let i = 0; i < borders.length; i++) {
      if (territoryWalker(borders[i])) {
        break;
      }
    }
  }

  continentScore(territories) {
    let retVal = 0;
    this.continents.forEach(({ territorySet, bonus }) => {
      retVal += territories.containsSet(territorySet) ? bonus : 0
    });
    return retVal;
  }

  getPathsThroughTerritory(territory) {
    const { paths } = this.countryLookup[Number(territory)];
    return paths;
  }

  toString(territorySet) {
    const territories = [];
    territorySet.walk(territory => {
      territories.push(this.countryLookup[Number(territory)].country)
    })
    return territories.join(", ");
  }
}

module.exports = () => {
  const riskBoard = new RiskBoard();
  riskBoard.addContinent({
    continent: "Australia",
    countries: [
      "New Guinea",
      "Western Australia",
      "Eastern Australia",
      "Indonesia"
    ],
    bonus: 2
  })

  riskBoard.addContinent({
    continent: "South America",
    countries: [
      "Venezuela",
      "Peru",
      "Brazil",
      "Argentina"
    ],
    bonus: 2
  });

  riskBoard.addContinent({
    continent: "Europe",
    countries: [
      "Iceland",
      "Scandinavia",
      "Ukraine",
      "Great Britain",
      "Northern Europe",
      "Southern Europe",
      "Western Europe"
    ],
    bonus: 5
  })

  riskBoard.addContinent({
    continent: "Africa",
    countries: [
      "North Africa",
      "Egypt",
      "East Africa",
      "Congo",
      "South Africa",
      "Madagascar"
    ],
    bonus: 3
  })

  riskBoard.addContinent({
    continent: "North America",
    countries: [
      "Alaska",
      "Northwest Territory",
      "Greenland",
      "Alberta",
      "Ontario",
      "Quebec",
      "Western United States",
      "Eastern United States",
      "Central America"
    ],
    bonus: 5
  })

  riskBoard.addContinent({
    continent: "Asia",
    countries: [
      "Siam",
      "India",
      "China",
      "Mongolia",
      "Japan",
      "Irkutsk",
      "Yakutsk",
      "Kamchatka",
      "Siberia",
      "Afghanistan",
      "Ural",
      "Middle East"
    ],
    bonus: 7
  });

  riskBoard.addBorders("New Guinea", ["Indonesia", "Western Australia", "Eastern Australia"])
  riskBoard.addBorders("Eastern Australia", ["Western Australia", "New Guinea"])
  riskBoard.addBorders("Western Australia", ["Eastern Australia", "New Guinea", "Indonesia"])
  riskBoard.addBorders("Indonesia", ["Western Australia", "New Guinea", "Siam"])

  // Asia
  riskBoard.addBorders("Siam", ["China", "India", "Indonesia"])
  riskBoard.addBorders("India", ["China", "Afghanistan", "Middle East", "Siam"])
  riskBoard.addBorders("China", ["India", "Afghanistan", "Ural", "Siberia", "Mongolia", "Siam"])
  riskBoard.addBorders("Mongolia", ["Irkutsk", "Kamchatka", "Siberia", "China", "Japan"])
  riskBoard.addBorders("Japan", ["Mongolia", "Kamchatka"])
  riskBoard.addBorders("Kamchatka", ["Irkutsk", "Yakutsk", "Mongolia", "Alaska", "Japan"])
  riskBoard.addBorders("Yakutsk", ["Irkutsk", "Kamchatka", "Siberia"])
  riskBoard.addBorders("Irkutsk", ["Yakutsk", "Kamchatka", "Siberia", "Mongolia"])
  riskBoard.addBorders("Siberia", ["Yakutsk", "Irkutsk", "Siberia", "China", "Ural"])
  riskBoard.addBorders("Ural", ["Afghanistan", "Siberia", "China", "Ukraine"])
  riskBoard.addBorders("Afghanistan", ["Ural", "India", "China", "Ukraine", "Middle East"])
  riskBoard.addBorders("Middle East", ["Afghanistan", "India", "Egypt", "Ukraine", "Southern Europe", "East Africa"])

  // Africa
  riskBoard.addBorders("Egypt", ["Middle East", "North Africa", "East Africa", "Southern Europe"])
  riskBoard.addBorders("North Africa", ["Egypt", "Western Europe", "Brazil", "Southern Europe", "Congo", "East Africa"])
  riskBoard.addBorders("East Africa", ["Egypt", "South Africa", "Madagascar", "Congo", "North Africa"])
  riskBoard.addBorders("Congo", ["South Africa", "East Africa", "North Africa"])
  riskBoard.addBorders("South Africa", ["East Africa", "Madagascar", "Congo"])
  riskBoard.addBorders("Madagascar", ["East Africa", "South Africa"])

  // South America
  riskBoard.addBorders("Brazil", ["North Africa", "Venezuela", "Peru", "Argentina"])
  riskBoard.addBorders("Argentina", ["Peru", "Brazil"])
  riskBoard.addBorders("Peru", ["Venezuela", "Brazil", "Argentina"])
  riskBoard.addBorders("Venezuela", ["Peru", "Brazil", "Central America"])

  // North America
  riskBoard.addBorders("Central America", ["Western United States", "Eastern United States", "Venezuela"])
  riskBoard.addBorders("Western United States", ["Central America", "Eastern United States", "Alberta", "Ontario"])
  riskBoard.addBorders("Eastern United States", ["Central America", "Western United States", "Quebec", "Ontario"])
  riskBoard.addBorders("Ontario", ["Northwest Territory", "Greenland", "Alberta", "Western United States", "Quebec", "Eastern United States"])
  riskBoard.addBorders("Alberta", ["Northwest Territory", "Ontario", "Western United States", "Alaska"])
  riskBoard.addBorders("Quebec", ["Greenland", "Ontario", "Eastern United States"])
  riskBoard.addBorders("Greenland", ["Northwest Territory", "Iceland", "Quebec", "Ontario"])
  riskBoard.addBorders("Northwest Territory", ["Greenland", "Alaska", "Alberta", "Ontario"])
  riskBoard.addBorders("Alaska", ["Kamchatka", "Northwest Territory", "Alberta"])

  // Europe
  riskBoard.addBorders("Iceland", ["Great Britain", "Greenland", "Scandinavia"])
  riskBoard.addBorders("Great Britain", ["Iceland", "Western Europe", "Scandinavia", "Northern Europe"])
  riskBoard.addBorders("Scandinavia", ["Iceland", "Ukraine", "Great Britain", "Northern Europe"])
  riskBoard.addBorders("Western Europe", ["North Africa", "Southern Europe", "Great Britain", "Northern Europe"])
  riskBoard.addBorders("Southern Europe", ["North Africa", "Western Europe", "Egypt", "Northern Europe", "Ukraine", "Middle East"])
  riskBoard.addBorders("Ukraine", ["Southern Europe", "Afghanistan", "Ural", "Northern Europe", "Scandinavia", "Middle East"])
  riskBoard.addBorders("Northern Europe", ["Southern Europe", "Great Britain", "Ukraine", "Western Europe", "Scandinavia"])

  return riskBoard;
}