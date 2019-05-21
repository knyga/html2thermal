module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {node}) => node.type === 'text',
  after: (context, {node, isHasNestedTagsPresent}, depth) => {
    if(depth > 0) {
      context.commands.push({name: 'print', data: node.data});
      return context;
    } else if(!isHasNestedTagsPresent) {
      context.commands.push({name: 'println', data: node.data});
      return context;
    }
    return null;
  },
};