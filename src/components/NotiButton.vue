<template>
  <q-btn
    v-if="SettingStore.settings_data?.chat_enabled"
    dense
    flat
    unelevated
    :color="$q.dark.mode ? 'grey' : 'primary'"
    round
    icon="eva-message-circle-outline"
    size="lg"
    @click="toChat"
  >
    <transition
      v-if="hasChat"
      appear
      enter-active-class="animated zoomIn"
      leave-active-class="animated zoomOut"
    >
      <q-badge color="red" rounded />
    </transition>
  </q-btn>

  <q-btn
    dense
    flat
    unelevated
    :color="$q.dark.mode ? 'grey' : 'primary'"
    round
    icon="notifications"
    @click="toNotification"
    size="lg"
  >
    <transition
      v-if="hasAlert"
      appear
      enter-active-class="animated zoomIn"
      leave-active-class="animated zoomOut"
    >
      <q-badge color="red" rounded />
    </transition>
  </q-btn>

  <q-btn
    dense
    flat
    unelevated
    :color="$q.dark.mode ? 'grey' : 'primary'"
    round
    icon="eva-heart-outline"
    size="lg"
    to="/account/favorites"
  />
</template>

<script>
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
import { useSettingStore } from "src/stores/SettingStore";

export default {
  name: "NotiButton",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    return { DataStorePersisted, SettingStore, DataStore };
  },
  computed: {
    hasAlert() {
      return this.DataStorePersisted.alert_count > 0 ? true : false;
    },
    hasChat() {
      return this.DataStorePersisted.chat_count > 0 ? true : false;
    },
  },
  methods: {
    toNotification() {
      this.DataStorePersisted.alert_count = 0;
      this.$router.push("/notifications");
    },
    toChat() {
      this.DataStorePersisted.chat_count = 0;
      const meta_data = this.DataStore.receive_event?.meta_data ?? null;
      if (meta_data) {
        this.$router.push({
          path: "/account/chat/conversation",
          query: { conversation_id: meta_data?.conversation_id },
        });
        this.DataStore.receive_event = null;
      } else {
        this.$router.push("/account/chat");
      }
    },
  },
};
</script>
