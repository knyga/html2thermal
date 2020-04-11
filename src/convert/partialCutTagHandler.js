module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'partialcut',
  before: (context) => {
    context.commands.push({name: 'partialCut'});
    if (context.characterSet) {
      context.commands.push({name: 'setCharacterSet', data: context.characterSet});
    }
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'partialcut' ],
  },
};