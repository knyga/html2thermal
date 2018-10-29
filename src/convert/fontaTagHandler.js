module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'fonta',
  before: (context) => {
    context.commands.push({name: 'setTypeFontA'});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'setTypeFontB'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'fonta' ],
  },
};