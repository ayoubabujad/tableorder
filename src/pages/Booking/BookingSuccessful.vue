<template>
  <q-page>
    <div class="absolute-center full-width q-pa-md text-center">
      <LoadingData v-if="loading" page="1"></LoadingData>
      <template v-else>
        <template v-if="!getData">
          <q-card-section>
            <div
              class="bg-error text-error q-pa-sm text-caption line-normal q-mb-sm radius8"
            >
              <q-list dense class="myqlist">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="eva-alert-triangle-outline"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <div>{{ error }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
          <q-card-actions vertical>
            <q-btn no-caps unelevated to="/home">
              <div class="text-subtitle2 text-weight-bold text-blue">
                {{ $t("Return home") }}
              </div>
            </q-btn>
          </q-card-actions>
        </template>

        <template v-if="getData">
          <q-card-section>
            <OrderStatusAnimation status="completed" style="height: 150px" />

            <div class="text-h6 text-weight-bold line-normal">
              {{ $t("Your reservation successfully placed. ") }}
            </div>
            <div class="text-caption text-grey">
              {{
                $t(
                  "You will receive another email once your reservation is confirm. "
                )
              }}
            </div>

            <q-space class="q-pa-sm"></q-space>
            <div class="text-body2">
              {{ getData?.reservation_datetime }}
            </div>
            <div class="text-caption">{{ getData?.guest_number }}</div>
            <div class="text-caption">
              {{ $t("Reservation ID") }}# {{ getData?.reservation_id }}
            </div>
          </q-card-section>
          <q-card-actions vertical>
            <q-btn
              no-caps
              unelevated
              color="primary"
              text-color="white"
              size="lg"
              rounded
              class="fit"
              to="/home"
            >
              <div class="text-subtitle2 text-weight-bold">
                {{ $t("Reserved again") }}
              </div>
            </q-btn>
            <q-space class="q-pa-sm"></q-space>
            <q-btn
              no-caps
              unelevated
              color="disabled"
              text-color="disabled"
              size="lg"
              rounded
              class="fit"
              @click="viewDetails"
            >
              <div class="text-subtitle2 text-weight-bold">
                {{ $t("View Booking") }}
              </div>
            </q-btn>
          </q-card-actions>
        </template>
      </template>
    </div>

    <BookingDetails
      ref="ref_booking"
      :cancel_reason="cancelReason"
      @after-cancel="afterCancel"
    ></BookingDetails>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { useSettingStore } from "src/stores/SettingStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "BookingSuccesful",
  components: {
    BookingDetails: defineAsyncComponent(() =>
      import("components/BookingDetails.vue")
    ),
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
  },
  data() {
    return {
      loading: false,
      reservation_uuid: null,
      error: null,
      data: null,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    return {
      SettingStore,
      DataStore,
    };
  },
  computed: {
    getData() {
      return this.data?.data_booking || null;
    },
    merchantSlug() {
      return this.data?.merchant_slug || null;
    },
    cancelReason() {
      return this.data?.cancel_reason || null;
    },
  },
  mounted() {
    this.reservation_uuid = this.$route.query.reservation_uuid;
    this.DataStore.data.bookingList = null;
    this.fetchBookingdetails();
  },
  methods: {
    viewDetails() {
      this.$refs.ref_booking.ViewDetails(this.getData, null);
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
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    afterCancel() {
      this.fetchBookingdetails();
    },
  },
};
</script>
