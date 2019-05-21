module.exports = {
  name: 'dirOrPTagsHandler',
  checkIsAllowed: (context, {tag}) => ['div', 'p'].includes(tag),
  after: (context) => {
    context.commands.push({name: 'newLine'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'div', 'p' ],
    allowedAttributes: {
      p: [ 'style' ],
      div: [ 'style' ],
    },
  },
};