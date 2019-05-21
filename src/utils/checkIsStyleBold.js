module.exports = (node) => {
  if(node.attribs && node.attribs.style) {
    return /font-weight *: *bold/.test(node.attribs.style);
  }

  return false;
};