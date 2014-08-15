var debug = require('debug')('grid-ui:edgeEvent');
var extend = require('xtend');

function EdgeEvent(fn, value) {
  if (!(this instanceof EdgeEvent)) {
      return new EdgeEvent(fn, value);
  }

  debug("constructor", fn, value);

  // store arguments
  this.fn = fn;
  this.value = value || {};
  
  // set default values
  this.value.gridPadding = this.value.gridPadding || 60;
}

EdgeEvent.prototype.handleEvent = function (ev) {
  debug("handleEvent", ev);


  var fn = this.fn;
  var value = this.value;

  var currentX = ev.offsetX || ev.layerX;
  var currentY = ev.offsetY || ev.layerY;

  if (currentX < value.gridPadding) {
    debug("left down", currentX, currentY);

  } else if (currentX > (ev.target.clientWidth - (2 * value.gridPadding))) {
    debug("right down", currentX, currentY);

  } else if (currentY < value.gridPadding) {
    debug("top down", currentX, currentY);

  } else if (currentY > (ev.target.clientHeight - (2 * value.gridPadding))) {
    debug("bottom down", currentX, currentY);
  }

  function onmove(ev) {
    debug("onmove", ev);

    var delta = {
      x: ev.clientX - currentX,
      y: ev.clientY - currentY,
    };

    fn(extend(value, delta));

    currentX = ev.clientX;
    currentY = ev.clientY;
  }

  function onup(ev) {
    debug("onup", ev);

    window.removeEventListener("mousemove", onmove);
    window.removeEventListener("mouseup", onup);
  }

  window.addEventListener("mousemove", onmove);
  window.addEventListener("mouseup", onup);
}

module.exports = EdgeEvent;
