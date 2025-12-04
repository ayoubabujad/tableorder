<template>
  <q-pull-to-refresh @refresh="refresh">
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
          $t("Track Booking")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page
      class="q-pa-md q-gutter-y-sm"
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "BookingTracking",
  data() {
    return {
      loading: false,
      reservation_uuid: "",
      steps: 1,
      data: null,
    };
  },
  mounted() {
    this.reservation_uuid = this.$route.query.id;
    this.fetchDetails();
  },
  methods: {
    async fetchDetails() {
      try {
        const params = new URLSearchParams({
          reservation_uuid: this.reservation_uuid,
        }).toString();
        this.loading = true;
        const response = await APIinterface.fetchGetBooking(
          `fetchbookingdetails?${params}`
        );
        this.data = response.details;
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
