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
const hrTagHandler = ({
  isWithoutClosingTag: true,
  checkIsAllowed: (context, {tag}) => tag === 'hr',
  after: (context) => {
    context.commands.push({name: 'drawLine'});
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
const underlineTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'u',
  before: (context) => {
    context.commands.push({name: 'underline', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'underline', data: false});
    return context;
  }
});
const doubleUnderlineTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'ud',
  before: (context) => {
    context.commands.push({name: 'underlineThick', data: true});
    return context;
  },
  after: (context) => {
    context.commands.push({name: 'underlineThick', data: false});
    return context;
  }
});
const centerTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'center',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Center'] : ['Center'];
    context.commands.push({name: 'alignCenter'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.unshift() : 'Left'}`});
    return context;
  }
});
const leftTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'left',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Left'] : ['Left'];
    context.commands.push({name: 'alignLeft'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.unshift() : 'Left'}`});
    return context;
  }
});
const rightTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'right',
  before: (context) => {
    context.alignments = context.alignments ? [...context.alignments, 'Right'] : ['Right'];
    context.commands.push({name: 'alignRight'});
    return context;
  },
  after: (context) => {
    context.alignments.pop();
    context.commands.push({name: `align${context.alignments.length > 0 ? context.alignments.unshift() : 'Left'}`});
    return context;
  }
});
const doubleHeightTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'doubleheight',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'DoubleHeight'] : ['DoubleHeight'];
    context.commands.push({name: 'setTextDoubleHeight'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.unshift() : 'Normal'}`});
    return context;
  }
});
const doubleWidthTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'doublewidth',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'DoubleWidth'] : ['DoubleWidth'];
    context.commands.push({name: 'setTextDoubleWidth'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.unshift() : 'Normal'}`});
    return context;
  }
});
const quadAreaTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'quadarea',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'QuadArea'] : ['QuadArea'];
    context.commands.push({name: 'setTextQuadArea'});
    return context;
  },
  after: (context) => {
    context.textStyles.pop();
    context.commands.push({name: `setText${context.textStyles.length > 0 ? context.textStyles.unshift() : 'Normal'}`});
    return context;
  }
});
const normalTagHandler = ({
  checkIsAllowed: (context, {tag}) => tag === 'normal',
  before: (context) => {
    context.textStyles = context.textStyles ? [...context.textStyles, 'Normal'] : ['Normal'];
    context.commands.push({name: 'setTextNormal'});
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
    hrTagHandler,

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
      'rotate180', 'invert', 'u', 'ud', 'hr', 'center', 'left', 'right', 'doubleheight', 'doublewidth', 'quadarea',
      'normal'],
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
