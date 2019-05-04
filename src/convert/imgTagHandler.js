const fs = require('fs');
const temp = require('temp');
const download = require('download');

module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'img',
  after: async (context, {attrs}) => {
    temp.track();
    return new Promise((resolve) => {
      const src = attrs.src.toString();
      if(/^data:image\/.+;base64,/.test(src)) {
        // TODO unify temp dir creation
        temp.open('printerimg', (err, info) => {
          if(err) {
            resolve(context);
          } else {
            const base64Image = src.split(';base64,').pop();
            const path = info.path;
            fs.writeFile(path, base64Image, {encoding: 'base64'}, (err) => {
              if(err) {
                resolve(context);
              } else {
                context.commands.push({name: 'printImage', data: path, isAwait: true });
                resolve(context);
              }
            });
          }
        });
      } else if(/^https?:\/\/.+/.test(src)) {
        temp.open('printerimg', (err, info) => {
          if(err) {
            resolve(context);
          } else {
            const path = info.path;
            let data = null;

            try {
              data = download(src);
            } catch(e) {
              resolve(context);
            }

            fs.writeFile(path, data, (err) => {
              if(err) {
                resolve(context);
              } else {
                context.commands.push({name: 'printImage', data: path, isAwait: true });
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
    allowedSchemes: [ 'data', 'http', 'https' ],
  },
};