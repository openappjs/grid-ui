var mercury = require('mercury');
var Ndarray = require('ndarray');
var Observ = require('observ');

require('./index.css');
require('./item.css');

var Grid = require('./');

var grid = Grid({
  ndarray: new Ndarray([
    "000","111","222","333","444","555","666","777",
    "888","999","aaa","bbb","ccc","ddd","eee","fff",
    "000","111","222","333","444","555","666","777",
    "888","999","aaa","bbb","ccc","ddd","eee","fff",
  ], [4, 4]),
  Item: require('./item'),
});

mercury.app(document.body, grid.state, Grid.render);
