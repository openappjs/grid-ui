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
    var el = document.querySelector('.grid.ui');

    t.equal(el.style.padding, "40px");

    var debugToggle = el.querySelector('.debug');
    t.equal(debugToggle, el.childNodes.item(0));
    var controls = el.querySelector('.controls');
    t.equal(controls, el.childNodes.item(1));
    var rows = el.querySelector('.rows');
    t.equal(rows, el.childNodes.item(2));

    for (var y = 0; y < rows.childNodes.length; y++) {
      var row = rows.childNodes.item(y);
      t.equal(row.className, "row");
      
      for (var x = 0; x < row.childNodes.length; x++) {
        var itemContainer = row.childNodes.item(x);
        t.equal(itemContainer.className, "item");
        t.equal(itemContainer.style.height, "80px");
        t.equal(itemContainer.style.width, "80px");
        t.equal(itemContainer.childNodes.length, 1);
        var item = itemContainer.childNodes.item(0);
        t.equal(item.textContent, ndarray.get(x, y).toString());
      }
    }

    // cleanup
    document.body.removeChild(el);
    t.end();
  });
});
