const fs = require('fs');
const temp = require('temp');
const download = require('download');
const sharp = require('sharp');

// TODO add cache for input path - output path

const getImage = (attrs) => new Promise((resolve, reject) => {
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
            reject();
          } else {
            resolve(path);
          }
        });
      }
    });
  } else if(/^https?:\/\/.+/.test(src)) {
    temp.open('printerimg', async (err, info) => {
      if(err) {
        reject();
      } else {
        const path = info.path;
        let data = null;

        try {
          data = await download(src);
        } catch(e) {
          reject();
        }

        fs.writeFile(path, data, (err) => {
          if(err) {
            reject();
          } else {
            resolve(path);
          }
        });
      }
    });
  } else {
    resolve(src);
  }
});

module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'img',
  after: async (context, {attrs}) => {
    temp.track();
    return new Promise(async (resolve) => {
      try {
        const imagePath = await getImage(attrs);

        if(attrs.width || attrs.height) {
          const size = {};
          if(attrs.width) {
            size.width = attrs.width;
          }
          if(attrs.height) {
            size.height = attrs.height;
          }

          temp.open('printerimg', async (err, info) => {
            if(err) {
              reject();
            } else {
              const path = info.path;
              sharp(imagePath)
                .resize(size)
                .toFile(path, (err) => {
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
          context.commands.push({name: 'printImage', data: imagePath, isAwait: true });
          resolve(context);
        }
      } catch(e) {
        resolve(context);
      }
    });
  },
  sanitizeHtml: {
    allowedTags: [ 'img' ],
    allowedAttributes: {
      img: ['src', 'width', 'height'],
    },
    allowedSchemes: [ 'data', 'http', 'https' ],
  },
};