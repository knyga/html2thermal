module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'opencashdrawer',
  after: (context) => {
    context.commands.push({name: 'openCashDrawer'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'opencashdrawer' ],
  },
};