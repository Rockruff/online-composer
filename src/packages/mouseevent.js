import _throttle from 'lodash/throttle';

export function initCustomMouseEvent(el, { click, down, move, up, except, interval }, stop) {
  // track for movement each time the mouse is down
  // if no move happens, trigger click handler
  // else trigger down, move and up. if error occurs and except is provided, it will be called instead of up

  el.onmousedown = (edown) => {
    if (stop) edown.stopPropagation();

    // whether if the mouse has ever been moved
    // if at least one mousemove has been received, `moved` will be true
    let moved = false;

    // `aborted` will be set to true before executing a handler each time
    // so if any handler crashes, `aborted` will be true and any subsequent events will be ignored
    let aborted = true;

    // optional context data for move events
    // user can store some temporary information here
    let context = {};

    // listen for mouse move event
    let onmousemove = (emove) => {
      if (!moved) {
        // prevent other events when current mouse button is not released
        document.body.style.pointerEvents = 'none';
        // enter mouse move
        moved = true;
        aborted = down(edown, context);
      }
      if (!aborted) {
        aborted = true;
        aborted = move(emove, context);
      }
    };

    let throttled = onmousemove;
    if (interval) throttled = _throttle(onmousemove, interval);
    window.addEventListener('mousemove', throttled, { passive: true });

    if (!click) {
      onmousemove(edown);
    }

    // listen for mouse up event
    // add event to window so it will be triggered even if mouse is released out of the element
    window.addEventListener(
      'mouseup',
      (eup) => {
        if (interval) throttled.flush();

        window.removeEventListener('mousemove', throttled); // remove move handler

        if (!moved) {
          click(edown);
          return;
        }

        document.body.style.pointerEvents = '';

        if (!aborted) up(eup, context);
        else if (except) except(eup, context);
      },
      { once: true },
    );
  };
}

export function uninitCustomMouseEvent(el) {
  el.onmousedown = null;
}
