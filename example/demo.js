const printer = require('node-thermal-printer');
const execute = require('./src/execute');
printer.init({
  type: 'epson',
  interface: 'tcp://192.168.0.59',
});

const template = `
<div>hello world</div>
<p>it is</p>
<p>me
me</p>
`;

execute(printer, template);

// printer.alignCenter();
// printer.println("www.ollyfood.com.ua");
// printer.printQR("https://ollyfood.com.ua", {cellSize: 4});
// printer.cut();
// printer.execute(function(err){
//   if (err) {
//     console.error("Print failed", err);
//   } else {
//     console.log("Print done");
//   }
// });


// (async function() {
//   for(let i=1; i<254; i++) {
//
//   }
// })();