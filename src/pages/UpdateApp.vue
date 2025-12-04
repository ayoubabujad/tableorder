<template>
  <q-page class="q-pl-md q-pr-md flex flex-center">
    <div class="full-width text-center">
      <q-img
        src="update.png"
        style="height: 150px; width: 150px"
        loading="lazy"
        fit="cover"
        class="radius8"
      >
        <template v-slot:loading>
          <q-skeleton height="150px" width="150px" square class="bg-grey-2" />
        </template>
      </q-img>

      <q-space class="q-pa-sm"></q-space>
      <div class="text-body1 text-weight-bold">
        {{ app_name }}
      </div>
      <div class="text-caption">
        {{ $t("To continue to use the app, download the latest version") }}
      </div>
      <q-space class="q-pa-sm"></q-space>

      <q-btn
        :label="$t('Update')"
        no-caps
        target="_blank"
        size="lg"
        color="primary"
        unelevated
        rounded
        style="min-width: 180px"
        :href="update_url"
      />
    </div>
  </q-page>
</template>

<script>
// PWA-only: App updates are automatic via service worker
import { useSettingStore } from "src/stores/SettingStore";

export default {
  name: "UpdateApp",
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  data() {
    return {
      page_ready: false,
      app_name: null,
      app_update: null,
      update_url: null,
    };
  },
  mounted() {
    if (this.$q.capacitor) {
      this.getApp();
    }
    this.app_update = this.SettingStore.settings_data?.app_update ?? null;
    if (!this.app_update) {
      return;
    }
    if (this.$q.platform.is.android) {
      this.update_url = this.app_update?.android_download_url;
    } else {
      this.update_url = this.app_update?.ios_download_url;
    }
  },
  methods: {
    async getApp() {
      try {
        let result = await App.getInfo();
        this.app_name = result?.name;
      } catch (error) {
      } finally {
      }
    },
  },
};
</script>
