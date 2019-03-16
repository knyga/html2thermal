const _ = require('lodash');

module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'img',
  after: (context, {attrs}) => {
    context.commands.push({name: 'printImage', data: attrs.src.toString() });
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'img' ],
    allowedAttributes: {
      img: ['src'],
    },
  },
};