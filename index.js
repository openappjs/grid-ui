var h = require('virtual-hyperscript');
var input = require('geval/multiple');
var event = require('value-event/event')
var changeEvent = require('value-event/change')
var Observ = require('observ');
var ObservStruct = require('observ-struct');
var ObservNdarray = require('observ-ndarray');
var Ndarray = require('ndarray');

function grid (options) {

  var events = input(["click", "shapeX", "shapeY"]);

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
  events.click(function (data) {
    console.log(data);
    //state.value.set(data);
  });

  events.shapeX(function (data) {
    var shapeX = parseInt(data.shapeX, 10);
    var ndarray = state().ndarray;
    ndarray.shape = [shapeX, ndarray.shape[1]];
    ndarray.stride = [ndarray.shape[1], 1];
    state.ndarray.set(ndarray);
  });

  events.shapeY(function (data) {
    var shapeY = parseInt(data.shapeY, 10);
    var ndarray = state().ndarray;
    ndarray.shape = [ndarray.shape[0], shapeY];
    ndarray.stride = [ndarray.shape[1], 1];
    state.ndarray.set(ndarray);
  });

  return { state: state };
}

grid.render = function (state, events) {
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

  return h('div.ui.grid', {}, [
    h('div.controls', {}, [
      h('input', {
        type: "number",
        name: "shapeX",
        value: state.ndarray.shape[0],
        'ev-event': changeEvent(state.events.shapeX),
      }),
      h('input', {
        type: "number",
        name: "shapeY",
        value: state.ndarray.shape[1],
        'ev-event': changeEvent(state.events.shapeY),
      }),
    ]),
    h('div.rows', {}, rows.map(function (row) {
      return h('div.row', {
        'ev-click': event(state.events.click),
      }, row.map(function (item) {
        return h('div.item', {}, item)
      }));
    }))
  ])
  ;
}

module.exports = grid;
