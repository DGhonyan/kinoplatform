<template>
  <div class="crew">
    <div class="toolbar">
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
      />
    </div>

    <div class="crew-list">
      <div v-for="user in filteredUsers" :key="user.id" class="item">
        <div class="item-avatar">
            <img :src="getUserAvatar()" alt="User Avatar" />
        </div>
        <div class="item-content">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const getUserAvatar = () => {
  return new URL(`@/assets/default.jpg`, import.meta.url).href
}

const users = ref([
  { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
  { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' },
  { id: 3, name: 'Jim Doe', email: 'jim.doe@example.com' },
  { id: 4, name: 'Jill Doe', email: 'jill.doe@example.com' },
  { id: 5, name: 'Jack Doe', email: 'jack.doe@example.com' },
])

const filteredUsers = computed(() => {
  return users.value.filter((user) => user.name.toLowerCase().includes(search.value.toLowerCase()))
})

const search = ref('')
</script>

<style lang="scss" scoped>
.crew {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crew-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 200px;

  .item-avatar {
    width: 100%;
    height: 100%;
    display: flex;
  
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .item-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
}

</style>