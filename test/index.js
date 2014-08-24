var test = require('tape');
var mercury = require('mercury');
var Ndarray = require('ndarray');
var raf = require('raf');
var event = require('synthetic-dom-events');
var document = require('global/document');
var stringify = require('node-stringify');
var TWEEN = require('tween.js');

var Grid = require('../');

// if we are in a browser
if (process.browser) {
  // include example app styles
  require('../example/app.css');

  // include grid-ui styles
  require('../index.css');
}

function end (t, el, elRm) {
  // cleanup
  elRm();
  document.body.removeChild(el);
  t.end();
}

test("creating a 4x4 grid of random content", function (t) {
  // setup
  var ndarray = new Ndarray([
    0,[],"",{},null,undefined,
  ], [2,3]);
  var grid = Grid({
    model: ndarray,
    config: {
      edgeSize: 40,
      cellSize: {
        x: 80,
        y: 80,
      },
    },
  });

  // start app
  var elRm = mercury.app(document.body, grid.state, Grid.render);

  // after render
  raf(function () {
    var el = document.getElementsByClassName('grid ui')[0];

    t.equal(el.style.paddingBottom, "40px");
    t.equal(el.style.paddingLeft, "40px");
    t.equal(el.style.paddingRight, "40px");
    t.equal(el.style.paddingTop, "40px");

    var controls = el.childNodes[0];
    t.ok(controls);
    t.equal(controls.className, "controls");
    var table = el.childNodes[1];
    t.ok(table);
    t.equal(table.className, "table");

    for (var y = 0; y < table.childNodes.length; y++) {
      var row = table.childNodes[y];
      t.equal(row.className, "row");
      
      for (var x = 0; x < row.childNodes.length; x++) {
        var cellContainer = row.childNodes[x];
        t.equal(cellContainer.className, "cell");
        t.equal(cellContainer.style.height, "80px");
        t.equal(cellContainer.style.width, "80px");
        t.equal(cellContainer.childNodes.length, 1);
        var cell = cellContainer.childNodes[0];
        t.equal(
          cell.textContent || cell.data,
          stringify(ndarray.get(x, y))
        );
      }
    }

    end(t, el, elRm);
  });
});

function assertShape (t, el, data, shape) {
  var ndarray = new Ndarray(data, shape);

  var table = el.getElementsByClassName('table')[0];
  t.equal(table.childNodes.length, shape[1]);

  for (var y = 0; y < table.childNodes.length; y++) {
    var row = table.childNodes[y];
    t.equal(row.childNodes.length, shape[0]);

    for (var x = 0; x < row.childNodes.length; x++) {
      var cellContainer = row.childNodes[x];
      var cell = cellContainer.childNodes[0];
      t.equal(
        cell.textContent || cell.data,
        stringify(ndarray.get(x, y))
      );
    }
  }
}

test("change shape of grid with controls", function (t) {
  // setup
  var data = [
    0,1,2,3,4,5
  ];
  var grid = Grid({
    model: new Ndarray(data, [2, 3]),
    config: {
      debug: true,
    },
  });

  // start app
  var elRm = mercury.app(document.body, grid.state, Grid.render);

  function changeShape (el, shape) {

    if (shape[0]) {
      var xControl = el.getElementsByClassName('shape x control')[0];
      var xInput = xControl.getElementsByClassName('input')[0];
      xInput.value = shape[0].toString();
      xInput.dispatchEvent(event('input', { bubbles: true }));
    }

    if (shape[1]) {
      var yControl = el.getElementsByClassName('shape y control')[0];
      var yInput = yControl.getElementsByClassName('input')[0];
      yInput.value = shape[1].toString();
      yInput.dispatchEvent(event('input', { bubbles: true }));
    }
  }

  // animate
  raf(function () {
    var el = document.getElementsByClassName('grid ui')[0];

    assertShape(t, el, data, [2, 3]);
    changeShape(el, [3, null]);

    raf(function () {
      assertShape(t, el, data, [3, 2]);
      changeShape(el, [1, null]);

      raf(function () {
        assertShape(t, el, data, [1, 6]);
        changeShape(el, [6, null]);

        raf(function () {
          assertShape(t, el, data, [6, 1]);

          end(t, el, elRm);
        });
      });
    });
  });
});

function simulateClient (el, state) {
  var shape = state.model.shape.slice();
  el.clientWidth = el.clientWidth ||
    (state.config.cellSize.x * shape[0] + (state.config.edgeSize.x * 2));
  el.clientHeight = el.clientHeight ||
    (state.config.cellSize.y * shape[1] + (state.config.edgeSize.y * 2));
}

test("change shape of grid by dragging right edge", function (t) {
  var data = [
    0,1,2,3,4,5
  ];
  var grid = Grid({
    model: new Ndarray(data, [2, 3]),
    config: {
      edgeSize: {
        x: 80,
        y: 50,
      },
      cellSize: {
        x: 60,
        y: 100,
      },
    },
  });

  // start app
  var elRm = mercury.app(document.body, grid.state, Grid.render);

  function mouseEvent (type, el, position) {
    el.dispatchEvent(event("mouse" + type, {
      target: el,
      offsetX: position.x,
      offsetY: position.y,
    }));
  }

  raf(function () {
    var el = document.getElementsByClassName('grid ui')[0];
    var state = grid.state();

    simulateClient(el, state);

    var start = {
      position: {
        x: el.clientWidth - (state.config.edgeSize.x / 2),
        y: state.config.edgeSize.y / 2,
      },
      shape: {
        x: state.model.shape.slice()[0],
        y: state.model.shape.slice()[1],
      },
    };

    var stop = {
      x: Math.round(Math.random() * el.clientWidth),
      y: Math.round(Math.random() * el.clientHeight),
    }

    var current;

    mouseEvent("down", el, start);

    var tween = new TWEEN.Tween(start)
    .to(stop)
    .onUpdate(function () {
      current = this;
      mouseEvent("move", el, current);
      raf(function () {
        var deltaPos = {
          x: current.x - start.x,
          y: current.y - start.y,
        };
        var newShape = [
          start.shape.x + (deltaPos.x / state.config.cellSize.x),
          start.shape.y + (deltaPos.y / state.config.cellSize.y),
        ];
        t.deepEqual(grid.state.model().shape.slice(), newShape);
        assertShape(t, el, state.model.data, newShape);
      });
    })
    .onComplete(function () {

      raf(function () {
        console.log("complete", current)
        mouseEvent("up", el, current);

        raf(function () {
          end(t, el, elRm);
        });
      })

    })
    .start()
    ;

    animate();

    function animate () {
      raf(animate);
      TWEEN.update();
    }
  });
});
