const fs = require('fs');
const temp = require('temp');
const _ = require('lodash');
const base64Img = require('base64-img');

module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'img',
  after: async (context, {attrs}) => {
    temp.track();
    return new Promise((resolve) => {
      const src = attrs.src.toString();
      if(/^data:image\/.+;base64,/.test(src)) {
        temp.open('printerimg', function(err, info) {
          if(err) {
            resolve(context);
          } else {
            const base64Image = src.split(';base64,').pop();
            fs.writeFile(info.path, base64Image, {encoding: 'base64'}, function(err) {
              if(err) {
                resolve(context);
              } else {
                context.commands.push({name: 'printImage', data: info.path, isAwait: true });
                resolve(context);
              }
            });
          }
        });
      } else {
        context.commands.push({name: 'printImage', data: src, isAwait: true });
        resolve(context);
      }
    });
  },
  sanitizeHtml: {
    allowedTags: [ 'img' ],
    allowedAttributes: {
      img: ['src'],
    },
    allowedSchemes: [ 'data', 'http' ],
  },
};