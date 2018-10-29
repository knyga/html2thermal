module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'partialcut',
  after: (context) => {
    context.commands.push({name: 'partialCut'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'partialcut' ],
  },
};