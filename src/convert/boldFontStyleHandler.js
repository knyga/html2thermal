const checkIsStyleBold = require('../utils/checkIsStyleBold');
const bTagHandler = require('./bTagHandler');

module.exports = {
  ...bTagHandler,
  name: 'boldFontStyleHandler',
  checkIsAllowed: (context, {node}) => checkIsStyleBold(node),
  sanitizeHtml: {
    allowedAttributes: {
      '*': [ 'style' ],
    },
  }
};