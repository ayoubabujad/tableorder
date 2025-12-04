<template>
  <q-header
    class="bg-whitex"
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
      <q-toolbar-title class="text-weight-bold text-darkx">{{
        $t("Cancel Booking")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page
    class="q-pa-md"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <div class="text-weight-medium text-body1">
      {{ $t("We're sorry that you have to cancel your reservation") }}.
    </div>
    <div class="text-body2">
      {{ $t("Would you please tell us why you wish to cancel") }}?
    </div>
    <q-space class="q-pa-sm"></q-space>

    <q-list class="q-list-small">
      <template v-for="items in BookingStore.getCancelReasonData" :key="items">
        <q-item
          tag="label"
          class="bg-mygreyx radius10 q-mb-sm"
          clickable
          :class="{
            'bg-grey600 text-grey300': $q.dark.mode,
            'bg-mygrey text-dark': !$q.dark.mode,
          }"
        >
          <q-item-section side>
            <q-radio
              v-model="reason"
              :val="items"
              size="xs"
              checked-icon="fiber_manual_record"
              unchecked-icon="fiber_manual_record"
            />
          </q-item-section>
          <q-item-section>{{ items }}</q-item-section>
        </q-item>
      </template>
    </q-list>

    <q-footer
      class="q-pl-md q-pr-md q-pt-sm q-pb-sm text-dark row items-center q-gutter-sm border-top"
      :class="{
        'bg-mydark ': $q.dark.mode,
        'bg-white ': !$q.dark.mode,
      }"
    >
      <q-btn
        :color="$q.dark.mode ? 'grey' : 'dark'"
        :text-color="$q.dark.mode ? 'grey-9' : 'white'"
        size="lg"
        rounded
        unelevated
        no-caps
        @click="$router.back()"
        class="col"
        >{{ $t("Back") }}</q-btn
      >
      <q-btn
        unelevated
        color="primary"
        :label="$t('Continue')"
        rounded
        no-caps
        size="lg"
        :disable="!hasReason"
        :loading="loading"
        @click="ConfirmcancelReservation"
        class="col"
      />
    </q-footer>

    <template v-if="BookingStore.isLoading">
      <q-inner-loading
        :showing="true"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </template>
  </q-page>
</template>

<script>
import { useBookingStore } from "stores/BookingStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "BookingCancel",
  setup() {
    const BookingStore = useBookingStore();
    return { BookingStore };
  },
  data() {
    return {
      reservation_uuid: "",
      reason: "",
      loading: false,
    };
  },
  computed: {
    hasReason() {
      if (!APIinterface.empty(this.reason)) {
        return true;
      }
      return false;
    },
  },
  created() {
    this.reservation_uuid = this.$route.query.id;
    this.getCancelreason(null);
  },
  methods: {
    refresh(done) {
      this.getCancelreason(this.reservation_uuid, done);
    },
    getCancelreason(done) {
      this.BookingStore.getCancelreason(this.reservation_uuid, done);
    },
    ConfirmcancelReservation() {
      this.$q
        .dialog({
          title: this.$t("Cancel reservation"),
          message: this.$t("Are you sure to continue?"),
          cancel: true,
          persistent: true,
          ok: {
            unelevated: true,
            color: "primary",
            rounded: true,
            "text-color": "white",
            size: "md",
            label: this.$t("Yes"),
            "no-caps": true,
          },
          cancel: {
            unelevated: true,
            rounded: true,
            color: "grey-3",
            "text-color": "black",
            size: "md",
            label: this.$t("Cancel"),
            "no-caps": true,
          },
        })
        .onOk(() => {
          this.CancelReservation();
        })
        .onOk(() => {})
        .onCancel(() => {})
        .onDismiss(() => {});
    },
    CancelReservation() {
      this.loading = true;
      APIinterface.fetchDataPostTableToken(
        "CancelReservation",
        "id=" + this.reservation_uuid + "&reason=" + this.reason
      )
        .then((data) => {
          APIinterface.notify("dark", data.msg, "check", this.$q);
          setTimeout(() => {
            this.$router.replace({
              path: "/reservation/track",
              query: { id: this.reservation_uuid },
            });
          }, 500);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    //
  },
};
</script>
