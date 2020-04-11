const fs = require('fs');
const assert = require('assert');
const _ = require('lodash');
const getImageSize = require('probe-image-size');
const convert = require('../src/convert');

describe('convertTemplateToPrinterCommands', async () => {
  it('create print line commands', async () => {
    const template = `
hello world
it is
me
me
`;

    const exptectedResult = [
      {name: 'println', data: 'hello worldit ismeme'},
    ];

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('understands multiple lines', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });


  it('has special treatment for simple table', async () => {
    const template = `
<table>
<tr><td>One</td><td>Two</td><td>Three</td></tr>
</table>
`;
    const exptectedResult = [{name: 'tableCustom', data: [{text: 'One'}, {text: 'Two'}, {text: 'Three'}]}];

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('understands blank lines', async () => {
    assert.deepStrictEqual(await convert(`<br/>`), [{name: 'newLine'}]);
    assert.deepStrictEqual(await convert(`<br/><br>`), [{name: 'newLine'}, {name: 'newLine'}]);
    assert.deepStrictEqual(await convert(`<p>ho-ho</p><br/><br><p>ha-ha</p>`),
      [{name: 'print', data: 'ho-ho'}, {name: 'newLine'}, {name: 'newLine'}, {name: 'newLine'},
        {name: 'print', data: 'ha-ha'}, {name: 'newLine'}]);
  });

  it('can make words bold (simple)', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('works with nested styling', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('can make words bold (advanced)', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('has special treatment for table with attributes', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('has special treatment for table cells boldness', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('has special treatment for style boldness', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('openCashDrawer works', async () => {
    assert.deepStrictEqual(await convert('<opencashdrawer/>'), [{name: 'openCashDrawer'}]);
    assert.deepStrictEqual(await convert('<opencashdrawer />'), [{name: 'openCashDrawer'}]);
    assert.deepStrictEqual(await convert('<p>1</p><opencashdrawer />'), [{
      name: 'print',
      data: '1'
    }, {name: 'newLine'}, {name: 'openCashDrawer'}]);
  });

  it('cut works', async () => {
    assert.deepStrictEqual(await convert('<cut/>'), [{name: 'cut'}]);
    assert.deepStrictEqual(await convert('<cut />'), [{name: 'cut'}]);
    assert.deepStrictEqual(await convert('<p>1</p><cut />'), [{name: 'print', data: '1'}, {name: 'newLine'}, {name: 'cut'}]);
    assert.deepStrictEqual(await convert('<p>1</p><cut />', 'CHARSET'), [
      {name: 'print', data: '1'}, {name: 'newLine'},
      {name: 'cut'}, { name: 'setCharacterSet', data: 'CHARSET' }]);
  });

  it('partialCut works', async () => {
    assert.deepStrictEqual(await convert('<partialcut/>'), [{name: 'partialCut'}]);
    assert.deepStrictEqual(await convert('<partialcut />'), [{name: 'partialCut'}]);
    assert.deepStrictEqual(await convert('<p>1</p><partialcut />'), [{
      name: 'print',
      data: '1'
    }, {name: 'newLine'}, {name: 'partialCut'}]);
    assert.deepStrictEqual(await convert(`
    <p>hello123</p>
    <p>and from this line</p><partialcut /><p>and from this</p>
    <p>hi?</p>
    `, 'SLOVENIA234'), [ { name: 'print', data: 'hello123' },
      { name: 'newLine' },
      { name: 'print', data: 'and from this line' },
      { name: 'newLine' },
      { name: 'partialCut' },
      { name: 'setCharacterSet', data: 'SLOVENIA234' },
      { name: 'print', data: 'and from this' },
      { name: 'newLine' },
      { name: 'print', data: 'hi?' },
      { name: 'newLine' } ]);
  });

  it('beep works', async () => {
    assert.deepStrictEqual(await convert('<beep/>'), [{name: 'beep'}]);
    assert.deepStrictEqual(await convert('<beep />'), [{name: 'beep'}]);
    assert.deepStrictEqual(await convert('<p>1</p><beep />'), [{name: 'print', data: '1'}, {name: 'newLine'}, {name: 'beep'}]);
  });

  describe('rotate180', async () => {
    it('rotate180 makes upside down', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });

    it('rotate180 makes upside down inside text', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });
  });

  describe('invert', async () => {
    it('invert tag works', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });

    it('invert tag works inside text', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });
  });

  describe('u', async () => {
    it('u tag works', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });

    it('u tag works inside text', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });
  });

  describe('ud', async () => {
      it('ud tag works', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('ud tag works inside text', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });
  });


  it('hr tag works', async () => {
    assert.deepStrictEqual(await convert('<hr/>'), [{name: 'drawLine'}]);
    assert.deepStrictEqual(await convert('<hr />'), [{name: 'drawLine'}]);
    assert.deepStrictEqual(await convert('<p>1</p><hr />'), [{name: 'print', data: '1'}, {name: 'newLine'}, {name: 'drawLine'}]);
  });

  describe('center tag', async () => {
    it('center tag works', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });

    it('center tag works inside text', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });
  });

  describe('left tag', async () => {
    it('left tag works', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });

    it('left tag works inside text', async () => {
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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });
  });

  describe('right tag', async () => {
    it('right tag works', async () => {
      const template = `
        <right>
            <p>dsdasdas</p>
            <div style="font-weight: bold" disabled>oneone</div>
        </right>`;

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

      assert.deepStrictEqual(await convert(template), exptectedResult);
    });

    it('right tag works inside text', async () => {
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
      assert.deepStrictEqual(await convert(template), exptectedResult);
    });
  });

  it('doubleheight tag', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('doublewidth tag', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('quadarea tag', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('normal tag', async () => {
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

//     const issuet = `
//     <normal>
//       <p style="font-weight: bold">1</p>
//       <div>2</div>
//     </normal>
//     <p>3</p>
// `;
//
//     console.log(await convert(issuet));
//     process.exit(-1);

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  it('normal/doubleheight/doublewidth/quadarea tags', async () => {
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

    assert.deepStrictEqual(await convert(template), exptectedResult);
  });

  describe('code128', async () => {
    it('code128 simple', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" />'), [{name: 'code128', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<code128 data="123"></code128>'), [{name: 'code128', data: '123'}]);
    });

    it('code128 attributes', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" width="SMALL" height="50" />'),
        [{name: 'code128', data: 'xxxyyy', width: 'SMALL', height: 50}]);
    });

    it('code128 width is one of: SMALL/MEDIUM/LARGE', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" width="15" />'), [{name: 'code128', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" width="XX" />'), [{name: 'code128', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" width="large" />'),
        [{name: 'code128', data: 'xxxyyy', width: 'LARGE'}]);
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" width="MediuM" />'),
        [{name: 'code128', data: 'xxxyyy', width: 'MEDIUM'}]);
    });

    it('code128 has height between 50 and 80', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" height="49" />'), [{name: 'code128', data: 'xxxyyy', height: 50}]);
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" height="62" />'), [{name: 'code128', data: 'xxxyyy', height: 62}]);
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" height="81" />'), [{name: 'code128', data: 'xxxyyy', height: 80}]);
    });

    it('code128 supports attr text-no', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" text-no />'), [{name: 'code128', data: 'xxxyyy', text: 1}]);
    });

    it('code128 supports attr text-bottom', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" text-bottom />'), [{name: 'code128', data: 'xxxyyy', text: 2}]);
    });

    it('code128 supports attr text-no-inline', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" text-no-inline />'), [{name: 'code128', data: 'xxxyyy', text: 3}]);
    });

    it('code128 supports attr text-bottom-inline', async () => {
      assert.deepStrictEqual(await convert('<code128 data="xxxyyy" text-bottom-inline />'), [{name: 'code128', data: 'xxxyyy', text: 4}]);
    });
  });

  describe('qrcode', async () => {
    it('qrcode simple', async () => {
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" />'), [{name: 'printQR', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<qrcode data="123"></qrcode>'), [{name: 'printQR', data: '123'}]);
    });

    it('qrcode attributes', async () => {
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" cellSize="3" correction="M" model="standard" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 3, correction: 'M', model: 2}]);
    });

    it('qrcode cellsize', async () => {
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" cellSize="1" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 1}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" cellSize="8" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 8}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" cellSize="5.3123" />'),
        [{name: 'printQR', data: 'xxxyyy', cellSize: 5}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" cellSize="9" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" cellSize="a" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
    });

    it('qrcode correction', async () => {
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" correction="L" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'L'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" correction="M" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'M'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" correction="Q" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'Q'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" correction="H" />'),
        [{name: 'printQR', data: 'xxxyyy', correction: 'H'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" correction="D" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" correction="A" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
    });

    it('qrcode model', async () => {
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="1" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 1}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="2" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 2}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="3" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 3}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="3.5" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 3}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="4" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="big" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 1}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="BiG" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 1}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="standard" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 2}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="micro" />'),
        [{name: 'printQR', data: 'xxxyyy', model: 3}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" model="JVHUFDSP9UIO" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
      assert.deepStrictEqual(await convert('<qrcode data="xxxyyy" />'),
        [{name: 'printQR', data: 'xxxyyy'}]);
    });
  });

  describe('image', async () => {
    it('image simple', async () => {
      const val = await convert(`<img src="file://${__dirname}/assets/yo.png" />`);
      assert.strictEqual(val[0].name, 'printImage');
      assert.strictEqual(val[0].isAwait, true);
      fs.readFile(val[0].data, function(err, data) {
        if(err || !data) {
          assert.fail();
        } else {
          assert.ok(data);
        }
      });
    });

    it('image base64', async () => {
      const val = await convert('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAZlBMVEUAAAD///+lpaWXl5cXFxfu7u6SkpL4+Pjh4eH7+/toaGgpKSnU1NSCgoKxsbE8PDxvb29TU1O5ubleXl6dnZ3ExMRKSkrR0dENDQ2pqalBQUF7e3saGhrn5+eNjY3d3d0gICA1NTVyXv3hAAAEn0lEQVR4nO3d6ZaiMBAF4LC0kUVQUKe36el+/5cce1NRlgBJpYpz798+xvoOsiQNlAr6ovMiqsssVjwTZ2UdFbnuNajuP63D1DfBMGm4Hi9Mqp3vukdlVyWjhEnku+IJidqNbUK9913sxOzb9sgW4SHzXenkZAcDod76LnNWtneb8VaYcz0zmCbO+4Wh7wItJOwTbnxXZyWbbqGUM/xQ0i7h0Xdl1nJsFy5lC34mbRMuYx/8zeZeuISj6HXCW2HuuyLryZtCLf1Ef59YN4SyL9Xas70WHnxX4ySHi1DLnU30JdNnodT54FD2Z6HvSpzlVyhxycIs0bcw8V2HwyRfwsp3GQ5TfQllLRuOy+5TuPZdhdOsT8KlXXI3E56ES5oW3icNlPZdg+NotbxpUzO5KnyX4DiFWu4FzXciVfsuwXFqVfouwXFKtcyp4SWZWt4CTTNL9yGIm7w/vxSH/G//XTJyl16e3wZuABIufPtrphMqzIqum36WIXwvxvAECiPDvU+qsByx/4kUrsb7RAnjP1OAgoTZhF+oKOFx9CFGmDAdpsgW7iYDhQiPo65iBAo/ZgBlCCceReUIW25ZXpYwmgUUIJxxGBUi7HnMZRnC/Uwge+HHXCB74bT5hCBhPRvIXXj72MfihNv5QOZCC5uQt/DZApC3sFq80AaQtXAzXL5w4fyzPXPh+5yZvQihnR8pZ+G8qb0E4azVGQlCK6d71kLDa1J92K/6wviOQ7MLGsGvPTA7Gz75rnJOTA40sp+lM9mEj76LnJNs6b9Ro4VgwUcZZfQvUeFP8bwMC2UfZ9TbsFD4AxIGq/mML1dMEkIIIftACCH/QAgh/0AIIf9AeMrKd43DeXyLurIyWEw8rDo/fonf9yK9Tr07fUy8CuMHCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIRQj/PfQGYN/8evuT1+N41Wo4s6op2Hhvufz57z6FfYEdwxByD8QQsg/EELIPxBCyD8QQsg/EELIPxBCyD8QQsg/EELIPxBCyD8QQsg/EELIPxBCyD8QQsg/EELIPxDaF8Z2hxsMtTBW1O8/pxZmqrQ5nEGohaWqbQ5nEGphragPXNTCSFG/4p1aWKjc5nAGoRbmivq5BWqhVkFqc7zhEAvTQAWhxfEMQiwMT0LijiDEwvVJGOwsDjgcWuEu+BRW9gY0CK2w+hIm9gY0CK0w+RLSzsdIhVHwLSR9WJFUGPwKKd+rTCncn4WacJJIKMz0WUjZQ4pQ+N3w9KeV3dbSoMOhE/40y/wRarLlGjJhrBvCgGwSRSb87VB/brhIdQFOJTx/z6Wl5MbGuCO+2a3w0jj6qmkmzUSRRnjVZfG6Lehx/sjDIREer0ZrND6l2IoUwkafzGZrV4J9kUDYbN5+07zW/RHVvfDmG27b8+auT/2uhXF+M9pdA2Lt+ALOsXB793aYlhbLbpt+OxVmh/vR2ppIa5fzRZfCfdvrfdrbZCfuFjbcCaOkdbSuRuBJ5WiR0ZFwV7X7uoWnrEMXVwAuhGm47h6tv5m7zouoLjObZxCbwjgr66jI+1+u9R8Qp0DSoVF68gAAAABJRU5ErkJggg==" />');
      assert.strictEqual(val[0].name, 'printImage');
      assert.strictEqual(val[0].isAwait, true);
      fs.readFile(val[0].data, function(err, data) {
        if(err || !data) {
          assert.fail();
        } else {
          assert.ok(data);
        }
      });
    });

    it('image http', async () => {
      const val = await convert('<img src="https://dummyimage.com/600x400/fff/000" />');
      assert.strictEqual(val[0].name, 'printImage');
      assert.strictEqual(val[0].isAwait, true);
      fs.readFile(val[0].data, function(err, data) {
        if(err || !data) {
          assert.fail();
        } else {
          assert.ok(data);
        }
      });
    });

    it('image width resizes image', async () => {
      const val = await convert('<img src="https://dummyimage.com/600x400/fff/000" width="200" />');
      assert.strictEqual(val[0].name, 'printImage');
      assert.strictEqual(val[0].isAwait, true);
      getImageSize(fs.createReadStream(val[0].data), (err, size) => {
        if (err !== null) {
          console.log(err);
          assert.fail();
        }

        assert.strictEqual(size.width, 200);
      });
    });

    it('image height resizes image', async () => {
      const val = await convert('<img src="https://dummyimage.com/600x400/fff/000" height="200" />');
      assert.strictEqual(val[0].name, 'printImage');
      assert.strictEqual(val[0].isAwait, true);
      getImageSize(fs.createReadStream(val[0].data), (err, size) => {
        if (err !== null) {
          assert.fail();
        }

        assert.strictEqual(size.height, 200);
      });
    });
  });

  // TODO getWidth?? testWidth - что нет переносов
  // TODO pdf417
  // TODO maxiCode
  // TODO printBarcode
  // TODO eslint
});