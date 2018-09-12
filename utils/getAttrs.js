const convertType = require('./convertType');
module.exports = (node) => node.attrs().map(attr => ({name: attr.name(), value: attr.value()}))
  .reduce((acc, {name, value}) => ({...acc, [name]: convertType(value)}), {});