var h = require('virtual-hyperscript');
var input = require('geval/multiple');
var Observ = require('observ');
var ObservStruct = require('observ-struct');
var event = require('value-event/event')

function StyleHook (color) {
  this.color = '#' + color;
}

StyleHook.prototype.hook = function (elem, prop) {
  elem.setAttribute(prop, "background-color:" + this.color + ";");
}

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
  return h('div.square', {
    'style': new StyleHook(state.value),
    'ev-click': event(state.events.click),
  }, state.value)
  ;
}

module.exports = Item;
