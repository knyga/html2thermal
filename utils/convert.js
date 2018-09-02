const _ = require('lodash');
const sanitizeHtml = require('sanitize-html');
const {parseXml} = require('libxmljs');

const getTag = (node) => {
  const match = node.toString().match(/^<([^>\/ ]+)(\/?>| )/);
  if(match && match.length > 0) {
    return match[1];
  }

  return null;
};
const checkIsNestedTagsPresent = (node) => {
  const result = node.toString().match(/<[^>]+>/g);
  return result ? result.length > 2 : false;
};
const convertType = function(value) {
  if(value === "true") {
    return true;
  }

  if(value === "false") {
    return false;
  }

  const number = Number.parseFloat(value);
  if(!isNaN(number)) {
    return number;
  }

  return value;
};
const checkIsStyleBold = (node) => /font-weight *: *bold/.test(node.attr('style'));

const convert = (xml) => {
  const root = parseXml(`<?xml version="1.0" encoding="UTF-8"?><root>${xml.replace(/\n/g, '')}</root>`, {noblanks: true}).root();
  const nodes = root.childNodes();
  const commands = [];
  const context = {data: [], isFontA: true, isBold: false, isTable: false};
  const process = (node, depth) => {
    const tag = getTag(node);
    const innerNodes = node.childNodes();
    const isHasNestedTagsPresent = checkIsNestedTagsPresent(node);

    if(tag === 'fonta' && !context.isFontA) {
      commands.push({name: 'setTypeFontA'});
      context.isFontA = true;
    } else if(tag === 'fontb' && context.isFontA) {
      commands.push({name: 'setTypeFontB'});
      context.isFontA = false;
    } else if(tag === 'b' && !context.isBold) {
      commands.push({name: 'bold', data: true});
      context.isBold = true;
    } else if(['p', 'div'].includes(tag)) {
      if(!isHasNestedTagsPresent) {
        const isBold = checkIsStyleBold(node);
        if(isBold) {
          commands.push({name: 'bold', data: true});
        }
        commands.push({name: 'println', data: node.text()});
        if(isBold) {
          commands.push({name: 'bold', data: false});
        }
        return;
      } else if(commands.unshift() && !['println', 'newLine'].includes(commands.unshift().name)) {
        commands.push({name: 'newLine'});
      }
    } else if(tag === 'tr') {
      context.isTable = true;
    } else if(tag === 'opencashdrawer') {
      commands.push({name: 'openCashDrawer'});
      return;
    } else if(tag === 'cut') {
      commands.push({name: 'cut'});
      return;
    } else if(tag === 'partialcut') {
      commands.push({name: 'partialCut'});
      return;
    } else if(tag === 'beep') {
      commands.push({name: 'beep'});
      return;
    }

    if(tag !== 'td') {
      for(let i=0; i<innerNodes.length; i++) {
        const innerNode = innerNodes[i];
        process(innerNode, depth+1);
      }
    }

    if(tag === 'fonta' && context.isFontA) {
      commands.push({name: 'setTypeFontB'});
      context.isFontA = false;
    } else if(tag === 'fontb' && !context.isFontA) {
      commands.push({name: 'setTypeFontA'});
      context.isFontA = true;
    } else if(tag === 'b' && context.isBold) {
      commands.push({name: 'bold', data: false});
      context.isBold = false;
    } else if(tag === 'tr') {
      commands.push({name: 'tableCustom', data: context.data});
      context.data = [];
      context.isTable = false;
    } else if(tag === 'td') {
      const attrs = node.attrs().map(attr => ({name: attr.name(), value: attr.value()}))
        .reduce((acc, {name, value}) => ({...acc, [name]: convertType(value)}), {});
      if(/<b>.+<\/b>/.test(node.toString()) || checkIsStyleBold(node)) {
        attrs.bold = true;
        delete attrs.style;
      }
      context.data.push({...attrs, text: node.text()});
    } else if(tag === 'br') {
      commands.push({name: 'newLine'});
    } else if(depth > 0 && !context.isTable) {
      commands.push({name: 'print', data: node.text()});
    } else if(!isHasNestedTagsPresent && !context.isTable) {
      commands.push({name: 'println', data: node.text()});
    }
  };

  for(let i=0; i<nodes.length; i++) {
    const node = nodes[i];
    process(node, 0);
  }

  return commands;
};

module.exports = function(dirtyXml) {
  const cleanXml = sanitizeHtml(dirtyXml, {
    allowedTags: [ 'div', 'p', 'td', 'tr', 'br', 'b', 'fontb', 'fonta', 'opencashdrawer', 'cut', 'partialcut', 'beep' ],
    allowedAttributes: {
      td: ['width', 'align', 'bold', 'style'],
      p: ['style'],
      div: ['style'],
    },
  });

  const result = convert(cleanXml);
  console.log(JSON.stringify(result, null, 2));
  return result;
};