module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: () => true,
  after: (context, {node, isHasNestedTagsPresent}, depth) => {
    if(depth > 0) {
      context.commands.push({name: 'print', data: node.text()});
      return context;
    } else if(!isHasNestedTagsPresent) {
      context.commands.push({name: 'println', data: node.text()});
      return context;
    }
    return null;
  },
};