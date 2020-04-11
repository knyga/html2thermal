module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'partialcut',
  before: (context) => {
    context.commands.push({name: 'partialCut'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'partialcut' ],
  },
};