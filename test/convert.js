const assert = require('assert');
const _ = require('lodash');
const convert = require('../src/convert');

describe('convertTemplateToPrinterCommands', function () {
  it('create print line commands', function () {
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

  it('understands multiple lines', function () {
    const template = `
<div>hello world</div>
<p>it is</p>
<p>me
me</p>
`;

    const exptectedResult = [
      {name: 'print', data: 'hello world'},
      {name: 'newLine'},
      {name: 'print', data: 'it is'},
      {name: 'newLine'},
      {name: 'print', data: 'meme'},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });


  it('has special treatment for simple table', function () {
    const template = `
<table>
<tr><td>One</td><td>Two</td><td>Three</td></tr>
</table>
`;

    const exptectedResult = [{name: 'tableCustom', data: [{text: 'One'}, {text: 'Two'}, {text: 'Three'}]}];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('understands blank lines', function () {
    assert(_.isEqual(convert(`<br/>`), [{name: 'newLine'}]));
    assert(_.isEqual(convert(`<br/><br>`), [{name: 'newLine'}, {name: 'newLine'}]));
    assert(_.isEqual(convert(`<p>ho-ho</p><br/><br><p>ha-ha</p>`),
      [{name: 'print', data: 'ho-ho'}, {name: 'newLine'}, {name: 'newLine'}, {name: 'newLine'},
        {name: 'print', data: 'ha-ha'}, {name: 'newLine'}]));
  });

  it('can make words bold (simple)', function () {
    const template = `
<p>Hello <b>OOOHHHHHOOOOO</b> and I am not bold</p>
<p>Me tooo</p>
`;
    const exptectedResult = [
      {name: 'print', data: 'Hello '},
      {name: 'bold', data: true},
      {name: 'print', data: 'OOOHHHHHOOOOO'},
      {name: 'bold', data: false},
      {name: 'print', data: ' and I am not bold'},
      {name: 'newLine'},
      {name: 'print', data: 'Me tooo'},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('works with nested styling', function () {
    const template = `
<p>Hello <fontb><b>OOO<fonta>HHHHH</fonta>OOOOO</b></fontb> and I am not bold</p>
<p>Me tooo</p>
`;
    const exptectedResult = [
      {name: 'print', data: 'Hello '},
      {name: 'setTypeFontB'},
      {name: 'bold', data: true},
      {name: 'print', data: 'OOO'},
      {name: 'setTypeFontA'},
      {name: 'print', data: 'HHHHH'},
      {name: 'setTypeFontB'},
      {name: 'print', data: 'OOOOO'},
      {name: 'bold', data: false},
      {name: 'setTypeFontA'},
      {name: 'print', data: ' and I am not bold'},
      {name: 'newLine'},
      {name: 'print', data: 'Me tooo'},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('can make words bold (advanced)', function () {
    const template = `
<p>Hello <b>OOOHHHHHOOOOO</b> and I am not bold</p>
<p>Lets <b>da</b>ne<b>ce</b>!<b>!</b> and I am not bold</p>
<p>Me tooo</p>
`;
    const exptectedResult = [
      {name: 'print', data: 'Hello '},
      {name: 'bold', data: true},
      {name: 'print', data: 'OOOHHHHHOOOOO'},
      {name: 'bold', data: false},
      {name: 'print', data: ' and I am not bold'},
      {name: 'newLine'},
      {name: 'print', data: 'Lets '},
      {name: 'bold', data: true},
      {name: 'print', data: 'da'},
      {name: 'bold', data: false},
      {name: 'print', data: 'ne'},
      {name: 'bold', data: true},
      {name: 'print', data: 'ce'},
      {name: 'bold', data: false},
      {name: 'print', data: '!'},
      {name: 'bold', data: true},
      {name: 'print', data: '!'},
      {name: 'bold', data: false},
      {name: 'print', data: ' and I am not bold'},
      {name: 'newLine'},
      {name: 'print', data: 'Me tooo'},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('has special treatment for table with attributes', function () {
    const template = `
    <table>
        <tr>
            <td width="0.5" align="left">Left</td>
            <td width="0.25" align="center" bold="true">Center</td>
            <td width="0.25" align="right">Right</td>
        </tr>
    </table>
`;

    const exptectedResult = [
      {
        name: 'tableCustom', data: [
        {text: "Left", align: "left", width: 0.5},
        {text: "Center", align: "center", width: 0.25, bold: true},
        {text: "Right", align: "right", width: 0.25}
      ]
      },
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('has special treatment for table cells boldness', function () {
    const template = `
    <table>
        <tr>
          <td width="0.25" align="left">one</td>
          <td width="0.25" align="center"><b>two</b></td>
          <td width="0.25">three</td>
          <td width="0.25" style="font-weight: bold" align="right">FOUR</td>
        </tr>
    </table>
`;

    const exptectedResult = [
      {
        name: 'tableCustom', data: [
        {text: "one", align: "left", width: 0.25},
        {text: "two", align: "center", width: 0.25, bold: true},
        {text: "three", width: 0.25},
        {text: "FOUR", align: "right", width: 0.25, bold: true}
      ]
      },
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('has special treatment for style boldness', function () {
    const template = `
    <p style="font-weight: bold">dsdasdas</p>
    <div style="font-weight: bold" disabled>oneone</div>
`;

    const exptectedResult = [
      {name: 'bold', data: true},
      {name: 'print', data: 'dsdasdas'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'bold', data: true},
      {name: 'print', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'newLine'},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('openCashDrawer works', function () {
    assert(_.isEqual(convert('<opencashdrawer/>'), [{name: 'openCashDrawer'}]));
    assert(_.isEqual(convert('<opencashdrawer />'), [{name: 'openCashDrawer'}]));
    assert(_.isEqual(convert('<p>1</p><opencashdrawer />'), [{
      name: 'print',
      data: '1'
    }, {name: 'newLine'}, {name: 'openCashDrawer'}]));
  });

  it('cut works', function () {
    assert(_.isEqual(convert('<cut/>'), [{name: 'cut'}]));
    assert(_.isEqual(convert('<cut />'), [{name: 'cut'}]));
    assert(_.isEqual(convert('<p>1</p><cut />'), [{name: 'print', data: '1'}, {name: 'newLine'}, {name: 'cut'}]));
  });

  it('partialCut works', function () {
    assert(_.isEqual(convert('<partialcut/>'), [{name: 'partialCut'}]));
    assert(_.isEqual(convert('<partialcut />'), [{name: 'partialCut'}]));
    assert(_.isEqual(convert('<p>1</p><partialcut />'), [{
      name: 'print',
      data: '1'
    }, {name: 'newLine'}, {name: 'partialCut'}]));
  });

  it('beep works', function () {
    assert(_.isEqual(convert('<beep/>'), [{name: 'beep'}]));
    assert(_.isEqual(convert('<beep />'), [{name: 'beep'}]));
    assert(_.isEqual(convert('<p>1</p><beep />'), [{name: 'print', data: '1'}, {name: 'newLine'}, {name: 'beep'}]));
  });

  describe('rotate180', function () {
    it('rotate180 makes upside down', function () {
      const template = `
    <rotate180>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </rotate180>
`;

      const exptectedResult = [
        {name: 'upsideDown', data: true},
        {name: 'print', data: 'dsdasdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
        {name: 'upsideDown', data: false},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });

    it('rotate180 makes upside down inside text', function () {
      const template = `
      <p>dsd <rotate180><b>RRR</b></rotate180> asdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
`;

      const exptectedResult = [
        {name: 'print', data: 'dsd '},
        {name: 'upsideDown', data: true},
        {name: 'bold', data: true},
        {name: 'print', data: 'RRR'},
        {name: 'bold', data: false},
        {name: 'upsideDown', data: false},
        {name: 'print', data: ' asdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });
  });

  describe('invert', function () {
    it('invert tag works', function () {
      const template = `
    <invert>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </invert>
`;

      const exptectedResult = [
        {name: 'invert', data: true},
        {name: 'print', data: 'dsdasdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
        {name: 'invert', data: false},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });

    it('invert tag works inside text', function () {
      const template = `
      <p>dsd <invert><b>RRR</b></invert> asdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
`;

      const exptectedResult = [
        {name: 'print', data: 'dsd '},
        {name: 'invert', data: true},
        {name: 'bold', data: true},
        {name: 'print', data: 'RRR'},
        {name: 'bold', data: false},
        {name: 'invert', data: false},
        {name: 'print', data: ' asdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });
  });

  describe('u', function() {
    it('u tag works', function() {
      const template = `
    <u>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </u>
`;

      const exptectedResult = [
        {name: 'underline', data: true},
        {name: 'print', data: 'dsdasdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
        {name: 'underline', data: false},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });

    it('u tag works inside text', function() {
      const template = `
      <p>dsd <u><b>RRR</b></u> asdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
`;

      const exptectedResult = [
        {name: 'print', data: 'dsd '},
        {name: 'underline', data: true},
        {name: 'bold', data: true},
        {name: 'print', data: 'RRR'},
        {name: 'bold', data: false},
        {name: 'underline', data: false},
        {name: 'print', data: ' asdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'}
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });
  });

  describe('ud', function() {
      it('ud tag works', function() {
    const template = `
    <ud>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </ud>
`;

    const exptectedResult = [
      {name: 'underlineThick', data: true},
      {name: 'print', data: 'dsdasdas'},
      {name: 'newLine'},
      {name: 'bold', data: true},
      {name: 'print', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'underlineThick', data: false},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('ud tag works inside text', function() {
    const template = `
      <p>dsd <ud><b>RRR</b></ud> asdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
`;

    const exptectedResult = [
      {name: 'print', data: 'dsd '},
      {name: 'underlineThick', data: true},
      {name: 'bold', data: true},
      {name: 'print', data: 'RRR'},
      {name: 'bold', data: false},
      {name: 'underlineThick', data: false},
      {name: 'print', data: ' asdas'},
      {name: 'newLine'},
      {name: 'bold', data: true},
      {name: 'print', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'newLine'}
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });
  });


  it('hr tag works', function() {
    assert(_.isEqual(convert('<hr/>'), [{name: 'drawLine'}]));
    assert(_.isEqual(convert('<hr />'), [{name: 'drawLine'}]));
    assert(_.isEqual(convert('<p>1</p><hr />'), [{name: 'print', data: '1'}, {name: 'newLine'}, {name: 'drawLine'}]));
  });

  describe('center tag', function() {
    it('center tag works', function() {
      const template = `
    <center>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </center>
`;

      const exptectedResult = [
        {name: 'alignCenter'},
        {name: 'print', data: 'dsdasdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
        {name: 'alignLeft'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });

    it('center tag works inside text', function() {
      const template = `
      <p>dsd <center><b>RRR</b></center> asdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
`;

      const exptectedResult = [
        {name: 'print', data: 'dsd '},
        {name: 'alignCenter'},
        {name: 'bold', data: true},
        {name: 'print', data: 'RRR'},
        {name: 'bold', data: false},
        {name: 'alignLeft'},
        {name: 'print', data: ' asdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });
  });

  describe('left tag', function() {
    it('left tag works', function() {
      const template = `
    <left>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </left>
`;

      const exptectedResult = [
        {name: 'alignLeft'},
        {name: 'print', data: 'dsdasdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
        {name: 'alignLeft'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });

    it('left tag works inside text', function() {
      const template = `
      <p>dsd <left><b>RRR</b></left> asdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
`;

      const exptectedResult = [
        {name: 'print', data: 'dsd '},
        {name: 'alignLeft'},
        {name: 'bold', data: true},
        {name: 'print', data: 'RRR'},
        {name: 'bold', data: false},
        {name: 'alignLeft'},
        {name: 'print', data: ' asdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });
  });

  describe('right tag', function() {
    it('right tag works', function() {
      const template = `
    <right>
      <p>dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </right>
`;

      const exptectedResult = [
        {name: 'alignRight'},
        {name: 'print', data: 'dsdasdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
        {name: 'alignLeft'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });

    it('right tag works inside text', function() {
      const template = `
      <p>dsd <right><b>RRR</b></right> asdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
`;

      const exptectedResult = [
        {name: 'print', data: 'dsd '},
        {name: 'alignRight'},
        {name: 'bold', data: true},
        {name: 'print', data: 'RRR'},
        {name: 'bold', data: false},
        {name: 'alignLeft'},
        {name: 'print', data: ' asdas'},
        {name: 'newLine'},
        {name: 'bold', data: true},
        {name: 'print', data: 'oneone'},
        {name: 'bold', data: false},
        {name: 'newLine'},
      ];

      assert(_.isEqual(convert(template), exptectedResult));
    });
  });

  it('doubleheight tag', function () {
    const template = `
    <doubleheight>
      <p style="font-weight: bold">dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </doubleheight>
    <p>123</p>
    <p>456</p>
`;

    const exptectedResult = [
      {name: 'setTextDoubleHeight'},
      {name: 'bold', data: true},
      {name: 'print', data: 'dsdasdas'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'bold', data: true},
      {name: 'print', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'setTextNormal'},
      {name: "print", data: "123"},
      {name: "newLine"},
      {name: "print", data: "456"},
      {name: "newLine"},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('doublewidth tag', function () {
    const template = `
    <doublewidth>
      <p style="font-weight: bold">dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </doublewidth>
    <p>123</p>
    <p>456</p>
`;

    const exptectedResult = [
      {name: 'setTextDoubleWidth'},
      {name: 'bold', data: true},
      {name: 'print', data: 'dsdasdas'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'bold', data: true},
      {name: 'print', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'setTextNormal'},
      {name: "print", data: "123"},
      {name: "newLine"},
      {name: "print", data: "456"},
      {name: "newLine"},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('quadarea tag', function () {
    const template = `
    <quadarea>
      <p style="font-weight: bold">dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </quadarea>
    <p>123</p>
    <p>456</p>
`;

    const exptectedResult = [
      {name: 'setTextQuadArea'},
      {name: 'bold', data: true},
      {name: 'print', data: 'dsdasdas'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'bold', data: true},
      {name: 'print', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'setTextNormal'},
      {name: "print", data: "123"},
      {name: "newLine"},
      {name: "print", data: "456"},
      {name: "newLine"},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('normal tag', function () {
    const template = `
    <normal>
      <p style="font-weight: bold">dsdasdas</p>
      <div style="font-weight: bold" disabled>oneone</div>
    </normal>
    <p>123</p>
    <p>456</p>
`;

    const exptectedResult = [
      {name: 'setTextNormal'},
      {name: 'bold', data: true},
      {name: 'print', data: 'dsdasdas'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'bold', data: true},
      {name: 'print', data: 'oneone'},
      {name: 'bold', data: false},
      {name: 'newLine'},
      {name: 'setTextNormal'},
      {name: "print", data: "123"},
      {name: "newLine"},
      {name: "print", data: "456"},
      {name: "newLine"},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  it('normal/doubleheight/doublewidth/quadarea tags', function () {
    const template = `
    <p><doubleheight>12<doublewidth>34<normal>7</normal>8</doublewidth>9</doubleheight>0</p>
    <quadarea>777</quadarea>
`;

    const exptectedResult = [
      {name: "setTextDoubleHeight"},
      {name: "print", data: "12"},
      {name: "setTextDoubleWidth"},
      {name: "print", data: "34"},
      {name: "setTextNormal"},
      {name: "print", data: "7"},
      {name: "setTextDoubleWidth"},
      {name: "print", data: "8"},
      {name: "setTextDoubleHeight"},
      {name: "print", data: "9"},
      {name: "setTextNormal"},
      {name: "print", data: "0"},
      {name: "newLine"},
      {name: "setTextQuadArea"},
      {name: "print", data: "777"},
      {name: "setTextNormal"},
    ];

    assert(_.isEqual(convert(template), exptectedResult));
  });

  describe('code128', function() {
    it('code128 simple', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" />'), [{name: 'code128', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<code128 data="123"></code128>'), [{name: 'code128', data: '123'}]));
    });

    it('code128 attributes', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" width="SMALL" height="50" />'),
        [{name: 'code128', data: 'xxxyyy', width: 'SMALL', height: 50}]));
    });

    it('code128 width is one of: SMALL/MEDIUM/LARGE', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" width="15" />'), [{name: 'code128', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<code128 data="xxxyyy" width="XX" />'), [{name: 'code128', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<code128 data="xxxyyy" width="large" />'),
        [{name: 'code128', data: 'xxxyyy', width: 'LARGE'}]));
      assert(_.isEqual(convert('<code128 data="xxxyyy" width="MediuM" />'),
        [{name: 'code128', data: 'xxxyyy', width: 'MEDIUM'}]));
    });

    it('code128 has height between 50 and 80', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" height="49" />'), [{name: 'code128', data: 'xxxyyy', height: 50}]));
      assert(_.isEqual(convert('<code128 data="xxxyyy" height="62" />'), [{name: 'code128', data: 'xxxyyy', height: 62}]));
      assert(_.isEqual(convert('<code128 data="xxxyyy" height="81" />'), [{name: 'code128', data: 'xxxyyy', height: 80}]));
    });

    it('code128 supports attr text-no', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" text-no />'), [{name: 'code128', data: 'xxxyyy', text: 1}]));
    });

    it('code128 supports attr text-bottom', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" text-bottom />'), [{name: 'code128', data: 'xxxyyy', text: 2}]));
    });

    it('code128 supports attr text-no-inline', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" text-no-inline />'), [{name: 'code128', data: 'xxxyyy', text: 3}]));
    });

    it('code128 supports attr text-bottom-inline', function() {
      assert(_.isEqual(convert('<code128 data="xxxyyy" text-bottom-inline />'), [{name: 'code128', data: 'xxxyyy', text: 4}]));
    });
  });

  describe('qrcode', function() {
    it('qrcode simple', function() {
      assert(_.isEqual(convert('<qrcode data="xxxyyy" />'), [{name: 'printQR', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<qrcode data="123"></qrcode>'), [{name: 'printQR', data: '123'}]));
    });

    it('qrcode attributes', function() {
      assert(_.isEqual(convert('<qrcode data="xxxyyy" cellSize="3" correction="M" model="standard" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 3, correction: 'M', model: 2}]));
    });

    it('qrcode cellsize', function() {
      assert(_.isEqual(convert('<qrcode data="xxxyyy" cellSize="1" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 1}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" cellSize="8" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 8}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" cellSize="5.3123" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 5}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" cellSize="9" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" cellSize="a" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
    });

    it('qrcode correction', function() {
      assert(_.isEqual(convert('<qrcode data="xxxyyy" correction="L" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'L'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" correction="M" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'M'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" correction="Q" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'Q'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" correction="H" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'H'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" correction="D" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" correction="A" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
    });

    it('qrcode model', function() {
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="1" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 1}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="2" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 2}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="3" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 3}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="3.5" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 3}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="4" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="big" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 1}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="BiG" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 1}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="standard" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 2}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="micro" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 3}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" model="JVHUFDSP9UIO" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
      assert(_.isEqual(convert('<qrcode data="xxxyyy" />'),
        [{name: 'printQR', data: 'xxxyyy'}]));
    });
  });

  describe('image', function() {
    it('image simple', function() {
      assert(_.isEqual(convert('<img src="./assets/olaii-logo-black.png" />'),
        [{name: 'printImage', data: './assets/olaii-logo-black.png', isAwait: true}]));
      assert(_.isEqual(convert('<img src="./assets/olaii-logo-black.png"></img>'),
        [{name: 'printImage', data: './assets/olaii-logo-black.png', isAwait: true}]));
    });
  });

  // TODO getWidth?? testWidth - что нет переносов
  // TODO pdf417
  // TODO maxiCode
  // TODO printBarcode
  // TODO eslint
});