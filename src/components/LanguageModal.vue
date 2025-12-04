<template>
  <q-dialog v-model="show" position="bottom">
    <q-card class="language-modal">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ $t("Language") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-list>
          <q-item
            v-for="item in languages"
            :key="item.code"
            clickable
            v-ripple
            class="language-item"
            :class="{ selected: selected === item.code }"
            @click="selectLanguage(item.code)"
          >
            <q-item-section avatar>
              <q-img
                :src="item.flag_url"
                width="32px"
                height="24px"
                class="rounded-borders"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.title }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                v-if="selected === item.code"
                name="check_circle"
                color="primary"
                size="24px"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { api } from "src/boot/axios";
import { useRouter } from "vue-router";

export default {
  name: "LanguageModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const $q = useQuasar();
    const router = useRouter();
    const { locale } = useI18n({ useScope: "global" });
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();

    const show = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    const selected = ref(DataStorePersisted.app_language || "en");

    const languages = computed(() => {
      return SettingStore.settings_data?.language_list?.list || [];
    });

    const setRTL = (code) => {
      const langList = SettingStore.settings_data?.language_list?.list;
      if (langList && Object.keys(langList).length > 0) {
        Object.entries(langList).forEach(([key, items]) => {
          if (code === items.code) {
            if (items.rtl == 1) {
              $q.lang.set({ rtl: true });
              DataStorePersisted.rtl = true;
              document.documentElement.setAttribute("dir", "rtl");
              document.body.setAttribute("dir", "rtl");
            } else {
              $q.lang.set({ rtl: false });
              DataStorePersisted.rtl = false;
              document.documentElement.setAttribute("dir", "ltr");
              document.body.setAttribute("dir", "ltr");
            }
          }
        });
      }
    };

    const selectLanguage = async (code) => {
      selected.value = code;
      DataStorePersisted.app_language = code;
      locale.value = code;

      // Update API language param
      api.defaults.params = {};
      api.defaults.params["language"] = code;

      // Set RTL
      setRTL(code);

      // Refresh settings and navigate
      await SettingStore.getSettings();
      SettingStore.formatTransaction();

      show.value = false;
      router.push("/home");
    };

    return {
      show,
      selected,
      languages,
      selectLanguage,
    };
  },
};
</script>

<style scoped>
.language-modal {
  width: 100%;
  max-width: 400px;
  border-radius: 20px 20px 0 0;
}

.language-item {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.language-item:hover {
  background: rgba(59, 130, 246, 0.05);
}

.language-item.selected {
  background: rgba(59, 130, 246, 0.1);
}
</style>
