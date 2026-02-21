<template>
  <div class="layout-content">
    <slot />
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped lang="scss">
.layout-content {
  width: 100%;
  height: 100%;
  padding: $base-padding;
}
</style>