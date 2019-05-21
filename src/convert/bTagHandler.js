module.exports = {
  name: 'bTagHandler',
  stackName: 'bold',
  checkIsAllowed: (context, {tag}) => tag === 'b',
  before: (context) => {
    context.commands.push({name: 'bold', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'bold', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'b' ],
  },
};