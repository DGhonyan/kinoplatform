import type { Ref } from 'vue';

/**
 * Run `callback` whenever any of the observed elements changes size — and once
 * on mount. This is how we collapse UI based on whether content actually *fits*
 * (measure natural widths, compare to available space) rather than guessing a
 * viewport breakpoint. Observing the content element too means locale switches
 * (which change label widths without resizing the container) re-trigger it.
 */
export function useResizeObserver(
  targets: Ref<HTMLElement | null>[],
  callback: () => void,
) {
  let ro: ResizeObserver | null = null;
  let frame = 0;

  // Coalesce a burst of notifications into one call per frame. Callers typically
  // respond by toggling a class on an element they also observe (that's the
  // point — measure the content, then restyle it), which would otherwise
  // re-enter this observer synchronously and make Chrome log "ResizeObserver
  // loop completed with undelivered notifications".
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      callback();
    });
  };

  onMounted(() => {
    ro = new ResizeObserver(schedule);
    for (const t of targets) {
      if (t.value) ro.observe(t.value);
    }
    callback();
  });

  onBeforeUnmount(() => {
    ro?.disconnect();
    if (frame) cancelAnimationFrame(frame);
  });
}
