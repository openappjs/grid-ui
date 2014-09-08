var mercury = require('mercury');
var h = mercury.h;

function Item (value) {

  var events = mercury.input(["click"]);

  var state = mercury.struct({
    value: mercury.value(value),
    events: events,
    render: mercury.value(Item.render),
  });

  events.click(function (data) {
    console.log(data);
    //state.value.set(data);
  });

  return { state: state };
}

Item.render = function (state, events) {
  return h('div.wow', {
    style: {
      backgroundColor: "#" + state.value,
    },
    'ev-click': mercury.event(state.events.click),
  }, state.value)
  ;
}

module.exports = Item;
