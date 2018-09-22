const _ = require('lodash');
const sanitizeHtml = require('sanitize-html');
const {parseXml} = require('libxmljs');
const getTag = require('./getTag');
const checkIsNestedTagsPresent = require('./checkIsNestedTagsPresent');
const checkIsStyleBold = require('./checkIsStyleBold');
const getAttrs = require('./getAttrs');

const fontaTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'fonta',
  before: (context) => {
    context.commands.push({name: 'setTypeFontA'});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'setTypeFontB'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'fonta' ],
  },
};
const fontbTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'fontb',
  before: (context) => {
    context.commands.push({name: 'setTypeFontB'});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'setTypeFontA'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'fontb' ],
  },
};
const trTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'tr',
  before: (context) => {
    context.isTable = true;
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'tableCustom', data: context.data});
    context.data = [];
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'tr' ],
  },
};
const tdTagHandler = {
  isIgnoreOtherHandlers: true,
  checkIsAllowed: (context, {tag}) => tag === 'td',
  checkIsBold: (node) => {
    if(/<b>.+<\/b>/.test(node.toString()) || checkIsStyleBold(node)) {
      return true;
    }
    return false;
  },
  during: (context) => context,
  after: (context, {node, attrs}) => {
    if(tdTagHandler.checkIsBold(node)) {
      attrs.bold = true;
      delete attrs.style;
    }
    context.data.push({...attrs, text: node.text()});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'td' ],
    allowedAttributes: {
      td: ['width', 'align', 'bold', 'style'],
    },
  }
};
const divOrPTagsHandler = {
  checkIsAllowed: (context, {tag}) => ['div', 'p'].includes(tag),
  after: (context) => {
    context.commands.push({name: 'newLine'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'div', 'p' ],
    allowedAttributes: {
      p: [ 'style' ],
      div: [ 'style' ],
    },
  },
};
const notagHandler = {
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
  },
};
const bTagHandler = {
  stackName: 'bold',
  checkIsAllowed: (context, {tag}) => tag === 'b',
  before: (context) => {
    context.commands.push({name: 'bold', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'bold', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'b' ],
  },
};
const boldFontStyleHandler = {
  ...bTagHandler,
  checkIsAllowed: (context, {node}) => checkIsStyleBold(node),
  sanitizeHtml: {
    allowedAttributes: {
      '*': [ 'style' ],
    },
  }
};
const brTagHandler = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'br',
  after: (context) => {
    context.commands.push({name: 'newLine'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'br' ],
  },
};
const openCashDrawerTagHandler = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'opencashdrawer',
  after: (context) => {
    context.commands.push({name: 'openCashDrawer'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'opencashdrawer' ],
  },
};
const cutTagHandler = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'cut',
  after: (context) => {
    context.commands.push({name: 'cut'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'cut' ],
  },
};
const beepTagHandler = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'beep',
  after: (context) => {
    context.commands.push({name: 'beep'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'beep' ],
  },
};
const partialCutTagHandler = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'partialcut',
  after: (context) => {
    context.commands.push({name: 'partialCut'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'partialcut' ],
  },
};
const hrTagHandler = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'hr',
  after: (context) => {
    context.commands.push({name: 'drawLine'});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'hr' ],
  },
};
const rotate180TagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'rotate180',
  before: (context) => {
    context.commands.push({name: 'upsideDown', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'upsideDown', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'rotate180' ],
  },
};
const invertTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'invert',
  before: (context) => {
    context.commands.push({name: 'invert', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'invert', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'invert' ],
  },
};
const underlineTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'u',
  before: (context) => {
    context.commands.push({name: 'underline', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'underline', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'u' ],
  },
};
const doubleUnderlineTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'ud',
  before: (context) => {
    context.commands.push({name: 'underlineThick', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'underlineThick', data: false});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'ud' ],
  },
};
const centerTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'center',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Center'] : ['Center'];
    context.commands.push({name: 'alignCenter'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.slice(-1).pop() : 'Left'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'center' ],
  },
};
const leftTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'left',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Left'] : ['Left'];
    context.commands.push({name: 'alignLeft'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.slice(-1).pop() : 'Left'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'left' ],
  },
};
const rightTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'right',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Right'] : ['Right'];
    context.commands.push({name: 'alignRight'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.slice(-1).pop() : 'Left'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'right' ],
  },
};
const doubleHeightTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'doubleheight',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'DoubleHeight'] : ['DoubleHeight'];
    context.commands.push({name: 'setTextDoubleHeight'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'doubleheight' ],
  },
};
const doubleWidthTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'doublewidth',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'DoubleWidth'] : ['DoubleWidth'];
    context.commands.push({name: 'setTextDoubleWidth'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'doublewidth' ],
  },
};
const quadAreaTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'quadarea',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'QuadArea'] : ['QuadArea'];
    context.commands.push({name: 'setTextQuadArea'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'quadarea' ],
  },
};
const code128TagHandler = {
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'code128',
  after: (context, {node, attrs}) => {
    const formattedAttrs = Object.keys(attrs).reduce((acc, name) => {
      const value = attrs[name];
      switch(name) {
        case 'width':
          const width = _.isString(value) ? value.toUpperCase() : '';
          if(['SMALL', 'MEDIUM', 'LARGE'].includes(width)) {
            acc.width = value.toUpperCase();
          }
          break;
        case 'height':
          if(value < 50) {
            acc.height = 50;
          } else if(value > 80) {
            acc.height = 80;
          } else {
            acc.height = value;
          }
          break;
        case 'text-no':
          acc.text = 1;
          break;
        case 'text-bottom':
          acc.text = 2;
          break;
        case 'text-no-inline':
          acc.text = 3;
          break;
        case 'text-bottom-inline':
          acc.text = 4;
          break;
      }
      return acc;
    }, {});
    context.commands.push({...formattedAttrs, name: 'code128', data: attrs.data.toString() });
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'code128' ],
    transformTags: {
      code128: function(tagName, attribs) {
        const extendAttrs = ['text-no', 'text-bottom', 'text-no-inline', 'text-bottom-inline'];
        for(let i=0; i<extendAttrs.length; i++) {
          const attr = extendAttrs[i];
          if(attribs.hasOwnProperty(attr)) {
            attribs[attr] = attr;
          }
        }

        return {tagName, attribs};
      },
    },
    allowedAttributes: {
      code128: ['data', 'width', 'height', 'text-no', 'text-bottom', 'text-no-inline', 'text-bottom-inline'],
    },
  },
};
const normalTagHandler = {
  checkIsAllowed: (context, {tag}) => tag === 'normal',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'Normal'] : ['Normal'];
    context.commands.push({name: 'setTextNormal'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.slice(-1).pop() : 'Normal'}`});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'normal' ],
  },
};

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
  hrTagHandler,
  code128TagHandler,

  fontaTagHandler,
  fontbTagHandler,
  bTagHandler,
  rotate180TagHandler,
  invertTagHandler,
  underlineTagHandler,
  doubleUnderlineTagHandler,
  centerTagHandler,
  leftTagHandler,
  rightTagHandler,
  doubleHeightTagHandler,
  doubleWidthTagHandler,
  quadAreaTagHandler,
  normalTagHandler,

  divOrPTagsHandler,

  notagHandler,
];

const process = (context, node, depth) => {
  const nodeGroup = {
    node,
    tag: getTag(node),
    innerNodes: node.childNodes(),
    isHasNestedTagsPresent: checkIsNestedTagsPresent(node),
    attrs: getAttrs(node),
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
    const stackName = [null, undefined].includes(handlerStackName) ? nodeGroup.tag : handlerStackName;
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
    const stackName = [null, undefined].includes(handlerStackName) ? nodeGroup.tag : handlerStackName;
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

const reduceSanitizeHtml = (sanitizers) => sanitizers.reduce((acc, val) => {
  if(!val) {
    return acc;
  }

  const allowedAttributes = Object.keys(val.allowedAttributes || {}).reduce((tags, tag) => ({
    ...tags,
    [tag]: tags.hasOwnProperty(tag) ? [...tags[tag], ...val.allowedAttributes[tag]] : val.allowedAttributes[tag],
  }), acc.allowedAttributes || {});

  return {
    ...acc,
    ...val,
    allowedTags: [
      ...(acc.allowedTags || []),
      ...(val.allowedTags || [])
    ],
    allowedAttributes,
  };
}, {});

module.exports = function(dirtyXml) {
  const sanitizerObject = reduceSanitizeHtml(handlersCollection.map(handler => handler.sanitizeHtml));
  const cleanXml = sanitizeHtml(dirtyXml, sanitizerObject);
  const result = convert(cleanXml);
  console.log('-----');
  console.log(JSON.stringify(result, null, 2));
  return result;
};

// change structure src, multiple files