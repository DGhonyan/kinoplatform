<template>
  <div class="media-gallery">
    <!-- Nothing uploaded yet: a deliberate empty frame rather than a broken
         <img>. Hosts publish before they have photos, so this is common. -->
    <div
      v-if="!images.length"
      class="stage stage-empty"
    >
      <v-icon size="48">
        mdi-image-off-outline
      </v-icon>
      <span class="stage-empty-text">{{ $t(emptyText) }}</span>
    </div>

    <template v-else>
      <img
        :key="activeSrc"
        :src="activeSrc"
        :alt="alt"
        class="stage stage-image"
      >

      <!-- A single image has nothing to step through. -->
      <Carousel
        v-if="images.length > 1"
        :items="images"
        class="thumbs"
      >
        <template #item="{ item, index }">
          <button
            type="button"
            class="thumb"
            :class="{ 'is-active': index === activeIndex }"
            :aria-label="$t('media_gallery_show_image', { index: index + 1 })"
            :aria-current="index === activeIndex"
            @click="activeIndex = index"
          >
            <img
              :src="item"
              alt=""
              class="thumb-image"
            >
          </button>
        </template>
      </Carousel>
    </template>
  </div>
</template>

<script lang="ts" setup>
// Active image + thumbnail strip. The gallery owns only the selection; the strip
// is a plain Carousel, so scroll/arrow behaviour stays in one component.
import Carousel from '~/components/Carousel.vue';

const props = withDefaults(
  defineProps<{
    images: string[];
    /** Alt text for the active image — describe the subject, not the widget. */
    alt?: string;
    /** i18n key shown in place of the frame when there are no images. */
    emptyText?: string;
  }>(),
  { alt: '', emptyText: 'media_gallery_no_images' },
);

const activeIndex = ref(0);

// Swapping to another location reuses this component (the detail page is one
// route), so a stale index would point past a shorter image list.
watch(() => props.images, () => {
  activeIndex.value = 0;
});

const activeSrc = computed(() => props.images[activeIndex.value] ?? props.images[0] ?? '');
</script>

<style scoped lang="scss">
.media-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stage {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;

  @include mobile {
    aspect-ratio: 4 / 3;
    border-radius: 12px;
  }
}

.stage-image {
  // Whole photo, not a crop — see LocationCard for the reasoning.
  object-fit: contain;
  // Keeps the frame from flashing the page background while a large photo
  // decodes, and gives letterboxed shots a surface instead of a hole.
  background-color: color(--v-theme-on-surface, 0.06);
}

.stage-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: color(--v-theme-on-surface, 0.06);
  border: 1px dashed color(--v-theme-on-surface, 0.18);
  color: color(--v-theme-on-surface, 0.45);
}

.stage-empty-text {
  font-size: 14px;
}

.thumb {
  display: block;
  width: 150px;
  aspect-ratio: 3 / 2;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  background: none;
  cursor: pointer;
  // The ring is drawn inside the border box so an active thumb doesn't nudge
  // its neighbours along the strip.
  overflow: hidden;
  opacity: 0.6;
  transition: opacity 0.15s ease, border-color 0.15s ease;

  &:hover {
    opacity: 1;
  }

  &.is-active {
    border-color: color(--v-theme-accent);
    opacity: 1;
  }

  @include mobile {
    width: 96px;
  }
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
