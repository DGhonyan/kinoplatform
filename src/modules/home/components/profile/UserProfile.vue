<template>
  <div class="user-profile">
    <div class="left">
      <div class="profile-header">
        <div v-if="user?.avatar" class="avatar-section">
          <img :src="getUserAvatar()" alt="User Avatar" class="user-avatar" />
        </div>
        <div class="personal-info">
          <div class="name-section">
            <span class="name">{{ user?.first_name }} {{ user?.last_name }}</span>
            <v-btn 
              v-if="canEdit"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-pencil"
              @click="openEditProfileDialog"
            >
              {{ $t('profile_edit_profile') }}
            </v-btn>
          </div>
          <span class="profession">{{ user?.profession.map(profession => $t(profession)).join(', ') }}</span>
        </div>
      </div>
      <div class="bio">
        <span class="bio-title">{{ $t('common_bio') }}</span>
        <span class="bio-content">{{ user?.bio || $t('profile_no_bio') }}</span>
      </div>

      <div v-if="user?.portfolio" class="portfolio">
        <a :href="user?.portfolio" target="_blank">{{ $t('common_portfolio_link') }}</a>
      </div>
    </div>
    <div class="right">
      <span class="projects-title">{{ $t('common_projects') }}</span>
      <div v-if="user?.projects && user?.projects.length > 0" class="projects">
  
        <div class="project-item" v-for="project in user?.projects" :key="project.name">
          <a :href="project.link" target="_blank">{{ project.name }} - {{ project.year }}</a>
        </div>
      </div>
      <div v-else class="no-projects">
        <span class="no-projects-title">{{ $t('profile_no_projects') }}</span>
      </div>

      <div class="availability-section">
        <div class="availability-header">
          <span class="availability-title">{{ $t('profile_availability') }}</span>
          <v-btn 
            v-if="canEdit" 
            size="small" 
            color="primary"
            @click="openAvailabilityDialog"
          >
            {{ hasAvailability ? $t('profile_edit_availability') : $t('profile_add_availability') }}
          </v-btn>
        </div>

        <div v-if="hasAvailability" class="calendar-wrapper">
          <div class="calendar-controls">
            <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="previousMonth" />
            <span class="calendar-month-display">{{ formatMonthYear(focusedDate) }}</span>
            <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextMonth" />
            <v-btn 
              size="small" 
              variant="text" 
              @click="goToToday"
              class="today-btn"
            >
              {{ $t('common_today') }}
            </v-btn>
          </div>
          <v-calendar
            v-model="calendarDate"
            :events="calendarEvents"
            :view-mode="calendarView"
            @click:event="onEventClick"
          />
        </div>
        <div v-else class="no-availability">
          <span>{{ canEdit ? $t('profile_availability_description') : $t('profile_no_availability_information_added') }}</span>
        </div>
      </div>
    </div>

    <v-dialog v-model="showAvailabilityDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ $t('profile_manage_availability') }}</span>
        </v-card-title>
        <v-card-text>
          <v-form class="availability-form">
            <Input
              v-model="newAvailability.title"
              label="common_title"
              required
              :error-messages="titleError"
              @update:model-value="titleError = ''"
            />
            <v-row>
              <v-col cols="6">
                <Input
                  v-model="newAvailability.start_date"
                  label="common_start_date"
                  type="date"
                  required
                  :error-messages="startDateError"
                  @update:model-value="onStartDateChange"
                />
              </v-col>
              <v-col cols="6">
                <Input
                  v-model="newAvailability.end_date"
                  label="common_end_date"
                  type="date"
                  required
                  :error-messages="endDateError"
                  @update:model-value="endDateError = ''"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <Input
                  v-model="newAvailability.start_time"
                  label="profile_start_time"
                  type="time"
                />
              </v-col>
              <v-col cols="6">
                <Input
                  v-model="newAvailability.end_time"
                  label="profile_end_time"
                  type="time"
                />
              </v-col>
            </v-row>
            <v-select
              v-model="newAvailability.color"
              :label="$t('common_color')"
              :items="colorOptions"
              variant="outlined"
              hide-details
            />
          </v-form>

          <div v-if="userEvents.length > 0" class="existing-availability">
            <h4>{{ $t('profile_current_availability') }}</h4>
            <div v-for="event in validUserEvents" :key="event._id" class="availability-item">
              <div class="availability-item-info">
                <span class="availability-date">
                  {{ formatDate(event.start_date) }}
                  <template v-if="event.start_date !== event.end_date">
                    - {{ formatDate(event.end_date) }}
                  </template>
                </span>
                <span class="availability-title">{{ event.title }}</span>
                <span v-if="event.start_time && event.end_time" class="availability-time">
                  {{ event.start_time }} - {{ event.end_time }}
                </span>
              </div>
              <v-btn
                size="small"
                color="error"
                variant="text"
                icon="mdi-delete"
                @click="removeAvailability(event._id!)"
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="closeAvailabilityDialog">Cancel</v-btn>
          <v-btn color="primary" variant="text" @click="addAvailability">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditProfileDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ $t('profile_edit_profile') }}</span>
        </v-card-title>
        <v-card-text>
          <div class="edit-profile-form">
            <FileUpload
              label="common_profile_photo"
              accept="image/*"
              placeholder="personal_info_upload_photo"
              helper-text="personal_info_upload_photo_helper_text"
              v-model="editAvatarBlobName"
            />

            <v-textarea
              v-model="editBioValue"
              :label="$t('common_bio')"
              variant="outlined"
              rows="4"
            />

            <v-select
              v-model="editProfessionsValue"
              :label="$t('common_professions')"
              :items="professionOptions"
              variant="outlined"
              multiple
              chips
              closable-chips
              :error-messages="editProfessionsError"
            />

            <AddProject :projects="editProjectsValue" @update:projects="updateProjects" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="closeEditProfileDialog">{{ $t('common_cancel') }}</v-btn>
          <v-btn color="primary" variant="text" @click="saveProfile">{{ $t('common_save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import { useEventStore } from '@/stores/event';
import { useFileStore } from '@/stores/file';
import { onMounted, ref, computed, watch } from 'vue';
import type { User, Event, PersonalInfoProject } from '@/types/user';
import { useUserStore } from '@/stores/user';
import Input from '@/components/Input.vue';
import FileUpload from '@/components/FileUpload.vue';
import AddProject from './AddProject.vue';
import { useI18n } from 'vue-i18n';
import { professions } from '@/common/constants';

const { t } = useI18n();

const props = defineProps<{
  userId: string | undefined;
}>();

const authStore = useAuthStore();
const { getUser } = authStore;

const userStore = useUserStore();
const { getUserById } = userStore;

const eventStore = useEventStore();
const { createEvent, getEventsByUserId, deleteEvent } = eventStore;

const fileStore = useFileStore();

const user = ref<User | null>(null);
const userEvents = ref<Event[]>([]);

const canEdit = computed(() => {
  const currentUser = getUser();
  return user.value?._id === currentUser?._id;
});

const showAvailabilityDialog = ref(false);
const calendarView = ref('month');
const focusedDate = ref<Date | string | string[]>(new Date());

const normalizeDate = (date: Date | string | string[]): Date => {
  if (date instanceof Date) return date;
  if (Array.isArray(date)) return new Date(date[0] || new Date());
  if (typeof date === 'string') return new Date(date);
  return new Date();
};

const calendarDate = computed({
  get: () => normalizeDate(focusedDate.value),
  set: (value) => { focusedDate.value = value; },
});

const newAvailability = ref<Omit<Event, '_id' | 'user_id'>>({
  start_date: '',
  end_date: '',
  title: '',
  color: 'primary',
  start_time: '',
  end_time: '',
});

const titleError = ref('');
const startDateError = ref('');
const endDateError = ref('');

const showEditProfileDialog = ref(false);
const editBioValue = ref('');
const editProfessionsValue = ref<string[]>([]);
const editProjectsValue = ref<PersonalInfoProject[]>([]);
const editProfessionsError = ref('');
const editAvatarBlobName = ref('');

const colorOptions = computed(() => [
  { title: t('common_primary'), value: 'primary' },
  { title: t('common_success'), value: 'success' },
  { title: t('common_warning'), value: 'warning' },
  { title: t('common_error'), value: 'error' },
  { title: t('common_info'), value: 'info' },
]);

const hasAvailability = computed(() => {
  return userEvents.value.length > 0;
});

const validUserEvents = computed(() => {
  return userEvents.value.filter(event => 
    event.start_date && event.end_date && event.title
  );
});

const professionOptions = computed(() => professions.value.map(profession => ({ title: t(profession), value: profession })));

const calendarEvents = computed(() => {
  return userEvents.value
    .filter(event => event.start_date && event.end_date)
    .map(event => {
      const startDateTime = event.start_time 
        ? `${event.start_date}T${event.start_time}` 
        : event.start_date;
      const endDateTime = event.end_time 
        ? `${event.end_date}T${event.end_time}` 
        : event.end_date;
      
      return {
        title: event.title,
        start: startDateTime,
        end: endDateTime,
        color: event.color || 'primary',
      };
    });
});

const getUserAvatar = () => {
  if (user.value?.avatar) {
    return fileStore.composeFileUrl(user.value.avatar);
  }
  return new URL(`@/assets/default.jpg`, import.meta.url).href;
};

const fetchUserEvents = async (userId: string) => {
  try {
    const events = await getEventsByUserId(userId);
    userEvents.value = events;
  } catch (error) {
    console.error('Failed to fetch user events', error);
    userEvents.value = [];
  }
};

const onStartDateChange = (value: string) => {
  startDateError.value = '';
  
  // Auto-set end_date to start_date if empty
  if (!newAvailability.value.end_date) {
    newAvailability.value.end_date = value;
  }
  
  // Validate date range
  if (newAvailability.value.end_date && newAvailability.value.end_date < value) {
    endDateError.value = 'End date must be after or equal to start date';
  } else {
    endDateError.value = '';
  }
};

const validateForm = (): boolean => {
  let isValid = true;
  
  if (!newAvailability.value.title) {
    titleError.value = t('common_this_field_is_required');
    isValid = false;
  }
  
  if (!newAvailability.value.start_date) {
    startDateError.value = t('common_this_field_is_required');
    isValid = false;
  }
  
  if (!newAvailability.value.end_date) {
    endDateError.value = t('common_this_field_is_required');
    isValid = false;
  }
  
  if (newAvailability.value.start_date && newAvailability.value.end_date) {
    if (newAvailability.value.end_date < newAvailability.value.start_date) {
      endDateError.value = t('common_end_date_must_be_after_or_equal_to_start_date');
      isValid = false;
    }
  }

  return isValid;
};

const openAvailabilityDialog = () => {
  showAvailabilityDialog.value = true;
};

const closeAvailabilityDialog = () => {
  showAvailabilityDialog.value = false;
  resetNewAvailability();
};

const resetNewAvailability = () => {
  newAvailability.value = {
    start_date: '',
    end_date: '',
    title: '',
    color: 'primary',
    start_time: '',
    end_time: '',
  };
  titleError.value = '';
  startDateError.value = '';
  endDateError.value = '';
};

const addAvailability = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await createEvent(newAvailability.value);
    await fetchUserEvents(user.value!._id);
    closeAvailabilityDialog();
  } catch (error) {
    console.error('Failed to add availability', error);
  }
};

const removeAvailability = async (eventId: string) => {
  try {
    await deleteEvent(eventId);
    await fetchUserEvents(user.value!._id);
  } catch (error) {
    console.error('Failed to remove availability', error);
  }
};

const openEditProfileDialog = () => {
  editBioValue.value = user.value?.bio || '';
  editProfessionsValue.value = [...(user.value?.profession || [])];
  editProjectsValue.value = user.value?.projects ? JSON.parse(JSON.stringify(user.value.projects)) : [];
  editAvatarBlobName.value = '';
  showEditProfileDialog.value = true;
};

const closeEditProfileDialog = () => {
  showEditProfileDialog.value = false;
  editProfessionsError.value = '';
  editAvatarBlobName.value = '';
};

const updateProjects = (newProjects: PersonalInfoProject[]) => {
  editProjectsValue.value = newProjects;
};

const saveProfile = async () => {
  editProfessionsError.value = '';

  if (editProfessionsValue.value.length === 0) {
    editProfessionsError.value = t('common_this_field_is_required');
    return;
  }

  try {
    await userStore.updateUser({
      bio: editBioValue.value,
      profession: editProfessionsValue.value,
      projects: editProjectsValue.value,
      avatar: editAvatarBlobName.value || undefined,
    });

    user.value = getUser();
    closeEditProfileDialog();
  } catch (error) {
    console.error('Failed to update profile', error);
  }
};

const onEventClick = (event: any) => {
  console.log('Event clicked:', event);
};

const formatDate = (date?: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatMonthYear = (date: Date | string | string[]) => {
  return normalizeDate(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
};

const previousMonth = () => {
  const currentDate = normalizeDate(focusedDate.value);
  currentDate.setMonth(currentDate.getMonth() - 1);
  focusedDate.value = currentDate;
};

const nextMonth = () => {
  const currentDate = normalizeDate(focusedDate.value);
  currentDate.setMonth(currentDate.getMonth() + 1);
  focusedDate.value = currentDate;
};

const goToToday = () => {
  focusedDate.value = new Date();
};

const loadUserData = async () => {
  const currentUser = getUser();

  try {
    if (props.userId && props.userId !== currentUser?._id) {
      const userData = await getUserById(props.userId);
      user.value = userData as User;
      await fetchUserEvents(props.userId);
    }
    else {
      user.value = currentUser as User;
      await fetchUserEvents(currentUser!._id);
    }
  } catch (error) {
    console.error('Failed to get user by id', error);
  }
};

onMounted(() => {
  loadUserData();
});

watch(() => props.userId, () => {
  loadUserData();
});
</script>

<style scoped lang="scss">
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.left, .right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.portfolio {
  a {
    text-decoration: none;
    color: color(--v-theme-primary);
  }
}

.profile-header {
  display: flex;
  gap: 24px;
  align-items: center;
}

.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(var(--v-theme-primary), 0.2);
}

.personal-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.name-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.name {
  font-size: 32px;
  font-weight: 500;
  color: color(--v-theme-gray);
}

.profession {
  font-size: 14px;
  color: color(--v-theme-primary);
}

.bio {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bio-title, .projects-title, .availability-title {
  font-size: 24px;
  font-weight: 500;
  color: color(--v-theme-gray);
}

.bio-content {
  font-size: 14px;
  color: color(--v-theme-gray);
}

.projects {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-projects-title {
  color: color(--v-theme-gray);
}

.project-item {
  display: flex;
  border-bottom: 1px solid color(--v-theme-primary);
  width: fit-content;
  color: color(--v-theme-primary);
  cursor: pointer;
  gap: 8px;

  a {
    text-decoration: none;
    color: color(--v-theme-primary);
  }
}

.availability-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
}

.availability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.calendar-month-display {
  font-size: 18px;
  font-weight: 500;
  color: color(--v-theme-gray);
  min-width: 180px;
  text-align: center;
}

.today-btn {
  margin-left: auto;
}

.no-availability {
  padding: 24px;
  text-align: center;
  color: color(--v-theme-gray);
  font-size: 14px;
  border: 1px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 8px;
}

.availability-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.existing-availability {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h4 {
    font-size: 16px;
    font-weight: 500;
    color: color(--v-theme-gray);
  }
}

.availability-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 4px;
}

.availability-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.availability-date {
  font-weight: 500;
  color: color(--v-theme-primary);
}

.availability-title {
  font-size: 14px;
  color: color(--v-theme-gray);
}

.availability-time {
  font-size: 12px;
  color: color(--v-theme-gray);
  opacity: 0.7;
}

.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>