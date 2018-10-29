module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'center',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Center'] : ['Center'];
    context.commands.push({name: 'alignCenter'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.slice(-1).pop() : 'Left'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'center' ],
  },
};