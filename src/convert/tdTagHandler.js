const checkIsStyleBold = require('../utils/checkIsStyleBold');

const tdTagHandler = {
  isIgnoreOtherHandlers: true,
  checkIsAllowed: (context, {tag}) => tag === 'td',
  checkIsBold: (node) => {
    if(/<b>.+<\/b>/.test(node.toString()) || checkIsStyleBold(node)) {
      return true;
    }
    return false;
  },
  during: (context) => context,
  after: (context, {node, attrs}) => {
    if(tdTagHandler.checkIsBold(node)) {
      attrs.bold = true;
      delete attrs.style;
    }
    context.data.push({...attrs, text: node.children[0].data});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'td' ],
    allowedAttributes: {
      td: ['width', 'align', 'bold', 'style'],
    },
  }
};

module.exports = tdTagHandler;