<template>
  <div class="login-page">
    <div class="header">
      <h1>Kinoplatform</h1>
    </div>

    <div class="form-wrapper">
      <div class="form">
        <div class="view-control">
          <v-btn :class="['view-control-button', formView === 'login' && 'active']" variant="text" @click="formView = 'login'">Login</v-btn>
          <v-btn :class="['view-control-button', formView === 'register' && 'active']" variant="text" @click="formView = 'register'">Register</v-btn>
        </div>
  
        <div class="input-container">
          <Login :class="['form-view', formView === 'login' && 'active']"/>
          <Register :class="['form-view', formView === 'register' && 'active']" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Login from './Login.vue'
import Register from './Register.vue'

const formView = ref('login')
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-wrapper {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form {
  border: 1px solid color(--v-theme-primary);

  display: flex;
  flex-direction: column;
}

.input-container {
  width: 100%;
  min-width: 400px;
  max-width: 600px;

  height: 400px;
  padding: 32px;

  align-self: center;
  justify-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.view-control {
  width: 100%;

  display: flex;
  justify-content: center;

  border-bottom: 1px solid color(--v-theme-primary);
}

.view-control-button {
  width: 50%;

  padding: 24px;
  border-radius: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  transition: all 0.3s ease;
}

.view-control-button.active {
  color: color(--v-theme-white);
  background-color: color(--v-theme-primary);
}

.view-control-button.login {
  border-right: 0.5px solid color(--v-theme-primary);
}

.view-control-button.register {
  border-left: 0.5px solid color(--v-theme-primary);
}

.form-view.active {
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-view {
  display: none;
}
</style>