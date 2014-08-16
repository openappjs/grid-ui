var test = require('tape');
var mercury = require('mercury');
var Ndarray = require('ndarray');
var raf = require('raf');

var Grid = require('../');

test("initialized as 4x4 grid", function (t) {
  var grid = Grid({
    model: new Ndarray([0,1,2,3,4,5], [2,3]),
    config: {
      debug: true,
      edgeSize: 40,
      itemSize: {
        x: 80,
        y: 80,
      },
    },
  });

  // start app
  mercury.app(document.body, grid.state, Grid.render);

  raf(function () {
    t.end();
  })
});
