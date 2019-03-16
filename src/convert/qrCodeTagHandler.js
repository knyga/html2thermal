const _ = require('lodash');

module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'qrcode',
  after: (context, {attrs}) => {
    const formattedAttrs = Object.keys(attrs).reduce((acc, name) => {
      const value = attrs[name];
      switch(name) {
        case 'cellsize':
          const cellSize = Number.parseInt(value);
          if(cellSize >= 1 && cellSize <= 8) {
            acc.cellSize = cellSize;
          }
          break;
        case 'correction':
          const correction = _.isString(value) ? value.toUpperCase() : '';
          if(['L', 'M', 'Q', 'H'].includes(correction)) {
            acc.correction = correction;
          }
          break;
        case 'model':
          const map = {
            big: 1,
            standard: 2,
            micro: 3,
          };
          const model = map[_.isString(value) ? value.toLowerCase() : ''];
          if(model) {
            acc.model = model;
          } else {
            const numberModel = Number.parseInt(value);
            if(numberModel >= 1 && numberModel <= 3) {
              acc.model = numberModel;
            }
          }
          break;
      }
      return acc;
    }, {});
    context.commands.push({...formattedAttrs, name: 'printQR', data: attrs.data.toString() });
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'qrcode' ],
    allowedAttributes: {
      qrcode: ['data', 'cellsize', 'correction', 'model'],
    },
  },
};