import type { Ref } from 'vue';

// Runs `callback` on any observed element's resize, plus once on mount. Observing
// the CONTENT too is what makes locale switches (new label widths) re-trigger it.
export function useResizeObserver(
  targets: Ref<HTMLElement | null>[],
  callback: () => void,
) {
  let ro: ResizeObserver | null = null;
  let frame = 0;

  // One call per frame. Callers restyle the element they observe, which would
  // otherwise re-enter synchronously and trip Chrome's "loop completed" warning.
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
