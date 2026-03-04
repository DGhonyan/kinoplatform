<template>
  <Transition name="slide-fade">
    <v-alert
      v-if="message"
      :type="message.type"
      class="message-alert"
      closable
      @click:close="closeMessage"
    >
      {{ formattedMessage }}
    </v-alert>
  </Transition>
</template>

<script lang="ts" setup>
import { watch, ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';

const appStore = useAppStore();
const { message } = storeToRefs(appStore);
const { hideMessage } = appStore;

const timeoutId = ref<number | null>(null);

const formattedMessage = computed(() => {
  if (!message.value) return '';
  
  let text = message.value.text;
  
  // Replace variables in format {variableName}
  if (message.value.variables) {
    Object.entries(message.value.variables).forEach(([key, value]) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });
  }
  
  return text;
});

const closeMessage = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }
  hideMessage();
};

watch(message, (newMessage) => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }

  if (newMessage && newMessage.duration && newMessage.duration > 0) {
    timeoutId.value = window.setTimeout(() => {
      hideMessage();
      timeoutId.value = null;
    }, newMessage.duration);
  }
});
</script>

<style scoped lang="scss">
.message-alert {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 9999;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
