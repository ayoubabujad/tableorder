<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          appear
          :duration="300"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";

export default {
  name: "NotopfooterLayout",
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  mounted() {
    this.$watch(
      () => this.DataStore.$state.receive_event,
      (newData, oldData) => {
        this.handleReceiveEvent(newData);
      }
    );
  },
  methods: {
    handleReceiveEvent(data) {
      const notification_type = data?.notification_type ?? null;
      if (notification_type == "chat-message") {
        this.DataStore.PlayAudio("chat");
        const currentCount = parseInt(this.DataStorePersisted.chat_count);
        this.DataStorePersisted.chat_count =
          currentCount > 0 ? currentCount + 1 : 1;
      } else {
        this.DataStore.PlayAudio("notify");
        const currentCount = parseInt(this.DataStorePersisted.alert_count);
        this.DataStorePersisted.alert_count =
          currentCount > 0 ? currentCount + 1 : 1;
      }
    },
  },
};
</script>
