const fs = require('fs');
const temp = require('temp');
const https = require('https');
const http = require('http');
const jimp = require('jimp');

// TODO add cache for input path - output path

const getImage = (attrs) => new Promise((resolve, reject) => {
  const src = attrs.src.toString();
  if (/^data:image\/.+;base64,/.test(src)) {
    // TODO unify temp dir creation
    temp.open('printerimg', (err, info) => {
      if (err) {
        resolve(context);
      } else {
        const base64Image = src.split(';base64,').pop();
        const path = info.path;
        fs.writeFile(path, base64Image, {encoding: 'base64'}, (err) => {
          if (err) {
            reject();
          } else {
            resolve(path);
          }
        });
      }
    });
  } else if (/^https?:\/\/.+/.test(src)) {
    temp.open('printerimg', (err, info) => {
      if (err) {
        reject();
      } else {
        const path = info.path;
        const isHttps = src.startsWith('https://');
        const client = isHttps ? https : http;
        
        const fileStream = fs.createWriteStream(path);
        
        client.get(src, (response) => {
          if (response.statusCode !== 200) {
            reject();
            return;
          }
          
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(path);
          });
        }).on('error', (err) => {
          fs.unlink(path, () => {});
          reject();
        });
      }
    });
  } else {
    temp.open('printerimg', (err, info) => {
      if (err) {
        resolve(context);
      } else {
        fs.copyFile(/^file:\/\/.+/.test(src) ? src.slice(7) : src, info.path, (err) => {
          if(err) {
            reject();
          } else {
            resolve(info.path);
          }
        });
      }
    });
  }
});

module.exports = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'img',
  after: async(context, {attrs}) => {
    temp.track();
    return new Promise(async(resolve) => {
      try {
        const imagePath = await getImage(attrs);
        let size = null;

        if (attrs.width || attrs.height) {
          size = {};
          if (attrs.width) {
            size.width = attrs.width;
          }
          if (attrs.height) {
            size.height = attrs.height;
          }
        }

        temp.open('printerimg', async(err, info) => {
          if (err) {
            reject();
          } else {
            const path = `${info.path}.png`;
            jimp.read(imagePath, (err, lenna) => {
              if(err) {
                resolve(context);
              } else {
                let chain = lenna;
                if (size !== null) {
                  chain = chain.resize.apply(chain,
                    [size.width ? +size.width : jimp.AUTO,
                      size.height ? +size.height : jimp.AUTO]);
                }
                chain.write(path, (err) => {
                  if(!err) {
                    context.commands.push({name: 'printImage', data: path, isAwait: true});
                  }

                  resolve(context);
                })
              }
            });
          }
        });
      } catch (e) {
        resolve(context);
      }
    });
  },
  sanitizeHtml: {
    allowedTags: ['img'],
    allowedAttributes: {
      img: ['src', 'width', 'height'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
  },
};