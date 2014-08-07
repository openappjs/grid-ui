var h = require('virtual-hyperscript');
var input = require('geval/multiple');
var event = require('value-event/event')
var Observ = require('observ');
var ObservStruct = require('observ-struct');
var ObservNdarray = require('observ-ndarray');
var Ndarray = require('ndarray');

function grid (options) {

  var events = input(["click"]);

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

  return { state: state };
}

grid.render = function (state, events) {

  var rows = [];
  for (var i = 0; i < state.ndarray.shape[0]; i++) {
    var row = [];
    for (var j = 0; j < state.ndarray.shape[1]; j++) {
      row.push(state.Item.render(state.ndarray.get(i, j)));
    }
    rows.push(row);
  }

  return h('div.ui.grid', {}, [
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
