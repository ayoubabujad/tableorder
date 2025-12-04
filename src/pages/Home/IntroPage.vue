<template>
  <q-page padding class="login-page text-white flex flex-center">
    <q-inner-loading
      :showing="SettingStore.loading"
      :color="$q.dark.mode ? 'grey300' : 'primary'"
    />
  </q-page>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import auth from "src/api/auth";

export default {
  name: "IntroPage",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  watch: {
    DataStorePersisted: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (!newValue.loading) {
          this.nextPage();
        }
      },
    },
  },
  methods: {
    nextPage() {
      if (this.SettingStore.settings_data.enabled_language) {
        this.$router.push("/select-language");
      } else {
        if (auth.authenticated()) {
          this.$router.push("/home");
        } else {
          this.$router.push("/welcome");
        }
      }
    },
  },
};
</script>
