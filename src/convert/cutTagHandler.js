module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'cut',
  before: (context) => {
    context.commands.push({name: 'cut'});
    if (context.characterSet) {
      context.commands.push({name: 'setCharacterSet', data: context.characterSet});
    }
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'cut' ],
  },
};