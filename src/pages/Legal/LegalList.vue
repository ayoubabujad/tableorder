<template>
  <q-pull-to-refresh @refresh="refresh">
    <!-- 🎨 Theme Header -->
    <q-header class="ht-header">
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          class="ht-btn-ghost"
        />
        <q-toolbar-title class="text-weight-bold text-white">{{
          $t("Legal")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="ht-page q-pa-md">
      <template v-if="SettingStore.loading">
        <q-inner-loading color="primary" showing="true"></q-inner-loading>
      </template>
      <template v-else>
        <template
          v-for="(items, index) in SettingStore.settings_data.legal_menu"
          :key="items"
        >
          <div
            class="ht-list-item"
            @click="$router.push({ path: 'legal/page', query: { page_id: index } })"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center q-gutter-md">
                <div class="ht-icon-box">
                  <q-icon name="o_description" size="24px" />
                </div>
                <div class="text-weight-medium ht-text-primary">{{ items }}</div>
              </div>
              <q-icon name="chevron_right" class="ht-text-secondary" />
            </div>
          </div>
        </template>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "LegalList",
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  methods: {
    async refresh(done) {
      await this.SettingStore.getSettings();
      done();
    },
  },
};
</script>
