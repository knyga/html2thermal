module.exports = {
  checkIsAllowed: (context, {tag}) => tag === 'quadarea',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'QuadArea'] : ['QuadArea'];
    context.commands.push({name: 'setTextQuadArea'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'quadarea' ],
  },
};