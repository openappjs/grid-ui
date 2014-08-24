var mercury = require('mercury');
var Ndarray = require('ndarray');

var Grid = require('../');

// include app styling
require('./app.css');

// include grid-ui styling
require('../index.css');

// include item component and styling
var Item = require('./item');
require('./item.css');

var shape = [4, 4];
var numItems = shape[0] * shape[1];

// setup colors
var colors = [];
for (var i = 0; i < numItems; i++) {
  var chan = (i / numItems) * 256;
  var chanHex = parseInt(chan, 10).toString(16);
  if (chanHex.length === 1) chanHex = '0' + chanHex;
  colors.push(chanHex + chanHex + chanHex);
}

// use colors to create list of item states
var items = [];
colors.forEach(function (color) {
  items.push(Item(color).state);
});

// create grid-ui component
var grid = Grid({
  model: new Ndarray(items, shape),
  style: {
    grid: {
      backgroundColor: 'green',
    },
  },
  config: {
    debug: true,
    debugToggle: true,
    edgeSize: 40,
    cellSize: {
      x: 80,
      y: 80,
    },
  },
});

// start app
mercury.app(document.body, grid.state, Grid.render);
