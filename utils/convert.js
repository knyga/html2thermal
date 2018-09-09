const _ = require('lodash');
const sanitizeHtml = require('sanitize-html');
const {parseXml} = require('libxmljs');
const convertType = require('./convertType');
const getTag = require('./getTag');
const checkIsNestedTagsPresent = require('./checkIsNestedTagsPresent');
const checkIsStyleBold = require('./checkIsStyleBold');

const fontaTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'fonta',
  before: (context) => {
    context.commands.push({name: 'setTypeFontA'});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'setTypeFontB'});
    return context;
  }
});
const fontbTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'fontb',
  before: (context) => {
    context.commands.push({name: 'setTypeFontB'});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'setTypeFontA'});
    return context;
  }
});
const trTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'tr',
  before: (context) => {
    context.isTable = true;
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'tableCustom', data: context.data});
    context.data = [];
    return context;
  }
});
const tdTagHandler = ({
  isIgnoreOtherHandlers: true,
  checkIsAllowed: (context, {tag}) => tag === 'td',
  checkIsBold: (node) => {
    if(/<b>.+<\/b>/.test(node.toString()) || checkIsStyleBold(node)) {
      return true;
    }
    return false;
  },
  during: (context) => context,
  after: (context, {node}) => {
    const attrs = node.attrs().map(attr => ({name: attr.name(), value: attr.value()}))
      .reduce((acc, {name, value}) => ({...acc, [name]: convertType(value)}), {});
    if(tdTagHandler.checkIsBold(node)) {
      attrs.bold = true;
      delete attrs.style;
    }
    context.data.push({...attrs, text: node.text()});
    return context;
  }
});
const divOrPTagsHandler = ({
  checkIsAllowed: (context, {tag}) => ['div', 'p'].includes(tag),
  after: (context) => {
    context.commands.push({name: 'newLine'});
    return context;
  },
});
const notagHandler = ({
  isWithoutClosingTag: true,
  checkIsAllowed: () => true,
  after: (context, {node, isHasNestedTagsPresent}, depth) => {
    if(depth > 0) {
      context.commands.push({name: 'print', data: node.text()});
      return context;
    } else if(!isHasNestedTagsPresent) {
      context.commands.push({name: 'println', data: node.text()});
      return context;
    }
    return null;
  }
});
const bTagHandler = ({
  stackName: 'bold',
  checkIsAllowed: (context, {tag}) => tag === 'b',
  before: (context) => {
    context.commands.push({name: 'bold', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'bold', data: false});
    return context;
  }
});
const boldFontStyleHandler = ({
  stackName: 'bold',
  checkIsAllowed: (context, {node}) => checkIsStyleBold(node),
  before: (context) => {
    context.commands.push({name: 'bold', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'bold', data: false});
    return context;
  }
});
const brTagHandler = ({
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'br',
  after: (context) => {
    context.commands.push({name: 'newLine'});
    return context;
  },
});
const openCashDrawerTagHandler = ({
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'opencashdrawer',
  after: (context) => {
    context.commands.push({name: 'openCashDrawer'});
    return context;
  },
});
const cutTagHandler = ({
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'cut',
  after: (context) => {
    context.commands.push({name: 'cut'});
    return context;
  },
});
const beepTagHandler = ({
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'beep',
  after: (context) => {
    context.commands.push({name: 'beep'});
    return context;
  },
});
const partialCutTagHandler = ({
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'partialcut',
  after: (context) => {
    context.commands.push({name: 'partialCut'});
    return context;
  },
});
const rotate180TagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'rotate180',
  before: (context) => {
    context.commands.push({name: 'upsideDown', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'upsideDown', data: false});
    return context;
  }
});
const invertTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'invert',
  before: (context) => {
    context.commands.push({name: 'invert', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'invert', data: false});
    return context;
  }
});

