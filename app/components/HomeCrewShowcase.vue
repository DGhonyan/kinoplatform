<template>
  <section
    v-if="users.length"
    class="showcase"
  >
    <div class="showcase-head">
      <h2 class="showcase-title">
        {{ $t('home_find_crew') }}
      </h2>
      <p class="showcase-text">
        {{ $t('home_hero_slogan') }}
      </p>
    </div>

    <div class="showcase-grid">
      <UserCard
        v-for="member in users"
        :key="member._id"
        :user="member"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { User } from '~~/shared/types/user';

const userStore = useUserStore();
const users = ref<User[]>([]);

onMounted(async () => {
  users.value = (await userStore.getRecentUsers()) ?? [];
});
</script>

<style scoped lang="scss">
.showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 56px 16px;
  text-align: center;
}

.showcase-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.showcase-title {
  margin: 0;
  font-family: 'Bebas Neue', sans-serif;
  text-transform: uppercase;
  font-size: 48px;
  font-weight: 400;
  letter-spacing: 1px;
  line-height: 1.05;
}

.showcase-text {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  // Honor the `\n` in the slogan i18n value.
  white-space: pre-line;
  opacity: 0.8;
}

.showcase-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;

  // Opt into UserCard's sizing contract on phones. The fixed 200x290 fits only
  // one card per row here (this section adds its own padding on top of the
  // layout's), while /crew and /talents both go 2-up — and UserCard's mobile
  // type trims would otherwise leave dead space inside a still-290px box.
  @include mobile {
    --user-card-width: auto;
    --user-card-height: auto;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
