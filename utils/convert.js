const mustache = require('mustache');
const _ = require('lodash');

const getCommandFromRaw = function(raw, prevCommand) {
  if(raw) {
    if(raw.startsWith('#!/')) {
      const command = raw.substr(3).split(' ');
      const result = {name: command[0]};
      if(command[1]) {
        switch(command[1]) {
          case 'true': result.data = true; break;
          case 'false': result.data = false; break;
          default: result.data = command[1];
        }
      }

      return result;
    }

    if(raw.includes('<|>')) {
      return {name: 'leftRight', data: raw.split('<|>')}
    }

    if(raw.includes('<||>')) {
      return {name: 'table', data: raw.split('<||>')}
    }

    if(raw.includes('<b>') && raw.includes('</b>')) {
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
    }

    return {name: 'println', data: raw};
  }

  return {name: 'newLine'};
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