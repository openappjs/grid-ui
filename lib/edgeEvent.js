var debug = require('debug')('grid-ui:edgeEvent');
var mercury = require('mercury');

function EdgeEvent(fn, value) {
  if (!(this instanceof EdgeEvent)) {
      return new EdgeEvent(fn, value);
  }

  debug("constructor", fn, value);

  // store arguments
  this.fn = fn;
  this.value = value || {};
  this.delegator = mercury.Delegator();
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
  
  var fn = this.fn;
  var value = this.value;
  var delegator = this.delegator;

  function onmove (ev) {
    debug("onmove", ev);

    var current = {
      x: ev.offsetX || ev.layerX,
      y: ev.offsetY || ev.layerY,
    };

    var delta = {
      x: current.x - start.x,
      y: current.y - start.y,
    };

    debug("changing edge", start, delta);

    switch (edgeDir) {
      case "right":
        fn({
          dim: 0,
          shape: start.shape[0]
            + Math.floor(delta.x / value.cellSize.x),
        });
        break;
      case "bottom":
        fn({
          dim: 1,
          shape: start.shape[1]
            + Math.floor(delta.y / value.cellSize.y),
        });
        break;
    }
  };

  function onup (ev) {
    debug("onup", ev);

    delegator.removeGlobalEventListener("mousemove", onmove);
    delegator.removeGlobalEventListener("mouseup", onup);
    delegator.unlistenTo("mousemove");
  };

  delegator.listenTo("mousemove");
  delegator.addGlobalEventListener("mousemove", onmove);
  delegator.addGlobalEventListener("mouseup", onup);
}

module.exports = EdgeEvent;
