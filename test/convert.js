const assert = require('assert');
const _ = require('lodash');
const convert = require('../utils/convert');

describe('convertTemplateToPrinterCommands', function() {
  it('create print line commands', function() {
    const template = `
hello world
it is
me
me
`;

    const exptectedResult = [
      {name: 'newLine'},
      {name: 'println', data: 'hello world'},
      {name: 'println', data: 'it is'},
      {name: 'println', data: 'me'},
      {name: 'println', data: 'me'},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

//   it('understands special commands', function() {
//     const template = `
// #!/bold true
// I am bold
// #!/bold false
// I am not
// `;
//
//     const exptectedResult = [
//       {name: 'newLine'},
//       {name: 'bold', data: true},
//       {name: 'println', data: 'I am bold'},
//       {name: 'bold', data: false},
//       {name: 'println', data: 'I am not'},
//       {name: 'newLine'},
//     ];
//
//     assert(_.isEqual(convert(template), exptectedResult));
//   });

//   it('accepts scope and works with mustache template engine', function() {
//     const template = `
// Dear {{client}},
// Order details:
// Calories: {{calories}}.
// Items:
// {{#items}}
// * {{name}}, x{{factor}}
// {{/items}}
//
// Thank you for ordering our product.
// `;
//
//     const scope = {
//       client: 'Oleksandr',
//       calories: 2000,
//       items: [
//         {name: 'Sandwich', factor: 1},
//         {name: 'Soup', factor: 1.5},
//       ]
//     };
//
//     const exptectedResult = [
//       {name: 'newLine'},
//       {name: 'println', data: 'Dear Oleksandr,'},
//       {name: 'println', data: 'Order details:'},
//       {name: 'println', data: 'Calories: 2000.'},
//       {name: 'println', data: 'Items:'},
//       {name: 'println', data: '* Sandwich, x1'},
//       {name: 'println', data: '* Soup, x1.5'},
//       {name: 'newLine'},
//       {name: 'println', data: 'Thank you for ordering our product.'},
//       {name: 'newLine'},
//     ];
//
//     assert(_.isEqual(convert(template, scope), exptectedResult));
//   });

  it('has special treatment for left/right', function() {
    const template = `<left>I am on LEFT</left><right>I am on RIGHT</right>`;

    const exptectedResult = [
      {name: 'leftRight', data: ['I am on LEFT', 'I am on RIGHT']},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('has special treatment for simple table', function() {
    const template = `<td>One</td><td>Two</td><td>Three</td>
`;

    const exptectedResult = [
      {name: 'table', data: ['One', 'Two', 'Three']},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('can make words bold (simple)', function() {
    const template = `
Hello <b>OOOHHHHHOOOOO</b> and I am not bold
Me tooo
`;
    const exptectedResult = [
      {name: 'newLine'},
      {name: 'print', data: 'Hello '},
      {name: 'bold', data: true },
      {name: 'print', data: 'OOOHHHHHOOOOO'},
      {name: 'bold', data: false },
      {name: 'print', data: ' and I am not bold'},
      {name: 'println', data: 'Me tooo'},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('can make words bold (advanced)', function() {
    const template = `
Hello <b>OOOHHHHHOOOOO</b> and I am not bold
Lets <b>da</b>ne<b>ce</b>!<b>!</b> and I am not bold
Me tooo
`;
    const exptectedResult = [
      { name: 'newLine' },
      { name: 'print', data: 'Hello ' },
      { name: 'bold', data: true },
      { name: 'print', data: 'OOOHHHHHOOOOO' },
      { name: 'bold', data: false },
      { name: 'print', data: ' and I am not bold' },
      { name: 'newLine' },
      { name: 'print', data: 'Lets ' },
      { name: 'bold', data: true },
      { name: 'print', data: 'da' },
      { name: 'bold', data: false },
      { name: 'print', data: 'ne' },
      { name: 'bold', data: true },
      { name: 'print', data: 'ce' },
      { name: 'bold', data: false },
      { name: 'print', data: '!' },
      { name: 'bold', data: true },
      { name: 'print', data: '!' },
      { name: 'bold', data: false },
      { name: 'print', data: ' and I am not bold' },
      { name: 'println', data: 'Me tooo' },
      { name: 'newLine' }
      ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  

});