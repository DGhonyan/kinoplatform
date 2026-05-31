<template>
  <div class="register-progress">
    <template
      v-for="i in total"
      :key="i"
    >
      <div
        class="circle"
        :class="{ active: i - 1 <= current }"
      />
      <div
        v-if="i < total"
        class="line"
        :class="{ active: i <= current }"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  total: number;
  current: number;
}>();
</script>

<style scoped lang="scss">
.register-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.circle {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.12);
  transition: background-color 0.3s ease;
}

.circle.active {
  background: color(--v-theme-primary);
}

.line {
  width: 40px;
  height: 2px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.12);
  transition: background-color 0.3s ease;
}

.line.active {
  background: color(--v-theme-primary);
}
</style>
