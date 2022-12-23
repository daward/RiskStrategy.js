module.exports = ({ fixedCapture, partialCaptures }) => {

  return ({ list, bestScore }) => {
    const retVal = list.slice(0, fixedCapture.minimum);
    let currentThreshold = 0;

    for (let i = fixedCapture.minimum; i < list.length; i++) {
      const candidate = list[i];

      while (currentThreshold < partialCaptures.length && candidate.totalScore < bestScore * partialCaptures[currentThreshold].sensitivity) {
        currentThreshold++;
      }
      if (currentThreshold === partialCaptures.length) {
        break;
      }

      if (Math.random() <= partialCaptures[currentThreshold].captureRate) {
        retVal.push(candidate)
      }
    }
    return retVal.slice(0, fixedCapture.maximum);
  }
}