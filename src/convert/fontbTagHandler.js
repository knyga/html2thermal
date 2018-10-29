module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'fontb',
  before: (context) => {
    context.commands.push({name: 'setTypeFontB'});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'setTypeFontA'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'fontb' ],
  },
};