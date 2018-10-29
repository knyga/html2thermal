module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'beep',
  after: (context) => {
    context.commands.push({name: 'beep'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'beep' ],
  },
};