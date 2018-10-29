const _ = require('lodash');

module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'code128',
  after: (context, {node, attrs}) => {
    const formattedAttrs = Object.keys(attrs).reduce((acc, name) => {
      const value = attrs[name];
      switch(name) {
        case 'width':
          const width = _.isString(value) ? value.toUpperCase() : '';
          if(['SMALL', 'MEDIUM', 'LARGE'].includes(width)) {
            acc.width = width;
          }
          break;
        case 'height':
          if(value < 50) {
            acc.height = 50;
          } else if(value > 80) {
            acc.height = 80;
          } else {
            acc.height = value;
          }
          break;
        case 'text-no':
          acc.text = 1;
          break;
        case 'text-bottom':
          acc.text = 2;
          break;
        case 'text-no-inline':
          acc.text = 3;
          break;
        case 'text-bottom-inline':
          acc.text = 4;
          break;
      }
      return acc;
    }, {});
    context.commands.push({...formattedAttrs, name: 'code128', data: attrs.data.toString() });
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'code128' ],
    transformTags: {
      code128: function(tagName, attribs) {
        const extendAttrs = ['text-no', 'text-bottom', 'text-no-inline', 'text-bottom-inline'];
        for(let i=0; i<extendAttrs.length; i++) {
          const attr = extendAttrs[i];
          if(attribs.hasOwnProperty(attr)) {
            attribs[attr] = attr;
          }
        }

        return {tagName, attribs};
      },
    },
    allowedAttributes: {
      code128: ['data', 'width', 'height', 'text-no', 'text-bottom', 'text-no-inline', 'text-bottom-inline'],
    },
  },
};