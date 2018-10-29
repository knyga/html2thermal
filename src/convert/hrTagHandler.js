module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'hr',
  after: (context) => {
    context.commands.push({name: 'drawLine'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'hr' ],
  },
};