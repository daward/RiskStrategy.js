const TerritorySet = require("./territoryset");

class Path {
  constructor({
    map,
    territories,
    borders = new TerritorySet(),
    borderTerritories = new TerritorySet(),
    parent,
    conquest,
    distance
  }) {
    this.map = map;
    this.territories = territories;
    this.totalScore = 0;
    this.borders = borders;
    this.borderTerritories = borderTerritories;
    this.parent = parent;
    this.conquest = conquest;
    this.distance = distance || this.territories.size()
  }

  detectBorders() {

    // walk through each territory
    this.territories.walk(territoryId => {

      // assume at first we haven't detected a border
      let border = false;

      // then go through all of its neighbors
      this.map.scanNeighbors(territoryId, neighborId => {

        // if any of those neighbors aren't already owned by us,
        // then we've found a border
        if (!this.territories.contains(neighborId)) {
          border = true;
          // that neighbor is a border
          this.borders.add(neighborId);
        }
      })
      // if we found a border in our scan
      // that means this territory is a friendly border
      if (border) {
        this.borderTerritories.add(territoryId);
      }
    })
  }

  detectNewBorders(newTerritory) {

    // start by assuming everyone around the new territory is already 
    // a territory that I own, we'll see if that's actually true
    let protectedConquest = true;
    // go through all the neighbors of the new territory
    this.map.scanNeighbors(newTerritory, neighbor => {

      // we'll only ever find border territories at this point (or enemy borders)
      if (this.borderTerritories.contains(neighbor)) {

        // just as we assumed before that 
        let protectedBorder = true;

        // scan all the neighbors of the neighbor to see if we have any enemies now
        this.map.scanNeighbors(neighbor, n2 => {
          if (!this.territories.contains(n2)) {
            protectedBorder = false
            return true;
          }
        })

        // if all the neighbors territories are already territories, then the neighbor is now not a border
        if (protectedBorder) {
          this.borderTerritories.remove(neighbor)
        }
      } else {
        // if we found somebody that wasn't a friend, then we're not protected now
        protectedConquest = false
        this.borders.add(neighbor);
      }
    })

    // if we found we had no enemies, then we can remove this as a border at all
    if (protectedConquest) {
      this.borderTerritories.remove(newTerritory)
    }
  }

  score() {
    return (this.map.continentScore(this.territories) + Math.floor(this.distance / 3)) / this.borderTerritories.size();
  }

  isComplete() {
    return this.distance === 42;
  }

  pathString() {
    return this.territories.join("->") + " " + this.totalScore;
  }

  markRedundant(newTerritory) {

    const paths = this.map.getPathsThroughTerritory(newTerritory)
    const hash = this.territories.getHash();
    const incumbent = paths[hash]

    if (!incumbent) {
      paths[hash] = this;
      return false
    }

    // if we've already found something as good as this or better,
    // then we don't need to explore this further
    if (incumbent.totalScore >= this.totalScore) {
      // we'll call this redundant and move on
      this.isRedundant = true;
      return true;
    } else {
      // otherwise we have an incumbent to unseat and we should move on
      incumbent.isRedundant = true;
      paths[hash] = this;
      return false;
    }
  }

  expand() {
    const retVal = [];
    this.borders.walk(territoryId => {
      retVal.push(this.conquer(territoryId))
    });
    return retVal;
  }

  conquestPath() {
    let current = this;
    const retVal = [];
    while (current != null) {
      if (current.conquest === undefined) {
        current.territories.walk(territory => {
          retVal.push({
            country: this.map.territoryName(territory),
            distance: 0,
            score: 0
          })
        });
      } else {
        retVal.push({
          country: this.map.territoryName(current.conquest),
          distance: current.distance,
          score: current.totalScore
        })
      }
      current = current.parent;
    }
    return retVal.reverse();
  }

  conquer(territory) {

    if (!this.borders.contains(territory)) {
      throw new Error("You can only conquer lands adjacent to your own");
    }

    // build the next path
    const retVal = new Path({
      map: this.map,
      territories: this.territories.cloneAdd(territory),
      borders: this.borders.cloneRemove(territory),
      borderTerritories: this.borderTerritories.cloneAdd(territory),
      parent: this,
      conquest: territory,
      distance: this.distance + 1
    });

    // determine the new borders
    retVal.detectNewBorders(territory);

    // get the score for this
    retVal.totalScore = this.totalScore + retVal.score();

    // then find out if we already have as good an option
    retVal.markRedundant(territory);

    return retVal;
  }
};

module.exports = Path;