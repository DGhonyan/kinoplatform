<template>
  <Header />

  <div class="layout-content">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.layout-content {
  width: 100%;
  height: 100%;
  padding: $base-padding;
}
</style>
