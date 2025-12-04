<template>
  <q-dialog
    v-model="modal"
    @show="onShow"
    @before-show="beforeShow"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="onBeforeHide"
  >
    <q-card class="bg-mygrey1">
      <div class="fixed-top bg-white text-dark z-top">
        <q-toolbar class="myshadowx">
          <q-btn icon="close" flat round dense v-close-popup></q-btn>
          <q-toolbar-title class="text-subtitle2 text-weight-bold">
            {{ data?.reservation_date }}
          </q-toolbar-title>
        </q-toolbar>
      </div>
      <q-space style="height: 50px"></q-space>
      <div class="q-pa-md q-gutter-y-md">
        <q-item dense>
          <q-item-section>
            <q-item-label>{{ $t("Reservation ID") }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            {{ data?.reservation_id }}
          </q-item-section>
        </q-item>
        <q-card-section class="radius8 box-shadow0 bg-white q-pl-xs q-pr-xs">
          <q-item dense>
            <q-item-section avatar top>
              <q-avatar> <img :src="data?.logo_url" /></q-avatar>
            </q-item-section>
            <q-item-section top>
              <q-item-label class="text-weight-medium">{{
                data?.restaurant_name
              }}</q-item-label>
              <q-item-label>
                <q-badge
                  :color="
                    DataStore.statusBookingColor[toSeo(data?.status_raw)]?.bg ||
                    'primary'
                  "
                  :text-color="
                    DataStore.statusBookingColor[toSeo(data?.status_raw)]
                      ?.text || 'white'
                  "
                  class="text-capitalize"
                  rounded
                >
                  <div class="text-weight-bold q-pa-xs">
                    {{ data?.status }}
                  </div>
                </q-badge>
              </q-item-label>
            </q-item-section>
            <q-item-section side top v-if="data?.can_modify">
              <q-btn
                :label="$t('Cancel')"
                no-caps
                unelevated
                color="red"
                flat
                padding="0"
                class="text-weight-bold"
                @click="this.$refs.ref_cancel.modal = true"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-section class="radius8 box-shadow0 bg-white">
          <q-item dense>
            <q-item-section>
              <q-item-label>{{ $t("Guest") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data?.guest_number }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label>{{ $t("Date") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data?.reservation_date }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-section class="radius8 box-shadow0 bg-white">
          <q-item dense>
            <q-item-section>
              <q-item-label>{{ $t("Name") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data?.full_name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label>{{ $t("Email address") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data?.email_address }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label>{{ $t("Contact number") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data?.contact_phone }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label>{{ $t("Special request") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data?.special_request }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-btn
          v-if="data?.can_modify"
          color="primary"
          unelevated
          no-caps
          size="lg"
          rounded
          class="fit"
          :to="{
            path: '/reservation/update',
            query: { id: data?.reservation_uuid },
          }"
        >
          <div class="text-weight-bold text-subtitle2">
            {{ $t("Modify Reservation") }}
          </div>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>

  <BookingCancel
    ref="ref_cancel"
    :cancel_reason="cancel_reason"
    :reservation_uuid="data?.reservation_uuid || null"
    @after-cancel="afterCancel"
  ></BookingCancel>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStore } from "src/stores/DataStore";

export default {
  name: "BookingDetails",
  props: ["cancel_reason"],
  components: {
    BookingCancel: defineAsyncComponent(() =>
      import("components/BookingCancel.vue")
    ),
  },
  data() {
    return {
      modal: false,
      data: null,
      index: null,
    };
  },
  setup(props) {
    const DataStore = useDataStore();
    return { DataStore };
  },
  methods: {
    ViewDetails(value, index) {
      this.data = value;
      this.index = index;
      this.modal = true;
    },
    afterCancel(value) {
      this.data = value;
      this.$emit("afterCancel", value, this.index);
    },
    toSeo(value) {
      if (!value) {
        return;
      }
      let text = value;
      let result = text.toLowerCase().replace(/\s+/g, "_");
      return result;
    },
  },
};
</script>
