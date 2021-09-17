const printer = require('node-thermal-printer');
const execute = require('../src/execute');
printer.init({
  type: 'epson',
  interface: 'tcp://192.168.192.168',
});

const template = `
<div>hello world</div>
<p>it is</p>
<p>me
me</p>
`;

execute(printer, template);