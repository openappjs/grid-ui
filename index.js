var debug = require('debug')('grid-ui');
var mercury = require('mercury');
var h = mercury.h;
var ObservNdarray = require('observ-ndarray');
var stringify = require('node-stringify');

var edgeEvent = require('./lib/edgeEvent');

function Grid (options) {
  options = options || {};
  var config = options.config || {};

  var events = mercury.input(["setShape", "setDebug"]);

  // setup state
  var state = mercury.struct({
    model: ObservNdarray(options.model),
    config: mercury.struct({
      debug: mercury.value(options.config.debug || false),
      debugToggle: mercury.value(options.config.debugToggle || false),
      edgeSize: mercury.struct({
        x: config.edgeSize && config.edgeSize.x || config.edgeSize || 40,
        y: config.edgeSize && config.edgeSize.y || config.edgeSize || 40,
      }),
      itemSize: mercury.struct({
        x: config.itemSize && config.itemSize.x || config.itemSize || 80,
        y: config.itemSize && config.itemSize.y || config.itemSize || 80,
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
    var numItems = ndarray.data.length;

    // min shape value is 1
    changedVal = Math.max(changedVal, 1);

    // max shape value is number of items
    changedVal = Math.min(changedVal, numItems);

    // other shape value is enough to display all items
    var otherVal = Math.ceil(numItems / changedVal);

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

  var rows = [];
  for (var y = 0; y < state.model.shape[1]; y++) {
    var row = [];
    for (var x = 0; x < state.model.shape[0]; x++) {
      var item = state.model.get(x, y);
      if (typeof item !== 'undefined') {
        row.push(
          item && item.render && item.render(item) || stringify(item)
        );
      }
    }
    rows.push(row);
    if (state.model.shape[0] === 0) {
      row.push([]);
    }
  }
  if (state.model.shape[1] === 0) {
    rows.push([]);
  }

  return h('div.ui.grid', {
    style: {
      paddingBottom: state.config.edgeSize.y + "px",
      paddingLeft: state.config.edgeSize.x + "px",
      paddingRight: state.config.edgeSize.x + "px",
      paddingTop: state.config.edgeSize.y + "px",
    },
    'ev-mousedown': edgeEvent(state.events.setShape, {
      edgeSize: state.config.edgeSize,
      itemSize: state.config.itemSize,
      shape: state.model.shape,
    }),
  }, [
    state.config.debugToggle ? h('input.debug.toggle', {
      type: "checkbox",
      name: "debug",
      checked: state.config.debug,
      'ev-event': mercury.changeEvent(state.events.setDebug),
    }) : [],
    h('div.controls', {}, state.config.debug ? [
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
    h('div.rows', {}, rows.map(function (row) {
      return h('div.row', {}, row.map(function (item) {
        return h('div.item', {
          style: {
            width: state.config.itemSize.x + "px",
            height: state.config.itemSize.y + "px",
          },
        }, item)
      }));
    }))
  ])
  ;
}

module.exports = Grid;
