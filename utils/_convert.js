const mustache = require('mustache');
const _ = require('lodash');
const {parseString} = require('xml2js');

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
  if(!raw.includes('<l>') || !raw.includes('</l>') || !raw.includes('<r>') || !raw.includes('</r>')) {
    return null;
  }

  let leftText = '';
  let rightText = '';
  const parts = raw.split(/(<l>|<\/l>|<r>|<\/r>)/);
  for(let i=1, nextType=''; i<parts.length-1; i++) {
    const item = parts[i];
    if(['</l>', '</r>'].includes(item)) {
      nextType = '';
      continue;
    }

    if(item === '<l>') {
      nextType = 'left';
      continue;
    }

    if(item === '<r>') {
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

const tableCustomHandler = function(raw) {
  if(!/<td [^>]+>/.test(raw)) {
    return null;
  }

  let err;
  let result;

  parseString(`<xml>${raw}</xml>`, function (errArg, resultArg) {
    err = errArg;
    result = resultArg;
  });

  if(err) {
    return null;
  }

  if(result && result.xml) {
    const data = [];
    const {td: tds} = result.xml;
    for(let i=0; i<tds.length; i++) {
      const td = tds[i];
      const formattedProperties = _.mapValues(_.keyBy(
        Object.keys(td.$).map(name => ({name, value: convertType(td.$[name])})),
      'name'), 'value');
      data.push({text: td._, ...formattedProperties});
    }

    return [{name: 'tableCustom', data}];
  }
};

const getCommandFromRaw = function(raw, prevCommand) {
  const handlers = [
    boldHandler,
    leftRightHandler,
    tableCustomHandler,
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