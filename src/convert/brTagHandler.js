module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'br',
  after: (context) => {
    context.commands.push({name: 'newLine'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'br' ],
  },
};