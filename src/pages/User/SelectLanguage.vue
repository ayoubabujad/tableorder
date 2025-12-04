<template>
  <q-page class="modern-page">
    <!-- 🎨 Animated Background -->
    <div class="modern-gradient-bg"></div>

    <!-- 🔙 Back Button -->
    <div class="modern-back-btn">
      <q-btn
        @click="$router.back()"
        round
        size="md"
        icon="arrow_back"
        class="btn-glass shadow-soft"
      />
    </div>

    <!-- 🌐 Language Selection Card -->
    <div class="modern-container">
      <div class="modern-card q-pa-lg" style="width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;">
        <!-- ✨ Welcome Header -->
        <div class="text-center q-mb-lg">
          <div class="modern-welcome-icon">
            <div class="icon-wrapper">
              <q-icon name="language" size="60px" color="white" />
            </div>
          </div>
          <div class="text-h5 text-weight-bold text-dark q-mb-xs">
            {{ $t("Select Language") }}
          </div>
          <div class="text-body2 text-grey-7">
            {{ $t("Choose your preferred language") }}
          </div>
        </div>

        <!-- 📱 Loading State -->
        <template v-if="!page_ready">
          <div class="text-center q-py-xl">
            <q-spinner-dots size="50px" color="accent-vibrant" />
            <div class="text-body2 text-grey-7 q-mt-md">
              {{ $t("Loading languages...") }}
            </div>
          </div>
        </template>

        <!-- 🌍 Language List -->
        <template v-else>
          <div class="modern-language-list">
            <template
              v-for="items in SettingStore.settings_data.language_list.list"
              :key="items"
            >
              <div
                class="modern-language-item"
                :class="{ 'selected': language === items.code }"
                @click="language = items.code"
              >
                <div class="item-content">
                  <div class="flag-container">
                    <q-img
                      :src="items.flag_url"
                      class="flag-image"
                      loading="lazy"
                    >
                      <template v-slot:loading>
                        <q-skeleton class="flag-skeleton" />
                      </template>
                    </q-img>
                  </div>
                  <div class="language-info">
                    <div class="language-title">{{ items.title }}</div>
                    <div class="language-description">{{ items.description }}</div>
                  </div>
                  <div class="selection-indicator">
                    <q-icon
                      :name="language === items.code ? 'check_circle' : 'radio_button_unchecked'"
                      :color="language === items.code ? 'accent-vibrant' : 'grey-5'"
                      size="24px"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- 🚀 Action Buttons -->
          <div class="action-buttons">
            <q-btn
              size="lg"
              rounded
              unelevated
              no-caps
              class="full-width q-mb-sm modern-btn-secondary"
              to="/welcome"
            >
              <q-icon name="skip_next" size="20px" class="q-mr-xs" />
              <div class="text-weight-bold text-body2">{{ $t("Skip") }}</div>
            </q-btn>

            <q-btn
              size="lg"
              rounded
              unelevated
              no-caps
              class="full-width modern-btn-primary"
              @click="setLanguage"
              :disabled="!language"
            >
              <div class="text-weight-bold text-body1">{{ $t("Save") }}</div>
              <q-icon name="arrow_forward" size="20px" class="q-ml-sm" />
            </q-btn>
          </div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useI18n } from "vue-i18n";
import { api } from "boot/axios";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "SelectLanguage",
  data() {
    return {
      language: "",
      page_ready: false,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.page_ready = true;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.page_ready = true;
        }
      );
    }
  },
  methods: {
    setLanguage() {
      this.DataStorePersisted.app_language = this.language;
      this.$i18n.locale = this.language;
      api.defaults.params = {};
      api.defaults.params["language"] = this.$i18n.locale;

      this.SettingStore.getSettings();
      APIinterface.setStorage("single_intro", 1);
      this.$router.push("/welcome");
    },
  },
};
</script>
