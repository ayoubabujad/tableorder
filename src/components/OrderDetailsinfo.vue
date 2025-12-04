<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    persistent
    transition-show="fade"
    transition-hide="fadeout"
    full-width
    @before-show="beforeShow"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ $t("Choose prefered time") }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      {{ transaction_type }}
      {{ whento_deliver }}
      <q-card-section>
        <q-btn-toggle
          v-model="transaction_type"
          toggle-color="warning"
          no-caps
          unelevated
          class="rounded-group"
          :options="SettingStore.settings_data.services_list"
        />

        <q-option-group
          v-model="whento_deliver"
          :options="SettingStore.settings_data.delivery_option"
          color="warning"
          @update:model-value="chooseWhen"
        />

        <div
          class="q-mt-md relative-position"
          v-if="whento_deliver === 'schedule'"
        >
          <q-inner-loading
            :showing="SettingStore.loading_gettimes"
            color="warning"
          ></q-inner-loading>

          <q-select
            :label="$t('Date')"
            stack-label
            v-model="delivery_date"
            transition-show="scale"
            transition-hide="scale"
            :options="SettingStore.delivery_date_list"
            emit-value
            map-options
            @update:model-value="chooseDate"
          />

          <q-select
            :label="$t('Time')"
            stack-label
            v-model="delivery_time"
            transition-show="scale"
            transition-hide="scale"
            :options="
              SettingStore.delivery_time_list[delivery_date]
                ? SettingStore.delivery_time_list[delivery_date]
                : []
            "
            map-options
          />
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          unelevated
          rounded
          color="primary"
          text-color="white"
          no-caps
          class="full-width q-mb-md"
          :label="$t('Save')"
          size="lg"
          @click="saveTransactionInfo"
          :loading="loading"
        >
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";

export default {
  name: "OrderDetailsinfo",
  data() {
    return {
      modal: false,
      loading: false,
      transaction_type: "",
      whento_deliver: "",
      delivery_date: "",
      delivery_time: "",
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  methods: {
    beforeShow() {
      this.loading = true;
      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        this.setForm();
      } else {
        this.$watch(
          () => this.SettingStore.$state.settings_data,
          (newData, oldData) => {
            this.setForm();
          }
        );
      }
    },
    setForm() {
      this.loading = false;
      console.log("setForm");
    },
    async chooseWhen(data) {
      if (data === "schedule") {
        const resp = await this.SettingStore.getDeliveryTimes();
        if (!APIinterface.empty(this.DataStorePersisted.delivery_date)) {
          this.delivery_date = this.DataStorePersisted.delivery_date;
        } else {
          this.delivery_date = resp ? resp : null;
        }
        if (!APIinterface.empty(this.DataStorePersisted.delivery_time)) {
          this.delivery_time = this.DataStorePersisted.delivery_time
            ? this.DataStorePersisted.delivery_time
            : "";
        }
      } else {
        this.delivery_date = "";
        this.delivery_time = "";
      }
    },
    saveTransactionInfo() {
      if (APIinterface.empty(this.transaction_type)) {
        APIinterface.notify(
          "negative",
          this.$t("Please select transaction type"),
          "error_outline",
          this.$q
        );
        return false;
      }
      if (APIinterface.empty(this.whento_deliver)) {
        APIinterface.notify(
          "negative",
          this.$t("Please select when now or schedule for later"),
          "error_outline",
          this.$q
        );
        return false;
      }

      if (this.whento_deliver === "schedule") {
        if (APIinterface.empty(this.delivery_date)) {
          APIinterface.notify(
            "negative",
            this.$t("Please select prefered date"),
            "error_outline",
            this.$q
          );
          return false;
        }
        if (APIinterface.empty(this.delivery_time)) {
          APIinterface.notify(
            "negative",
            this.$t("Please select prefered time"),
            "error_outline",
            this.$q
          );
          return false;
        }
      }
      this.DataStorePersisted.transaction_type = this.transaction_type;
      this.DataStorePersisted.whento_deliver = this.whento_deliver;
      this.DataStorePersisted.delivery_date = this.delivery_date;
      if (!APIinterface.empty(this.delivery_time.value)) {
        this.DataStorePersisted.delivery_time = this.delivery_time.value;
        this.DataStorePersisted.delivery_time_data = this.delivery_time;
      }
      this.modal = false;
      this.SettingStore.formatTransaction();
      this.$emit("afterSavetrans");
    },
  },
};
</script>
