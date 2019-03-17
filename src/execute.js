const convert = require('./convert');

module.exports = async (printer, html, isCut = true) => {
  const commands = convert(html);

  for(let i=0;i<commands.length;i++) {
    const {name, data, isAwait, ...attributes} = commands[i];
    if(isAwait) {
      await printer[name](data, attributes);
    } else {
      printer[name](data, attributes);
    }
  }

  if(isCut) {
    printer.cut();
  }

  return new Promise((resolve, reject) => printer.execute((err) => {
    if(err) {
      reject(err);
    } else {
      resolve();
    }
  }));
};