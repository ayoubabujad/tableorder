<template>
  <div
    class="radius10 q-mb-sm"
    :class="{
      'bg-grey600 ': $q.dark.mode,
      'bg-mygrey ': !$q.dark.mode,
    }"
  >
    <q-card-section>
      <div class="text-body2">
        {{ $t("Choose Table") }} <span class="text-red">*</span>
      </div>
      <q-select
        v-model="guest_number"
        color="warning"
        class="q-mb-md"
        transition-show="scale"
        transition-hide="scale"
        :options="guest_options"
        emit-value
        map-options
        :label="$t('Guest')"
        stack-label
      />

      <q-select
        v-model="room_uuid"
        :options="SettingStore.settings_data.room_list"
        @update:model-value="table_uuid = ''"
        :label="$t('Room name')"
        color="warning"
        class="q-mb-md"
        transition-show="scale"
        transition-hide="scale"
        emit-value
        map-options
        stack-label
      />

      <q-select
        v-model="table_uuid"
        :options="SettingStore.settings_data.table_list[room_uuid]"
        :label="$t('Table name')"
        color="warning"
        class="q-mb-md"
        transition-show="scale"
        transition-hide="scale"
        emit-value
        map-options
        stack-label
      />
    </q-card-section>
  </div>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
export default {
  name: "BookingCheckout",
  data() {
    return {
      guest_number: 1,
      guest_options: [],
      room_uuid: "",
      table_uuid: "",
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  mounted() {
    this.guest_options = [];
    for (let i = 1; i < 20; i++) {
      this.guest_options.push(i);
    }
  },
};
</script>
