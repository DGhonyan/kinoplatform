<template>
  <div class="project-card">
    <div class="project-media">
      <img
        v-if="project.media"
        :src="project.media"
        alt=""
        class="media-img"
      >
      <img
        v-else
        :src="placeholderSrc"
        alt=""
        class="media-placeholder"
      >
    </div>

    <div class="project-body">
      <!-- Name + type/role each clamp to 2 lines with an ellipsis; the full value
           is available in a hover tooltip. -->
      <v-tooltip
        :text="project.name"
        location="top"
        open-delay="200"
      >
        <template #activator="{ props: tip }">
          <h3
            v-bind="tip"
            class="project-name"
          >
            {{ project.name }}
          </h3>
        </template>
      </v-tooltip>

      <v-tooltip
        v-if="typeRole"
        :text="typeRole"
        location="top"
        open-delay="200"
      >
        <template #activator="{ props: tip }">
          <span
            v-bind="tip"
            class="project-typerole"
          >
            {{ typeRole }}
          </span>
        </template>
      </v-tooltip>

      <span
        v-if="yearLine"
        class="project-year"
      >
        {{ yearLine }}
      </span>

      <!-- align-self keeps the hit area on the text, not the full card width. -->
      <a
        v-if="project.link"
        class="project-link"
        :href="project.link"
        target="_blank"
      >
        {{ $t('profile_project_link') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Project } from '~~/shared/types/user';

/**
 * Fixed-size project card (218×397): a 218×255 media box up top — the uploaded
 * image cover-fit, or a clapperboard-on-gray placeholder when none — then the
 * name, a "type | role" line, the release year (italic, or "In progress"), and
 * an optional link pinned to the bottom.
 */
const props = defineProps<{
  project: Project;
}>();

const { t } = useI18n();

const placeholderSrc = new URL('@/assets/project-media-placeholder.svg', import.meta.url).href;
// "Short Film | Director" — production type(s) and role(s), each comma-joined.
const typeRole = computed(() => {
  const p = props.project;
  const types = (p.type ?? []).map(x => t(x)).join(', ');
  const roles = (p.position ?? []).map(x => t(x)).join(', ');
  return [types, roles].filter(Boolean).join(' | ');
});

const yearLine = computed(() =>
  props.project.workInProgress ? t('profile_in_progress') : (props.project.year ?? ''),
);
</script>

<style scoped lang="scss">
.project-card {
  // Fixed size; `flex: none` keeps it from stretching inside the flex-wrap grid.
  flex: 0 0 auto;
  width: 218px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-media {
  flex: 0 0 255px;
  width: 100%;
  height: 255px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  // Gray backdrop behind the placeholder (and any letterboxing).
  background-color: #454545;
}

// Uploaded media: fill the box, cropped but never distorted.
.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// No media: the clapperboard, centered and large on the gray backdrop.
.media-placeholder {
  width: 85%;
  height: auto;
}

.project-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 24px 12px 0;
  overflow: hidden;
}

// Name: up to two lines, then an ellipsis (full value lives in the tooltip).
// Sizes below are budgeted so name(2 lines) + type|role + year + link all fit
// the ~118px body — otherwise the card's overflow eats the bottom rows.
.project-name {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.2;
  // Break long unbreakable strings (URLs, single long words) instead of spilling.
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Type | role: one line + ellipsis. Single-line truncation is bulletproof
// (unlike -webkit-line-clamp) and metadata rarely needs a second line.
.project-typerole {
  font-size: 15px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-year {
  font-size: 14px;
  line-height: 1.3;
  font-style: italic;
  opacity: 0.7;
}

.project-link {
  // Pinned to the bottom (mockup); align-self shrinks the box to the text so the
  // clickable hit area is the link itself, not the full card width.
  margin-top: auto;
  align-self: flex-start;
  font-size: 14px;
  line-height: 1.3;
  color: color(--v-theme-on-surface, 0.45);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
