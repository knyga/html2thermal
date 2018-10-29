module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'doubleheight',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'DoubleHeight'] : ['DoubleHeight'];
    context.commands.push({name: 'setTextDoubleHeight'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'doubleheight' ],
  },
};