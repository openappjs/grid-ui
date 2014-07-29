var mercury = require('mercury');
var h = mercury.h;

module.exports = search;

function search () {

  var events = mercury.input(["change"]);

  var state = mercury.struct({
    value: mercury.value(""),
    events: events,
  });

  events.change(function (data) {
    state.value.set(data.search);
  });

  return { state: state };
}

search.render = function (state, events) {
  return h('div', [
    state.value,
    h('input', {
      type: 'text',
      name: 'search',
      value: state.value,
      'ev-event': mercury.changeEvent(state.events.change),
    })
  ])
  ;
}
