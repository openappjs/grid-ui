var h = require('virtual-hyperscript');
var input = require('geval/multiple');
var Observ = require('observ');
var ObservStruct = require('observ-struct');
var event = require('value-event/event')

function Item (value) {

  var events = input(["click"]);

  var state = ObservStruct({
    value: Observ(value),
    events: events,
  });

  events.click(function (data) {
    console.log(data);
    //state.value.set(data);
  });

  return { state: state };
}

Item.render = function (state, events) {
  return h('div', {
    'ev-click': event(state.events.click),
  }, state.value)
  ;
}

module.exports = Item;
