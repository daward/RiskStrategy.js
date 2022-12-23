class TerritorySet {
  constructor({ territorySet = null } = {}) {
    if (territorySet) {
      this.data = territorySet.data.slice();
      this.values = territorySet.values.slice();
    } else {
      this.data = Array.from({ length: 42 }, () => false);
      this.values = [];
    }
  }

  add(territory) {
    if (!this.data[territory]) {
      this.data[territory] = true
      this.values.push(territory);
    }

  }

  cloneAdd(territory) {
    const retVal = new TerritorySet({ territorySet: this })
    retVal.add(territory);
    return retVal;
  }

  remove(territory) {
    if (this.data[territory]) {
      this.data[territory] = false;
      this.values.splice(this.values.indexOf(territory), 1)
    }
  }

  cloneRemove(territory) {
    const retVal = new TerritorySet({ territorySet: this })
    retVal.remove(territory);
    return retVal;
  }

  getHash() {
    let retVal = 0n
    this.walk(territoryId => {
      retVal += (2n ** BigInt(territoryId))
      return false;
    })
    return retVal;
  }

  contains(territory) {
    return this.data[territory];
  }

  containsSet(territorySet) {
    let retVal = true;
    territorySet.walk(territoryId => {
      if (!this.data[territoryId]) {
        retVal = false;
        return true;
      }
      return false
    })
    return retVal;
  }

  walk(territoryWalker) {
    this.values.forEach(territoryId => {
      if (territoryWalker(territoryId)) {
        return;
      }
    })
  }

  size() {
    return this.values.length;
  }
}

module.exports = TerritorySet;