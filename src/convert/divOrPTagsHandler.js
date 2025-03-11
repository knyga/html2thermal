module.exports = {
  name: 'dirOrPTagsHandler',
  checkIsAllowed: (context, {tag}) => ['div', 'p', 'section'].includes(tag),
  after: (context) => {
    context.commands.push({name: 'newLine'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'div', 'p', 'section' ],
    allowedAttributes: {
      p: [ 'style' ],
      div: [ 'style' ],
      section: [ 'style' ],
    },
  },
};