module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'tr',
  before: (context) => {
    context.isTable = true;
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'tableCustom', data: context.data});
    context.data = [];
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'tr' ],
  },
};