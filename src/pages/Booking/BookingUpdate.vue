<template>
  <q-header
    class="bg-whitex"
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-black': !$q.dark.mode,
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
      <q-toolbar-title class="text-weight-bold text-darkx">{{
        $t("Update Reservation")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <div
      v-if="loading"
      class="row q-gutter-x-sm justify-center absolute-center text-center full-width"
    >
      <q-circular-progress indeterminate rounded size="sm" color="primary" />
      <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
    </div>

    <q-form v-else @submit="onSubmit" class="q-gutter-y-md">
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
      />

      <div v-if="data?.allowed_choose_table">
        <q-select
          v-model="room_id"
          :options="data?.room_list"
          @update:model-value="table_id = ''"
          :label="$t('Room name')"
          transition-show="scale"
          transition-hide="scale"
          emit-value
          map-options
          :rules="[(val) => (val && val > 0) || $t('This field is required')]"
        />
        <q-select
          v-model="table_id"
          :options="data?.table_list[room_id] ?? []"
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
        <q-space class="q-pa-sm"></q-space>
      </template>

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

      <q-footer class="bg-white q-pa-md footer-shadow">
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
            {{ $t("Update") }}
          </div>
        </q-btn></q-footer
      >
    </q-form>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { useSettingStore } from "stores/SettingStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "BookingUpdate",
  components: {
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  data() {
    return {
      data: null,
      loading: false,
      loading2: false,
      reservation_uuid: null,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      guest: 0,
      reservation_date: "",
      reservation_time: "",
      special_request: "",
      room_id: "",
      table_id: "",
      recaptcha_response: null,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    return { SettingStore, DataStore };
  },
  mounted() {
    this.reservation_uuid = this.$route.query.id;
    this.fetchBookingdetails();
  },
  computed: {
    getTimeUnavailable() {
      return this.data?.not_available_time || null;
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
    async onSubmit() {
      try {
        APIinterface.showLoadingBox("", this.$q);
        this.loading2 = true;
        const results = await APIinterface.fetchPostBooking(
          "UpdateBooking",
          new URLSearchParams({
            reservation_uuid: this.reservation_uuid,
            first_name: this.first_name,
            last_name: this.last_name,
            email_address: this.email_address,
            mobile_number: this.mobile_number,
            mobile_prefix: this.mobile_prefix,
            guest: this.guest,
            reservation_date: this.reservation_date,
            reservation_time: this.reservation_time,
            room_id: this.room_id,
            table_id: this.table_id,
            special_request: this.special_request,
            recaptcha_response: this.recaptcha_response,
          }).toString()
        );
        APIinterface.notify("positive", results.msg, "check_circle", this.$q);
        this.DataStore.data.bookingList = null;
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
        this.loading2 = false;
      }
    },
    async fetchBookingdetails() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          reservation_uuid: this.reservation_uuid,
        }).toString();
        const response = await APIinterface.fetchGetBooking(
          `fetchBookingdetails?${params}`
        );

        this.data = response.details;
        const results = response.details;

        this.first_name = results?.data_booking?.first_name || "";
        this.last_name = results?.data_booking?.last_name || "";
        this.email_address = results?.data_booking?.email_address || "";
        this.mobile_number =
          results?.data_booking?.contact_phone_without_prefix || "";
        this.mobile_prefix = results?.data_booking?.phone_prefix || "";

        this.guest = results?.data_booking?.guest_number_raw || 0;
        this.reservation_date =
          results?.data_booking?.reservation_date_raw || "";

        this.reservation_time =
          results?.data_booking?.reservation_time_raw || "";

        this.special_request = results?.data_booking?.special_request || "";

        this.room_id = results?.data_booking?.room_id || "";
        this.table_id = results?.data_booking?.table_id || "";
      } catch (error) {
      } finally {
        this.loading = false;
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
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>