const process = (context, node, depth) => {
  const handlersCollection = [
    // order matters
    trTagHandler,
    tdTagHandler,

    boldFontStyleHandler,

    brTagHandler,
    openCashDrawerTagHandler,
    cutTagHandler,
    beepTagHandler,
    partialCutTagHandler,

    fontaTagHandler,
    fontbTagHandler,
    bTagHandler,
    rotate180TagHandler,
    invertTagHandler,

    divOrPTagsHandler,

    notagHandler,
  ];
  const nodeGroup = {
    node,
    tag: getTag(node),
    innerNodes: node.childNodes(),
    isHasNestedTagsPresent: checkIsNestedTagsPresent(node),
  };
  // find current handler
  let handlers = handlersCollection.filter(handler => handler.checkIsAllowed(context, nodeGroup, depth));
  for(let i=0; i<handlers.length; i++) {
    if(handlers[i].isIgnoreOtherHandlers) {
      handlers = [handlers[i]];
      break;
    }
  }
  // remove notagHandler if found anything
  if(handlers.length > 1) {
    handlers.pop();
  }
  for(let i=0; i<handlers.length; i++) {
    const {before, stackName: handlerStackName, isWithoutClosingTag} = handlers[i];
    const stackName = handlerStackName ? handlerStackName : nodeGroup.tag;
    if(before && (!context.stack[stackName] || isWithoutClosingTag)) {
      const result = before(context, nodeGroup, depth);
      context = result === null ? context : result;
    }
    context.stack[stackName] = context.stack[stackName] ? context.stack[stackName] + 1 : 1;
  }
  const withDuringHandlers = handlers.filter(handler => handler.during);
  if(withDuringHandlers.length > 0) {
    for(let i=0; i<withDuringHandlers.length; i++) {
      const {during} = withDuringHandlers[i];
      if(during) {
        const result = during(context, nodeGroup, depth);
        context = result === null ? context : result;
      }
    }
  } else {
    for(let i=0; i<nodeGroup.innerNodes.length; i++) {
      const innerNode = nodeGroup.innerNodes[i];
      context = process(context, innerNode, depth+1);
    }
  }
  for(let i=0; i<handlers.length; i++) {
    const {after, stackName: handlerStackName, isWithoutClosingTag} = handlers[i];
    const stackName = handlerStackName ? handlerStackName : nodeGroup.tag;
    if(after && (context.stack[stackName] || isWithoutClosingTag)) {
      const result = after(context, nodeGroup, depth);
      context = result === null ? context : result;
    }
    context.stack[stackName] = context.stack[stackName] - 1;
  }
  return context;
};

const convert = (xml) => {
  const root = parseXml(`<?xml version="1.0" encoding="UTF-8"?><root>${xml.replace(/\n/g, '')}</root>`, {noblanks: true}).root();
  const nodes = root.childNodes();
  let context = {data: [], commands: [], stack: {}};
  for(let i=0; i<nodes.length; i++) {
    const node = nodes[i];
    process(context, node, 0);
  }

  return context.commands;
};

module.exports = function(dirtyXml) {
  const cleanXml = sanitizeHtml(dirtyXml, {
    allowedTags: [ 'div', 'p', 'td', 'tr', 'br', 'b', 'fontb', 'fonta', 'opencashdrawer', 'cut', 'partialcut', 'beep',
      'rotate180', 'invert', 'u', 'ud', 'hr', 'center', 'left', 'right' ],
    allowedAttributes: {
      td: ['width', 'align', 'bold', 'style'],
      p: ['style'],
      div: ['style'],
    },
  });

  const result = convert(cleanXml);
  console.log('-----');
  console.log(JSON.stringify(result, null, 2));
  return result;
};

/*
 //before
 if(tag === 'fontb' && context.isFontA) {
 commands.push({name: 'setTypeFontB'});
 context.isFontA = false;
 } else if(tag === 'b' && !context.isBold) {
 commands.push({name: 'bold', data: true});
 context.isBold = true;
 } else if(tag === 'rotate180') {
 commands.push({name: 'upsideDown', data: true});
 } else if(tag === 'invert') {
 commands.push({name: 'invert', data: true});
 } else if(tag === 'u') {
 commands.push({name: 'underline', data: true});
 } else if(tag === 'ud') {
 commands.push({name: 'underlineThick', data: true});
 } else if(tag === 'center') {
 commands.push({name: 'alignCenter'});
 context.align.push('center');
 } else if(tag === 'left') {
 commands.push({name: 'alignLeft'});
 context.align.push('left');
 } else if(tag === 'right') {
 commands.push({name: 'alignRight'});
 context.align.push('right');
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
 } else if(tag === 'hr') {
 commands.push({name: 'drawLine'});
 return;
 }
 //in
 if(tag !== 'td') {
 for(let i=0; i<innerNodes.length; i++) {
 const innerNode = innerNodes[i];
 process(innerNode, depth+1);
 }
 }
 //after
 if(tag === 'fonta' && context.isFontA) {
 commands.push({name: 'setTypeFontB'});
 context.isFontA = false;
 } else if(tag === 'fontb' && !context.isFontA) {
 commands.push({name: 'setTypeFontA'});
 context.isFontA = true;
 } else if(tag === 'b' && context.isBold) {
 commands.push({name: 'bold', data: false});
 context.isBold = false;
 } else if(tag === 'rotate180') {
 commands.push({name: 'upsideDown', data: false});
 } else if(tag === 'u') {
 commands.push({name: 'underline', data: false});
 } else if(tag === 'ud') {
 commands.push({name: 'underlineThick', data: false});
 } else if(['center', 'left', 'right'].includes(tag)) {
 context.align.pop();
 switch(context.align.unshift()) {
 case 'right': commands.push({name: 'alignRight'}); break;
 case 'center': commands.push({name: 'alignCenter'}); break;
 default:
 case 'left': commands.push({name: 'alignLeft'}); break;
 }
 } else if(tag === 'invert') {
 commands.push({name: 'invert', data: false});
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
 */