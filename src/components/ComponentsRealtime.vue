<template>
  <div>
    <!-- <pre>{{ SettingStore.realtime_data }}</pre> -->
  </div>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import Pusher from "pusher-js";
import auth from "src/api/auth";

export default {
  name: "ComponentsRealtime",
  props: ["getevent"],
  data() {
    return {
      data: [],
      pusher: null,
      channel: null,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.initPusher();
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.initPusher();
        }
      );
    }
  },
  methods: {
    initPusher() {
      if (
        auth.authenticated() &&
        this.SettingStore.settings_data.pusher_data.realtime_app_enabled
      ) {
        let user = auth.getUser();
        this.pusher = new Pusher(
          this.SettingStore.settings_data.pusher_data.pusher_key,
          {
            cluster: this.SettingStore.settings_data.pusher_data.pusher_cluster,
          }
        );
        this.channel = this.pusher.subscribe(user.client_uuid);
        this.channel.bind_global(this.handlePusherEvent);
      }
    },
    handlePusherEvent(eventName, data) {
      console.log(`Received Pusher event '${eventName}':`, data);
      console.log("eventName", eventName);
      if (eventName != "pusher:subscription_succeeded") {
        this.SettingStore.realtime_data = {
          event: eventName,
          data: data,
        };
      }
    },
  },
  beforeUnmount() {
    if (this.pusher) {
      let user = auth.getUser();
      this.pusher.unsubscribe(user.client_uuid);
      this.pusher.disconnect();
    }
  },
};
</script>
