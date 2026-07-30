<template>
  <div class="admin-locations">
    <div class="page-head">
      <div class="head-text">
        <h1 class="page-title">
          {{ $t('admin_locations_title') }}
        </h1>
        <p class="page-subtitle">
          {{ $t('admin_locations_subtitle') }}
        </p>
      </div>
      <Button
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ $t('admin_locations_add') }}
      </Button>
    </div>

    <div
      v-if="loading"
      class="state"
    >
      <v-progress-circular
        indeterminate
        size="28"
        width="3"
        color="primary"
      />
    </div>

    <ul
      v-else-if="locations.length"
      class="rows"
    >
      <li
        v-for="location in locations"
        :key="location._id"
        class="row"
      >
        <img
          v-if="location.images[0]"
          class="thumb"
          :src="location.images[0]"
          alt=""
        >
        <div
          v-else
          class="thumb thumb-empty"
        >
          <v-icon size="20">
            mdi-image-off-outline
          </v-icon>
        </div>

        <div class="row-text">
          <NuxtLink
            :to="`/locations/${location._id}`"
            class="row-title"
          >
            {{ location.title }}
          </NuxtLink>
          <div class="row-meta">
            <span v-if="location.city">{{ location.city }}</span>
            <span class="row-price">{{ priceOf(location) }}</span>
            <span>{{ $t('admin_locations_images_count', { count: location.images.length }) }}</span>
            <span>{{ $t('admin_locations_reviews_count', { count: location.reviewCount }) }}</span>
          </div>
        </div>

        <div class="row-actions">
          <Button
            variant="secondary"
            size="small"
            prepend-icon="mdi-pencil-outline"
            :loading="editLoadingId === location._id"
            @click="openEdit(location._id)"
          >
            {{ $t('common_edit') }}
          </Button>
          <Button
            variant="secondary"
            size="small"
            color="error"
            prepend-icon="mdi-delete-outline"
            @click="onDelete(location._id)"
          >
            {{ $t('common_delete') }}
          </Button>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="state empty"
    >
      {{ $t('admin_locations_none') }}
    </p>

    <LocationFormPopup
      v-model="showForm"
      :location="editTarget"
      @saved="load"
    />

    <ConfirmDialog
      v-model="showDeleteConfirm"
      :title="$t('admin_locations_delete_confirm_title')"
      :text="$t('admin_locations_delete_confirm_text')"
      :confirm-label="$t('common_delete')"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Location, LocationDetail } from '~~/shared/types/location';
import { formatPrice } from '~/utils/locations';
import Button from '~/components/Button.vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';
import LocationFormPopup from '~/components/locations/LocationFormPopup.vue';

definePageMeta({
  // auth.global.ts only enforces login (no roles), so admin-only is this page's
  // own gate; page middleware runs after global, so initAuth resolved `user`.
  middleware: () => {
    const authStore = useAuthStore();
    if (authStore.user?.type !== 'admin') return navigateTo('/');
  },
});

const { locale } = useI18n();
const locationStore = useLocationStore();

const locations = ref<Location[]>([]);
const loading = ref(true);

const priceOf = (location: Location) =>
  formatPrice(location.pricePerHour, location.currency, locale.value);

const load = async () => {
  loading.value = true;
  const data = await locationStore.listLocations();
  locations.value = data ?? [];
  loading.value = false;
};

// ── Create / edit ──
// Editing fetches the full detail first — PATCHing from the card subset would blank detail-only fields.
const showForm = ref(false);
const editTarget = ref<LocationDetail | null>(null);
const editLoadingId = ref<string | null>(null);

const openCreate = () => {
  editTarget.value = null;
  showForm.value = true;
};

// Last click wins: without the guard a slower detail response overwrites
// `editTarget` after the popup filled, and Save would PATCH the wrong listing.
let editSeq = 0;
const openEdit = async (id: string) => {
  const seq = ++editSeq;
  editLoadingId.value = id;
  try {
    const detail = await locationStore.getLocation(id);
    if (seq !== editSeq || !detail) return; // superseded by a newer click
    editTarget.value = detail;
    showForm.value = true;
  }
  finally {
    if (seq === editSeq) editLoadingId.value = null;
  }
};

// ── Delete ──
const showDeleteConfirm = ref(false);
const deleteTargetId = ref<string | null>(null);
const deleting = ref(false);

const onDelete = (id: string) => {
  deleteTargetId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  const id = deleteTargetId.value;
  if (!id) return;
  deleting.value = true;
  try {
    const ok = await locationStore.deleteLocation(id);
    // Drop the row locally on success rather than refetching the whole list.
    if (ok) locations.value = locations.value.filter(l => l._id !== id);
  }
  finally {
    deleting.value = false;
    showDeleteConfirm.value = false;
    deleteTargetId.value = null;
  }
};

onMounted(load);
</script>

<style lang="scss" scoped>
.admin-locations {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 15px;
  opacity: 0.7;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid color(--v-theme-on-surface, 0.16);
  border-radius: 12px;

  // Actions drop to their own line instead of squeezing the title to nothing.
  @include mobile {
    flex-wrap: wrap;
    gap: 12px;
  }
}

.thumb {
  flex: 0 0 auto;
  width: 72px;
  height: 54px; // 4:3, the shape the gallery crops to
  border-radius: 8px;
  object-fit: cover;
}

.thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: color(--v-theme-on-surface, 0.5);
  background: color(--v-theme-on-surface, 0.06);
}

.row-text {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row-title {
  font-size: 16px;
  font-weight: 600;
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 13px;
  opacity: 0.7;
}

.row-price {
  font-weight: 500;
  opacity: 1;
}

.row-actions {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;

  // Full-width pair once wrapped, so both stay comfortably tappable.
  @include mobile {
    width: 100%;

    > * {
      flex: 1;
    }
  }
}

.state {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}

.empty {
  margin: 0;
  font-size: 14px;
  opacity: 0.6;
}
</style>
