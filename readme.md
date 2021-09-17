# HTML2Thermal [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/knyga/html2thermal/blob/master/LICENCE) [![CircleCI](https://circleci.com/gh/knyga/html2thermal/tree/master.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/knyga/html2thermal/tree/master)

JavaScript library to translate subset of HTML into commands which would be executed on the thermal printer.

Library is based on the popular [node-thermal-printer](https://github.com/Klemen1337/node-thermal-printer) module which provides adapters for EPSON and STAR thermal printers command line printing.

## Motivation
Compare the code in HTML and direct commands for printer.

HTML:
```HTML
<center>
    <p>dsdasdas</p>
    <div style="font-weight: bold">oneone</div>
</center>
```

Direct JS commands:
```JS
printer.alignCenter()
printer.print('dsdasdas')
printer.newLine()
printer.bold(true)
printer.print('oneone')
printer.bold(true)
printer.newLine()
printer.alignLeft()
```

HTML code version:
* allows to create preview of what will be printed in the browser
* makes code more readable
* reduces integration time

## Installation
```bash
npm install html2thermal node-thermal-printer
```

### Linux specific
Linux requires build-essentials
```bash
sudo apt-get install build-essential
```

## Documentation
Library exports 2 functions:
1. `convert(xml, characterSet = 'SLOVENIA')` converts `xml` to the thermal printer commands.
   * `xml` as XML code to be converted to commands
   * `characterSet`
2. `execute(printer, xml, isCut = true)` executes the commands on the thermal printer.
   * `printer` as an instance of the printer from the [node-thermal-printer](https://github.com/Klemen1337/node-thermal-printer)
   * `xml` as XML code to be executed on the thermal printer
   * `isCut` defines if cut operation should be executed at the end of the printing process

### Supported tags
* `<beep/>` perform sound of an internal beeper if present
* `<br/>` breaks the line (new line)
* `<b>...</b>` sets text bold
* `<center>...</center>` aligns text to center
* `<left>...</left>` aligns text to left
* `<right>...</right>` aligns text to right
* `<cut />` cuts the paper if printer supports it
* `<partialcut />` cuts the paper and leaves the bridge in the middle if printer supports it
* `<div>...</div>` isolates content on the separate line
* `<p>...</p>` isolates content on the separate line
* `<doubleheight>...</doubleheight>` sets text to double height
* `<u>...</u>` sets underline to the text
* `<ud>...</ud>` sets double underline or thick to the text
* `<doublewidth>...</doublewidth>` sets text to double width
* `<fonta>...</fonta>` changes text font to the first supported (A or default)
* `<fontb>...</fontb>` changes text font to the second supported (B)
* `<hr />` draws the line-separator
* `<img src="..." height="..." width="..." />` prints the image from src (`file:`, `http:`, `https:`, `data:`, ...), width and height in pixels are optional
* `<invert>...</invert>` inverts background and foreground colors
* `<normal>...</normal>` resets all text settings to normal, redundant operation
* `<opencashdrawer />` opens cash drawer if present
* `<code128 data="..." />` prints code128 bar code with data provided in the data property
* `<qrcode data="..." />` prints QR code with data provided in the data property
* `<quadarea>...</quadarea>` sets text to quad area
* `<rotate180>...</rotate180>` prints content upside down
* `<table>...</table>` table
* `<tr>...</tr>` table row
* `<td width="..." align="..." bold="..." style="...">...<td>` cell of the table row, `width` property is optional and in factor (`0.5`, `0.25`, ...), `align` property is optional (`left`, `right`, `center`), `bold` property is optional (`true`), `style` property is optional


### Supported style properties
* `font-style: bold` sets text bold (NOTE: no support for number value yet)


If no tag provided, then `print` operation will be executed.

### Character sets
* `PC437_USA`
* `PC850_MULTILINGUAL`
* `PC860_PORTUGUESEƒ`
* `PC863_CANADIAN_FRENCH`
* `PC865_NORDIC`
* `PC851_GREEK`
* `PC857_TURKISH`
* `PC737_GREEK`
* `ISO8859_7_GREEK`
* `WPC1252`
* `PC866_CYRILLIC2`
* `PC852_LATIN2`
* `SLOVENIA`
* `PC858_EURO`
* `WPC775_BALTIC_RIM`
* `PC855_CYRILLIC`
* `PC861_ICELANDIC`
* `PC862_HEBREW`
* `PC864_ARABIC`
* `PC869_GREEK`
* `ISO8859_2_LATIN2`
* `ISO8859_15_LATIN9`
* `PC1125_UKRANIAN`
* `WPC1250_LATIN2`
* `WPC1251_CYRILLIC`
* `WPC1253_GREEK`
* `WPC1254_TURKISH`
* `WPC1255_HEBREW`
* `WPC1256_ARABIC`
* `WPC1257_BALTIC_RIM`
* `WPC1258_VIETNAMESE`
* `KZ1048_KAZAKHSTAN`

## Example

```JS
const printer = require('node-thermal-printer')
const {execute} = require('html2thermal')
printer.init({
  type: 'epson',
  // If you connect over TCP
  interface: 'tcp://192.168.192.168',
})

const template = `
<div>hello world</div>
<p>it is</p>
<p>me
me</p>
`

execute(printer, template);
```

## Licence
HTML2Thermal is [MIT licenсed](https://github.com/knyga/html2thermal/blob/master/LICENCE).