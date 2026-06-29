// Tracks how many PopupShell dialogs are currently open. PopupShell is a
// teleported v-dialog (overlay container, z-index ~2000), so any header control
// that needs to sit *above* an open popup (today: the LanguageSwitch) can read
// `isPopupOpen` and teleport itself above the overlay only while one is open.
//
// `openCount` is declared at module scope, so every caller shares one reactive
// counter (ES modules are singletons) — no Pinia store needed for this.
const openCount = ref(0);

export function useActivePopup() {
  return {
    isPopupOpen: computed(() => openCount.value > 0),
    registerPopup: () => {
      openCount.value++;
    },
    unregisterPopup: () => {
      openCount.value = Math.max(0, openCount.value - 1);
    },
  };
}
