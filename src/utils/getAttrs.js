const convertType = require('./convertType');

module.exports = (node) => {
  if(!node.attribs) {
    return {};
  }

  const keys = Object.keys(node.attribs);
  const vals = {};
  for(let i=0; i<keys.length; i+=1) {
    vals[keys[i]] = convertType(node.attribs[keys[i]]);
  }
  return vals;
};

// module.exports = (node) => node.attrs().map(attr => ({name: attr.name(), value: attr.value()}))
//   .reduce((acc, {name, value}) => ({...acc, [name]: convertType(value)}), {});