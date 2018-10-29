const checkIsStyleBold = require('../utils/checkIsStyleBold');
const bTagHandler = require('./bTagHandler');

module.exports = {
  ...bTagHandler,
  checkIsAllowed: (context, {node}) => checkIsStyleBold(node),
  sanitizeHtml: {
    allowedAttributes: {
      '*': [ 'style' ],
    },
  }
};