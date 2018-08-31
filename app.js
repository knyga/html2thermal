const printer = require('node-thermal-printer');
const convert = require('./utils/convert');
printer.init({
  type: 'epson',
  interface: 'tcp://192.168.0.59',
});

const template = `
Hello <b>OOOHHHHHOOOOO</b> and I am not bold
Lets <b>da</b>ne<b>ce</b>!<b>!</b> and I am not bold
Me tooo
`;

function executePrinterCommands(commands) {
  for(let i=0;i<commands.length;i++) {
    const command = commands[i];
    printer[command.name](command.data);
  }

  printer.cut();
  printer.execute(function(err){
    if (err) {
      console.error("Print failed", err);
    } else {
      console.log("Print done");
    }
  });
}

const commands = convert(template);
executePrinterCommands(commands);

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