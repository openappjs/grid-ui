var debug = require('debug')('grid-ui');
var mercury = require('mercury');
var h = mercury.h;
var ObservNdarray = require('observ-ndarray');
var stringify = require('node-stringify');
var extend = require('xtend');

var edgeEvent = require('./lib/edgeEvent');

function Grid (options) {
  options = options || {};
  var style = options.style || {};
  var config = options.config || {};

  var events = mercury.input(["setShape", "setDebug"]);

  // setup state
  var state = mercury.struct({
    model: ObservNdarray(options.model),
    style: mercury.struct({
      grid: mercury.value(style.grid || {}),
      controls: mercury.value(style.controls || {}),
      table: mercury.value(style.table || {}),
      row: mercury.value(style.row || {}),
      cell: mercury.value(style.cell || {}),
    }),
    config: mercury.struct({
      debug: mercury.value(options.config.debug || false),
      debugToggle: mercury.value(options.config.debugToggle || false),
      edgeSize: mercury.struct({
        x: config.edgeSize && config.edgeSize.x || config.edgeSize || 40,
        y: config.edgeSize && config.edgeSize.y || config.edgeSize || 40,
      }),
      cellSize: mercury.struct({
        x: config.cellSize && config.cellSize.x || config.cellSize || 80,
        y: config.cellSize && config.cellSize.y || config.cellSize || 80,
      }),
    }),
    events: events,
    render: mercury.value(Grid.render),
  });

  // setup events
  events.setShape(function (data) {
    debug("setShape", data);
    // get arguments
    var changedDim = data.dim;
    var changedStr = data.shape || data['shape.x'] || data['shape.y'];
    var changedVal = parseInt(changedStr, 10);

    // get current value
    var ndarray = state.model();

    var otherDim = (changedDim === 0) ? 1 : 0;
    var numCells = ndarray.data.length;

    // min shape value is 1
    changedVal = Math.max(changedVal, 1);

    // max shape value is number of cells
    changedVal = Math.min(changedVal, numCells);

    // other shape value is enough to display all cells
    var otherVal = Math.ceil(numCells / changedVal);

    // set shape
    ndarray.shape[changedDim] = changedVal;
    ndarray.shape[otherDim] = otherVal;

    debug("updated shape", ndarray.shape.slice())

    // set stride from y shape
    ndarray.stride[0] = ndarray.shape[1];

    // update state
    state.model.set(ndarray);
  });

  events.setDebug(function (data) {
    state.config.debug.set(data.debug);
  });

  debug("setup", state);

  return { state: state, events: events };
}

Grid.render = function (state, events) {
  debug("render", state, events);

  var table = [];
  for (var y = 0; y < state.model.shape[1]; y++) {
    var row = [];
    for (var x = 0; x < state.model.shape[0]; x++) {
      var cell = state.model.get(x, y);
      if (typeof cell !== 'undefined') {
        row.push(
          cell && cell.render && cell.render(cell) || stringify(cell)
        );
      }
    }
    table.push(row);
  }

  debug("rendering table", table);

  return h('div.ui.grid', {
    style: extend({
      paddingBottom: state.config.edgeSize.y + "px",
      paddingLeft: state.config.edgeSize.x + "px",
      paddingRight: state.config.edgeSize.x + "px",
      paddingTop: state.config.edgeSize.y + "px",
    }, state.style.grid),
    'ev-mousedown': edgeEvent(state.events.setShape, {
      edgeSize: state.config.edgeSize,
      cellSize: state.config.cellSize,
      shape: state.model.shape,
    }),
  }, [
    state.config.debugToggle ? h('input.debug.toggle', {
      type: "checkbox",
      name: "debug",
      checked: state.config.debug,
      'ev-event': mercury.changeEvent(state.events.setDebug),
    }) : [],
    h('div.controls', {
      style: state.style.controls,
    }, state.config.debug ? [
      h('div.control.shape.x', {}, [
        h('label.label', {
          htmlFor: "shape.x",
        }, "shape.x"),
        h('input.input', {
          type: "number",
          name: "shape.x",
          value: state.model.shape[0],
          'ev-event': mercury.changeEvent(state.events.setShape, {
            dim: 0,
          }),
        }),
      ]),
      h('div.control.shape.y', {}, [
        h('label.label', {
          htmlFor: "shape.y",
        }, "shape.y"),
        h('input.input', {
          type: "number",
          name: "shape.y",
          value: state.model.shape[1],
          'ev-event': mercury.changeEvent(state.events.setShape, {
            dim: 1,
          }),
        }),
      ]),
    ] : []),
    h('div.table', {
      style: state.style.table,
    }, table.map(function (row) {
      return h('div.row', {
        style: state.style.row,
      }, row.map(function (cell) {
        return h('div.cell', {
          style: extend({
            width: state.config.cellSize.x + "px",
            height: state.config.cellSize.y + "px",
          }, state.style.cell),
        }, cell)
      }));
    }))
  ])
  ;
}

module.exports = Grid;
