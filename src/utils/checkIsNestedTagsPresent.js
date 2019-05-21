module.exports = (node) => {
  if(!node.children) {
    return false;
  }

  for(let i=0; i<node.children.length; i+=1) {
    if(node.children[i].type === 'tag') {
      return true;
    }
  }

  return false;
  // const result = node.toString().match(/<[^>]+>/g);
  // return result ? result.length > 2 : false;
};