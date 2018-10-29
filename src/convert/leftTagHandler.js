module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'left',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Left'] : ['Left'];
    context.commands.push({name: 'alignLeft'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.slice(-1).pop() : 'Left'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'left' ],
  },
};