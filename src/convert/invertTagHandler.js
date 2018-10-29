module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'invert',
  before: (context) => {
    context.commands.push({name: 'invert', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'invert', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'invert' ],
  },
};