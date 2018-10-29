module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'rotate180',
  before: (context) => {
    context.commands.push({name: 'upsideDown', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'upsideDown', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'rotate180' ],
  },
};