var debug = require('debug')('grid-ui');
var h = require('virtual-hyperscript');
var input = require('geval/multiple');
var event = require('value-event/event')
var valueEvent = require('value-event/value');
var changeEvent = require('value-event/change');
var Observ = require('observ');
var ObservStruct = require('observ-struct');
var ObservNdarray = require('observ-ndarray');
var Ndarray = require('ndarray');

var GRID_PADDING = 60;

function grid (options) {

  var events = input(["edgeDown", "setShape"]);

  // embed items in ndarray as Item components
  var ndarray = options.ndarray;
  ndarray.data.forEach(function (item, index) {
    ndarray.data[index] = options.Item(item).state;
  });

  // setup state
  var state = ObservStruct({
    Item: Observ(options.Item),
    ndarray: ObservNdarray(ndarray),
    events: events,
  });

  // setup events
  events.edgeDown(function (data) {
    debug("edgeDown", data);
    if (data.clientX < GRID_PADDING) {
      debug("left down", data.clientX, data.clientY)

    } else if (data.clientX > (data.target.clientWidth - (2 * GRID_PADDING))) {
      debug("right down", data.clientX, data.clientY)

    } else if (data.clientY < GRID_PADDING) {
      debug("top down", data.clientX, data.clientY)

    } else if (data.clientY > (data.target.clientHeight - (2 * GRID_PADDING))) {
      debug("bottom down", data.clientX, data.clientY)

    }
    console.log(data.offsetX, data.target.offsetWidth - (2 * GRID_PADDING));
    console.log(data.offsetY, data.target.offsetHeight - (2 * GRID_PADDING));
    //state.value.set(data);
  });

  events.setShape(function (data) {
    debug("setShape", data);
    // get arguments
    var shapeDim = data.dim;
    var shapeVal = parseInt(data.shape, 10);

    // get current value
    var ndarray = state.ndarray();
    // set shape and associated stride on value
    ndarray.shape[shapeDim] = shapeVal;
    ndarray.stride[0] = ndarray.shape[1];

    // set value to be state
    state.ndarray.set(ndarray);
  });

  debug("setup", state);

  return { state: state, events: events };
}

grid.render = function (state, events) {
  debug("render", state, events);

  var rows = [];
  for (var y = 0; y < state.ndarray.shape[1]; y++) {
    var row = [];
    for (var x = 0; x < state.ndarray.shape[0]; x++) {
      var item = state.ndarray.get(x, y);
      if (item) {
        row.push(state.Item.render(item));
      }
    }
    rows.push(row);
    if (state.ndarray.shape[1] === 0) {
      row.push([]);
    }
  }
  if (state.ndarray.shape[0] === 0) {
    rows.push([]);
  }

  return h('div.ui.grid', {
    'ev-mousedown': state.events.edgeDown,
  }, [
    h('div.controls', {}, [
      h('input', {
        type: "number",
        name: "shape",
        value: state.ndarray.shape[0],
        'ev-event': changeEvent(state.events.setShape, {
          dim: 0,
        }),
      }),
      h('input', {
        type: "number",
        name: "shape",
        value: state.ndarray.shape[1],
        'ev-event': changeEvent(state.events.setShape, {
          dim: 1,
        }),
      }),
    ]),
    h('div.rows', {}, rows.map(function (row) {
      return h('div.row', {}, row.map(function (item) {
        return h('div.item', {}, item)
      }));
    }))
  ])
  ;
}

module.exports = grid;
