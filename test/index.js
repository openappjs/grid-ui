var test = require('tape');
var mercury = require('mercury');
var Ndarray = require('ndarray');
var raf = require('raf');
var event = require('synthetic-dom-events');
var document = require('global/document');

var Grid = require('../');

test("4x4 grid creation", function (t) {
  // setup
  var ndarray = new Ndarray([
    "0","1","2","3","4","5",
  ], [2,3]);
  var grid = Grid({
    model: ndarray,
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

  // after render
  raf(function () {
    var el = document.getElementsByClassName('grid')[0];

    t.equal(el.style.paddingBottom, "40px");
    t.equal(el.style.paddingLeft, "40px");
    t.equal(el.style.paddingRight, "40px");
    t.equal(el.style.paddingTop, "40px");

    var debugToggle = el.childNodes[0];
    t.ok(debugToggle);
    t.equal(debugToggle.className, "debug");
    var controls = el.childNodes[1];
    t.ok(controls);
    t.equal(controls.className, "controls");
    var rows = el.childNodes[2];
    t.ok(rows);
    t.equal(rows.className, "rows");

    for (var y = 0; y < rows.childNodes.length; y++) {
      var row = rows.childNodes[y];
      t.equal(row.className, "row");
      
      for (var x = 0; x < row.childNodes.length; x++) {
        var itemContainer = row.childNodes[x];
        t.equal(itemContainer.className, "item");
        t.equal(itemContainer.style.height, "80px");
        t.equal(itemContainer.style.width, "80px");
        t.equal(itemContainer.childNodes.length, 1);
        var item = itemContainer.childNodes[0];
        t.equal(item.textContent || item.data, ndarray.get(x, y).toString());
      }
    }

    // cleanup
    document.body.removeChild(el);
    t.end();
  });
});
