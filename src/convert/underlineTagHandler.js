module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'u',
  before: (context) => {
    context.commands.push({name: 'underline', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'underline', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'u' ],
  },
};