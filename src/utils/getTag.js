module.exports = (node) => {
  const match = node.toString().match(/^<([^>\/ ]+)(\/?>| )/);
  if(match && match.length > 0) {
    return match[1];
  }

  return null;
};