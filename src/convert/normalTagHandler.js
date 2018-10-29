module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'normal',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'Normal'] : ['Normal'];
    context.commands.push({name: 'setTextNormal'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'normal' ],
  },
};