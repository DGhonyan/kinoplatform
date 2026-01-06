<template>
  <div class="header-content">
    <div class="title">
      <h1>Kinoplatform</h1>
    </div>

    <div class="links">
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </div>

    <div class="actions">
      <v-btn variant="text" color="primary">Login</v-btn>
      <v-btn variant="text" color="primary">Register</v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped lang="scss">
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $base-padding;
}

.links {
  display: flex;
  gap: 16px;
}

.links a {
  text-decoration: none;
  font-weight: 500;
}

.links a:visited {
  color: color(--v-theme-black);
}

.links a:hover {
  color: color(--v-theme-primary);
}
</style>
