var debug = require('debug')('grid-ui');
var mercury = require('mercury');
var h = mercury.h;
var ObservNdarray = require('observ-ndarray');

var edgeEvent = require('./lib/edgeEvent');

function Grid (options) {
  options = options || {};
  var config = options.config || {};

  var events = mercury.input(["setShape"]);

  // setup state
  var state = mercury.struct({
    model: ObservNdarray(options.model),
    config: mercury.struct({
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
    var shapeDim = data.dim;
    var shapeVal = parseInt(data.shape, 10);

    // get current value
    var ndarray = state.model();
    // set shape and associated stride on value
    ndarray.shape[shapeDim] = shapeVal;
    ndarray.stride[0] = ndarray.shape[1];

    // set value to be state
    state.model.set(ndarray);
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
      if (item) {
        row.push(item.render(item));
      }
    }
    rows.push(row);
    if (state.model.shape[1] === 0) {
      row.push([]);
    }
  }
  if (state.model.shape[0] === 0) {
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
    h('div.controls', {}, [
      h('input', {
        type: "number",
        name: "shape",
        value: state.model.shape[0],
        'ev-event': mercury.changeEvent(state.events.setShape, {
          dim: 0,
        }),
      }),
      h('input', {
        type: "number",
        name: "shape",
        value: state.model.shape[1],
        'ev-event': mercury.changeEvent(state.events.setShape, {
          dim: 1,
        }),
      }),
    ]),
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
