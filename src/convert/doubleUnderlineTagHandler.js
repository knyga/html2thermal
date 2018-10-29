module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'ud',
  before: (context) => {
    context.commands.push({name: 'underlineThick', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'underlineThick', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'ud' ],
  },
};