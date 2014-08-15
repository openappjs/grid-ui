var debug = require('debug')('grid-ui:edgeEvent');

function EdgeEvent(fn, value) {
  if (!(this instanceof EdgeEvent)) {
      return new EdgeEvent(fn, value);
  }

  debug("constructor", fn, value);

  // store arguments
  this.fn = fn;
  this.value = value || {};
}

EdgeEvent.prototype.handleEvent = function handleEvent (ev) {
  debug("handleEvent", ev);

  var start = {
    x: ev.offsetX || ev.layerX,
    y: ev.offsetY || ev.layerY,
    shape: this.value.shape.slice(),
  };

  if (start.x < this.value.edgeSize.x) {
    this.dragEdge("down", start);

  } else if (start.x > (ev.target.clientWidth - (2 * this.value.edgeSize.x))) {
    this.dragEdge("right", start);

  } else if (start.y < this.value.edgeSize.y) {
    this.dragEdge("top", start);

  } else if (start.y > (ev.target.clientHeight - (2 * this.value.edgeSize.y))) {
    this.dragEdge("bottom", start);
  }

}

EdgeEvent.prototype.dragEdge = function dragEdge (edgeDir, start) {
  debug("dragEdge", edgeDir, start);

  var onmove = function onmove(ev) {
    debug("onmove", ev);

    var delta = {
      x: ev.clientX - start.x,
      y: ev.clientY - start.y,
    };

    debug("changing edge", start, delta);

    switch (edgeDir) {
      case "right":
        this.fn({
          dim: 0,
          shape: start.shape[0]
            + Math.floor(delta.x / this.value.itemSize.x),
        });
        break;
      case "bottom":
        this.fn({
          dim: 1,
          shape: start.shape[1]
            + Math.floor(delta.y / this.value.itemSize.y),
        });
        break;
    }
  }.bind(this);

  var onup = function onup(ev) {
    debug("onup", ev);

    window.removeEventListener("mousemove", onmove);
    window.removeEventListener("mouseup", onup);
  };

  window.addEventListener("mousemove", onmove);
  window.addEventListener("mouseup", onup);
}

module.exports = EdgeEvent;
