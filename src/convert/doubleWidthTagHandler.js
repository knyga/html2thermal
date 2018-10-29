module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'doublewidth',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'DoubleWidth'] : ['DoubleWidth'];
    context.commands.push({name: 'setTextDoubleWidth'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'doublewidth' ],
  },
};