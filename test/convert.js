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
      {name: 'println', data: 'hello worldit ismeme'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('understands multiple lines', function() {
    const template = `
<div>hello world</div>
<p>it is</p>
<p>me
me</p>
`;

    const exptectedResult = [
      {name: 'println', data: 'hello world'},
      {name: 'println', data: 'it is'},
      {name: 'println', data: 'meme'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });


  it('has special treatment for simple table', function() {
    const template = `
<table>
<tr><td>One</td><td>Two</td><td>Three</td></tr>
</table>
`;

    const exptectedResult = [{name: 'tableCustom', data: [{text: 'One'}, {text: 'Two'}, {text: 'Three'}]}];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('understands blank lines', function() {
    assert(_.isEqual(convert(`<br/>`), [{name: 'newLine'}]));
    assert(_.isEqual(convert(`<br/><br>`), [{name: 'newLine'}, {name: 'newLine'}]));
    assert(_.isEqual(convert(`<p>ho-ho</p><br/><br><p>ha-ha</p>`),
      [{name: 'println', data: 'ho-ho'}, {name: 'newLine'}, {name: 'newLine'}, {name: 'println', data: 'ha-ha'}]));
  });

  it('can make words bold (simple)', function() {
    const template = `
<p>Hello <b>OOOHHHHHOOOOO</b> and I am not bold</p>
<p>Me tooo</p>
`;
    const exptectedResult = [
      {name: 'print', data: 'Hello '},
      {name: 'bold', data: true },
      {name: 'print', data: 'OOOHHHHHOOOOO'},
      {name: 'bold', data: false },
      {name: 'print', data: ' and I am not bold'},
      {name: 'println', data: 'Me tooo'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('works with nested styling', function() {
    const template = `
<p>Hello <fontb><b>OOO<fonta>HHHHH</fonta>OOOOO</b></fontb> and I am not bold</p>
<p>Me tooo</p>
`;
    const exptectedResult = [
      {name: 'print', data: 'Hello '},
      {name: 'setTypeFontB'},
      {name: 'bold', data: true },
      {name: 'print', data: 'OOO'},
      {name: 'setTypeFontA'},
      {name: 'print', data: 'HHHHH'},
      {name: 'setTypeFontB'},
      {name: 'print', data: 'OOOOO'},
      {name: 'bold', data: false },
      {name: 'setTypeFontA'},
      {name: 'print', data: ' and I am not bold'},
      {name: 'println', data: 'Me tooo'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('can make words bold (advanced)', function() {
    const template = `
<p>Hello <b>OOOHHHHHOOOOO</b> and I am not bold</p>
<p>Lets <b>da</b>ne<b>ce</b>!<b>!</b> and I am not bold</p>
<p>Me tooo</p>
`;
    const exptectedResult = [
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
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('has special treatment for table with attributes', function() {
    const template = `
    <tr>
      <td width="0.5" align="left">Left</td>
      <td width="0.25" align="center" bold="true">Center</td>
      <td width="0.25" align="right">Right</td>
    </tr>
`;

    const exptectedResult = [
      {name: 'tableCustom', data: [
        { text:"Left", align:"left", width:0.5 },
        { text:"Center", align:"center", width:0.25, bold:true },
        { text:"Right", align:"right", width:0.25 }
      ]},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('has special treatment for table cells boldness', function() {
    const template = `
    <tr>
      <td width="0.25" align="left">one</td>
      <td width="0.25" align="center"><b>two</b></td>
      <td width="0.25">three</td>
      <td width="0.25" style="font-weight: bold" align="right">FOUR</td>
    </tr>
`;

    const exptectedResult = [
      {name: 'tableCustom', data: [
        { text:"one", align:"left", width:0.25 },
        { text:"two", align:"center", width:0.25, bold:true },
        { text:"three", width:0.25 },
        { text:"FOUR", align:"right", width:0.25, bold:true }
      ]},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('has special treatment for style boldness', function() {
    const template = `
    <p style="font-weight: bold">dsdasdas</p>
    <div style="font-weight: bold" disabled>oneone</div>
`;

    const exptectedResult = [
      {name: 'bold', data: true},
      {name: 'println', data: 'dsdasdas'},
      {name: 'bold', data: false},
      {name: 'bold', data: true},
      {name: 'println', data: 'oneone'},
      {name: 'bold', data: false},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('openCashDrawer works', function() {
    assert(_.isEqual(convert('<opencashdrawer/>'), [{name: 'openCashDrawer'}]));
    assert(_.isEqual(convert('<opencashdrawer />'), [{name: 'openCashDrawer'}]));
    assert(_.isEqual(convert('<p>1</p><opencashdrawer />'), [{name: 'println', data: '1'}, {name: 'openCashDrawer'}]));
  });

  it('cut works', function() {
    assert(_.isEqual(convert('<cut/>'), [{name: 'cut'}]));
    assert(_.isEqual(convert('<cut />'), [{name: 'cut'}]));
    assert(_.isEqual(convert('<p>1</p><cut />'), [{name: 'println', data: '1'}, {name: 'cut'}]));
  });

  it('partialCut works', function() {
    assert(_.isEqual(convert('<partialcut/>'), [{name: 'partialCut'}]));
    assert(_.isEqual(convert('<partialcut />'), [{name: 'partialCut'}]));
    assert(_.isEqual(convert('<p>1</p><partialcut />'), [{name: 'println', data: '1'}, {name: 'partialCut'}]));
  });

  it('beep works', function() {
    assert(_.isEqual(convert('<beep/>'), [{name: 'beep'}]));
    assert(_.isEqual(convert('<beep />'), [{name: 'beep'}]));
    assert(_.isEqual(convert('<p>1</p><beep />'), [{name: 'println', data: '1'}, {name: 'beep'}]));
  });

  it.only('rotate180 makes upside down', function() {
    const template = `
    <rotate180>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </rotate180>
`;

    const exptectedResult = [
      {name: 'upsideDown', data: true},
      {name: 'println', data: 'dsdasdas'},
      {name: 'bold', data: true},
      {name: 'println', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'upsideDown', data: false},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  // general tags
  // code128
  // qr
  // image
  // getWidth?? testWidth - что нет переносов
  // center
  // left
  // right
  // remove mustache - outside of the convert
});