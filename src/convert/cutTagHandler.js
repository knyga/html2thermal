module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'cut',
  after: (context) => {
    context.commands.push({name: 'cut'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'cut' ],
  },
};