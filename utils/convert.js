const mustache = require('mustache');
const _ = require('lodash');

const boldHandler = function(raw, prevCommand) {
  if(!raw.includes('<b>') || !raw.includes('</b>')) {
    return null;
  }

  const lineCommands = raw.split(/(<b>|<\/b>)/).map(item => {
    if(item === '<b>') {
      return {name: 'bold', data: true};
    }

    if(item === '</b>') {
      return {name: 'bold', data: false};
    }

    return {name: 'print', data: item};
  });
  const isNewLineNeeded = prevCommand ? !['println', 'newLine', 'table', 'leftRight'].includes(prevCommand.name) : false;

  if(isNewLineNeeded) {
    return [{name: 'newLine'}].concat(lineCommands);
  }

  return lineCommands;
};

const emptyLineHandler = function(raw) {
  if(/^\s*$/.test(raw)) {
    return [{name: 'newLine'}];
  }

  return null;
};

const printLineHandler = function(raw) {
  if(/^\s*$/.test(raw)) {
    return null;
  }

  return [{name: 'println', data: raw}];
};

const leftRightHandler = function(raw) {
  if(!raw.includes('<left>') || !raw.includes('</left>') || !raw.includes('<right>') || !raw.includes('</right>')) {
    return null;
  }

  let leftText = '';
  let rightText = '';
  const parts = raw.split(/(<left>|<\/left>|<right>|<\/right>)/);
  for(let i=1, nextType=''; i<parts.length-1; i++) {
    const item = parts[i];
    if(['</left>', '</right>'].includes(item)) {
      nextType = '';
      continue;
    }

    if(item === '<left>') {
      nextType = 'left';
      continue;
    }

    if(item === '<right>') {
      nextType = 'right';
      continue;
    }

    if(nextType === 'left') {
      leftText = item;
    }

    rightText = item;
  }

  return [{name: 'leftRight', data: [leftText, rightText]}];
};

const tableHandler = function(raw) {
  if(!raw.includes('<td>') || !raw.includes('</td>')) {
    return null;
  }

  const cells = [];
  const parts = raw.split(/(<td>|<\/td>)/);
  for(let i=1; i<parts.length-1; i++) {
    const item = parts[i];
    switch(item) {
      case '<td>': continue;
      case '</td>': i++; continue;
      default: cells.push(item);
    }
  }

  return [{name: 'table', data: cells}];
};


const getCommandFromRaw = function(raw, prevCommand) {
  const handlers = [
    boldHandler,
    leftRightHandler,
    tableHandler,
    printLineHandler,
    emptyLineHandler,
  ];

  for(let i=0; i<handlers.length; i++) {
    const result = handlers[i](raw, prevCommand);
    if(result !== null) {
      return result;
    }
  }

  return [];
};

module.exports = function convert(template, scope) {
  const raws = mustache.render(template, scope).split('\n');
  const commands = [];
  for(let i=0; i<raws.length; i++) {
    const raw = raws[i];
    commands.push(getCommandFromRaw(raw, i>0 ? raws[i-1] : undefined));
  }

  return _.flatten(commands);
};