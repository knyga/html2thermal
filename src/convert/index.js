const sanitizeHtml = require('sanitize-html');
const cheerio = require('cheerio');
const getTag = require('../utils/getTag');
const checkIsNestedTagsPresent = require('../utils/checkIsNestedTagsPresent');
const checkIsStyleBold = require('../utils/checkIsStyleBold');
const getAttrs = require('../utils/getAttrs');
const fontaTagHandler = require('./fontaTagHandler');
const fontbTagHandler = require('./fontbTagHandler');
const trTagHandler = require('./trTagHandler');
const tdTagHandler = require('./tdTagHandler');
const divOrPTagsHandler = require('./divOrPTagsHandler');
const notagHandler = require('./notagHandler');
const bTagHandler = require('./bTagHandler');
const boldFontStyleHandler = require('./boldFontStyleHandler');
const brTagHandler = require('./brTagHandler');
const openCashDrawerTagHandler = require('./openCashDrawerTagHandler');
const cutTagHandler = require('./cutTagHandler');
const beepTagHandler = require('./beepTagHandler');
const partialCutTagHandler = require('./partialCutTagHandler');
const hrTagHandler = require('./hrTagHandler');
const rotate180TagHandler = require('./rotate180TagHandler');
const invertTagHandler = require('./invertTagHandler');
const underlineTagHandler = require('./underlineTagHandler');
const doubleUnderlineTagHandler = require('./doubleUnderlineTagHandler');
const centerTagHandler = require('./centerTagHandler');
const leftTagHandler = require('./leftTagHandler');
const rightTagHandler = require('./rightTagHandler');
const doubleHeightTagHandler = require('./doubleHeightTagHandler');
const doubleWidthTagHandler = require('./doubleWidthTagHandler');
const quadAreaTagHandler = require('./quadAreaTagHandler');
const code128TagHandler = require('./code128TagHandler');
const qrCodeTagHandler = require('./qrCodeTagHandler');
const normalTagHandler = require('./normalTagHandler');
const imgTagHandler = require('./imgTagHandler');

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
  qrCodeTagHandler,
  imgTagHandler,

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

const process = async (context, node, depth) => {
  const nodeGroup = {
    node,
    tag: getTag(node),
    innerNodes: node.children || [],
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
  // if(handlers.length > 1) {
  //   handlers.pop();
  // }

  for(let i=0; i<handlers.length; i++) {
    const {before, stackName: handlerStackName, isWithoutClosingTag} = handlers[i];
    const stackName = [null, undefined].includes(handlerStackName) ? nodeGroup.tag : handlerStackName;
    if(before && (!context.stack[stackName] || isWithoutClosingTag)) {
      const result = await before(context, nodeGroup, depth);
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
      context = await process(context, innerNode, depth+1);
    }
  }
  for(let i=0; i<handlers.length; i++) {
    const {after, stackName: handlerStackName, isWithoutClosingTag} = handlers[i];
    const stackName = [null, undefined].includes(handlerStackName) ? nodeGroup.tag : handlerStackName;
    if(after && (context.stack[stackName] || isWithoutClosingTag)) {
      const result = await after(context, nodeGroup, depth);
      context = result === null ? context : result;
    }
    context.stack[stackName] = context.stack[stackName] - 1;
  }
  return context;
};

const convert = async (xml, characterSet) => {
  const wrappedXml = `<root>${xml.replace(/\n/g, '').trim()}`;
  const root = cheerio.load(wrappedXml, {
    normalizeWhitespace: true,
    xmlMode: true,
  }).root()[0].children[0];

  const nodes = root.children;
  let context = {data: [], commands: [], stack: {}, characterSet};
  for(let i=0; i<nodes.length; i++) {
    const node = nodes[i];
    await process(context, node, 0);
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

const collabsSpaces = (html) => html.replace(/(<(pre|script|style|textarea|p|div|span)[^]+?<\/\2)|(^|>)\s+|\s+(?=<|$)/g, "$1$3");

module.exports = function(dirtyXml, characterSet) {
  const sanitizerObject = reduceSanitizeHtml(handlersCollection.map(handler => handler.sanitizeHtml));
  const cleanXml = collabsSpaces(sanitizeHtml(dirtyXml, sanitizerObject));
  // const cleanXml = dirtyXml;
  // const result = convert(cleanXml);
  // console.log('-----');
  // console.log(JSON.stringify(result, null, 2));
  return convert(cleanXml, characterSet);
};