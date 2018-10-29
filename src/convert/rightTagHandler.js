module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'right',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Right'] : ['Right'];
    context.commands.push({name: 'alignRight'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.slice(-1).pop() : 'Left'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'right' ],
  },
};