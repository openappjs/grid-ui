var mercury = require('mercury');
var Ndarray = require('ndarray');
var Observ = require('observ');

require('../index.css');
require('./item.css');

var Grid = require('../');

var shape = [8, 8];
var numItems = shape[0] * shape[1];

var items = [];

for (var i = 0; i < numItems; i++) {
  var chan = (i / numItems) * 256;
  var chanHex = parseInt(chan, 10).toString(16);
  if (chanHex.length === 1) chanHex = '0' + chanHex;
  items.push(chanHex + chanHex + chanHex);
}

var grid = Grid({
  ndarray: new Ndarray(items, shape),
  Item: require('./item'),
});

mercury.app(document.body, grid.state, Grid.render);
