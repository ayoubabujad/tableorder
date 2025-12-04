<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    full-width
    @before-show="beforeShow"
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Cancel Booking") }}
          </div>
        </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
      </q-toolbar>
      <q-card-section style="height: 60vh" class="scroll relative-position">
        <q-list>
          <template v-for="items in cancel_reason" :key="items">
            <q-item
              clickable
              v-ripple:purple
              class="border-grey radius8 q-mb-sm"
              tag="label"
            >
              <q-item-section>
                <q-radio
                  v-model="reason"
                  :val="items"
                  :label="items"
                  color="primary"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
        <q-space class="q-pa-sm"></q-space>

        <q-card-actions
          class="fixed-bottom bg-white row q-gutter-x-md q-pl-md q-pr-md shadow-1"
          align="center"
        >
          <q-btn
            no-caps
            unelevated
            :color="!reason ? 'disabled' : 'primary'"
            :text-color="!reason ? 'disabled' : 'white'"
            size="lg"
            rounded
            class="fit"
            :disable="!reason"
            @click="CancelBooking"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Continue") }}
            </div>
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
export default {
  name: "BookingCancel",
  props: ["cancel_reason", "reservation_uuid"],
  setup() {
    return {};
  },
  data() {
    return {
      modal: false,
      reason: null,
      loading: false,
    };
  },
  methods: {
    beforeShow() {
      this.reason = null;
    },
    async CancelBooking() {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = new URLSearchParams({
          id: this.reservation_uuid,
          reason: this.reason,
        }).toString();
        const results = await APIinterface.fetchPostBooking(
          "CancelReservation",
          params
        );
        this.modal = false;
        this.$emit("afterCancel", results.details.data);
        APIinterface.notify("positive", results.msg, "check_circle", this.$q);
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>
