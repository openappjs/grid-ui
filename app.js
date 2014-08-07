var mercury = require('mercury');
var Ndarray = require('ndarray');
var Observ = require('observ');

require('./index.css');

var Grid = require('./');

var grid = Grid({
  ndarray: new Ndarray([
    "a","b","c","d","e","f","h","i","j",
  ], [3, 3]),
  Item: require('./item'),
});

mercury.app(document.body, grid.state, Grid.render);
