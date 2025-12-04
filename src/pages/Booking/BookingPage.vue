<template>
  <q-header
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'grey' : 'mygrey'"
        :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
      />
      <q-toolbar-title class="text-weight-bold">{{
        $t("Table reservations")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <LoadingData v-if="loading" page="1"></LoadingData>

    <q-form v-else @submit="onSubmit" class="q-gutter-y-md">
      <q-select
        v-model="guest"
        :options="data?.guest_list"
        :label="$t('Guest')"
        @update:model-value="Gettimeslot()"
        transition-show="scale"
        transition-hide="scale"
        emit-value
        map-options
        :rules="[(val) => (val && val > 0) || $t('This field is required')]"
        hide-bottom-space
        behavior="menu"
      />

      <q-select
        v-model="reservation_date"
        :options="data?.date_list"
        @update:model-value="Gettimeslot()"
        :label="$t('Date')"
        transition-show="scale"
        transition-hide="scale"
        emit-value
        map-options
        behavior="menu"
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
        hide-bottom-space
      />

      <div class="text-weight-bold text-body2">
        {{ $t("Select Time Slot") }}
      </div>

      <template v-for="items in data?.time_slot" :key="items">
        <div class="flex q-gutter-x-md q-gutter-y-sm">
          <template v-for="(item, index) in items" :key="item">
            <q-btn
              unelevated
              class="border-grey radius8 myshadow"
              :class="getColor(index)"
              :color="getColor(index)"
              :text-color="getTextColor(index)"
              @click="reservation_time = index"
              :disabled="isNotavailable(index)"
              >{{ item }}</q-btn
            >
          </template>
        </div>
      </template>

      <div v-if="data?.allowed_choose_table">
        <q-select
          v-model="room_id"
          :options="data?.room_list"
          @update:model-value="fetchTableList"
          :label="$t('Room name')"
          transition-show="scale"
          transition-hide="scale"
          emit-value
          map-options
          :rules="[(val) => (val && val > 0) || $t('This field is required')]"
        />
        <q-select
          v-model="table_id"
          :options="getTablelist ? getTablelist[room_id] ?? [] : []"
          :label="$t('Table name')"
          transition-show="scale"
          transition-hide="scale"
          emit-value
          map-options
          :rules="[(val) => (val && val > 0) || $t('This field is required')]"
        />
      </div>

      <q-input
        v-model="special_request"
        :label="$t('Special request')"
        autogrow
      />

      <div v-if="data?.tc" class="q-mb-lg q-mt-lg">
        <div class="text-weight-bold text-subtitle2">
          {{ $t("Restaurant Terms & Conditions") }}
        </div>
        <div class="text-body2" v-html="data?.tc"></div>
      </div>

      <div
        v-if="SettingStore.settings_data.booking_enabled_capcha"
        class="q-pl-md q-pr-md"
      >
        <componentsRecaptcha
          ref="recapcha"
          :sitekey="SettingStore.settings_data.captcha_site_key"
          is_enabled="1"
          :language_code="SettingStore.settings_data.captcha_lang"
          size="normal"
          theme="light"
          :tabindex="0"
          @verify="recaptchaVerified"
          @expire="recaptchaExpired"
          @fail="recaptchaFailed"
        />
        <q-space class="q-pa-md"></q-space>
      </div>

      <q-footer class="bg-white q-pa-md box-shadow0">
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          rounded
          class="fit"
          type="submit"
          :loading="loading2"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Reserve") }}
          </div>
        </q-btn></q-footer
      >
    </q-form>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "src/stores/SettingStore";

export default {
  name: "BookingPage",
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  data() {
    return {
      data: null,
      guest: 1,
      reservation_date: "",
      reservation_time: "",
      special_request: "",
      loading: false,
      loading2: false,
      room_id: "",
      table_id: "",
      table_list: null,
      recaptcha_response: null,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  mounted() {
    this.fetchBookingSettings();
  },
  computed: {
    getTimeUnavailable() {
      return this.data?.not_available_time || null;
    },
    getTablelist() {
      return this.table_list || null;
    },
  },
  watch: {
    reservation_time(newval, oldval) {
      this.fetchTableList();
    },
  },
  methods: {
    recaptchaExpired() {
      if (this.$refs.recapcha) {
        this.$refs.recapcha.reset();
      }
    },
    recaptchaFailed() {},
    recaptchaVerified(response) {
      this.recaptcha_response = response;
    },
    async fetchBookingSettings() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          merchant_uuid: this.SettingStore.merchant_uuid,
        }).toString();
        const response = await APIinterface.fetchGetBooking(
          `Attributes?${params}`
        );
        this.data = response.details;
        this.guest = response.details?.default_guest || 0;
        this.reservation_date = response.details?.default_date || "";
        this.fetchTableList();
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    async Gettimeslot() {
      try {
        this.reservation_time = "";
        APIinterface.showLoadingBox("", this.$q);
        const params = new URLSearchParams({
          merchant_uuid: this.SettingStore.merchant_uuid,
          reservation_date: this.reservation_date,
          guest: this.guest,
        }).toString();
        const results = await APIinterface.fetchGetBooking(
          `fetchTimeslot?${params}`
        );
        this.data.time_slot = results.details.time_slot;
        this.data.not_available_time = results.details.not_available_time;
        this.fetchTableList();
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    getColor(value) {
      if (this.reservation_time == value) {
        return "primary";
      } else if (this.isNotavailable(value)) {
        return "disabled";
      }
    },
    getTextColor(value) {
      if (this.reservation_time == value) {
        return "white";
      } else if (this.isNotavailable(value)) {
        return "disabled";
      }
      return "dark";
    },
    isNotavailable(value) {
      if (Object.keys(this.getTimeUnavailable).length > 0) {
        if (this.getTimeUnavailable.includes(value) === true) {
          return true;
        }
      }
      return false;
    },
    async onSubmit() {
      try {
        this.loading2 = true;
        const response = await APIinterface.fetchPostBooking(
          "ReserveTable",
          new URLSearchParams({
            merchant_uuid: this.SettingStore.merchant_uuid,
            guest: this.guest,
            reservation_date: this.reservation_date,
            reservation_time: this.reservation_time,
            room_id: this.room_id,
            table_id: this.table_id,
            special_request: this.special_request,
            recaptcha_response: this.recaptcha_response ?? "",
          }).toString()
        );
        this.$router.replace({
          path: "/booking/succesful",
          query: {
            uuid: this.SettingStore.merchant_uuid,
            reservation_uuid: response.details.reservation_uuid,
          },
        });
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading2 = false;
      }
    },
    async fetchTableList() {
      try {
        if (!this.data?.allowed_choose_table) {
          return;
        }
        this.table_id = "";

        const params = new URLSearchParams({
          merchant_uuid: this.SettingStore.merchant_uuid,
          reservation_date: this.reservation_date,
          reservation_time: this.reservation_time,
          guest: this.guest,
        }).toString();
        const response = await APIinterface.fetchGetBooking(
          `fetchTableList?${params}`
        );
        console.log("response", response);
        this.table_list = response.details.table_list;
      } catch (error) {
        console.log("error", error);
      } finally {
      }
    },
  },
};
</script>
