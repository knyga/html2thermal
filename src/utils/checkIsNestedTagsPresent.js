module.exports = (node) => {
  const result = node.toString().match(/<[^>]+>/g);
  return result ? result.length > 2 : false;
};