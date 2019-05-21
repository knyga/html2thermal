const checkIsStyleBold = require('../utils/checkIsStyleBold');

const collectInnerTags = (node) => {
  const stack = [node];
  const tags = {};
  while(stack.length) {
    const n = stack.pop();
    if(n.type === 'tag') {
      tags[n.name] = true;
      if(n.children) {
        for(let i=0; i<n.children.length; i+=1) {
          stack.push(n.children[i]);
        }
      }
    }
  }

  return Object.keys(tags);
};

const getData = (node) => {
  const stack = [node];
  const data = [];
  while(stack.length) {
    const n = stack.pop();
    if(n.data) {
      data.push(n.data);
    }
    if(n.children) {
      for(let i=0; i<n.children.length; i+=1) {
        stack.push(n.children[i]);
      }
    }
  }

  return data.join('');
};

const tdTagHandler = {
  isIgnoreOtherHandlers: true,
  checkIsAllowed: (context, {tag}) => tag === 'td',
  checkIsBold: (node) => {
    if(collectInnerTags(node).includes('b') || checkIsStyleBold(node)) {
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
    context.data.push({...attrs, text: getData(node)});
    return context;
  },
  sanitizeHtml: {
    allowedTags: [ 'td' ],
    allowedAttributes: {
      td: ['width', 'align', 'bold', 'style'],
    },
  }
};

module.exports = tdTagHandler;