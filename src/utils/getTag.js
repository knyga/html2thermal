module.exports = (node) => {
  if(node.type === 'tag') {
    return node.name;
  }
  // const match = node.toString().match(/^<([^>\/ ]+)(\/?>| )/);
  // if(match && match.length > 0) {
  //   return match[1];
  // }

  return null;
};