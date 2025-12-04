<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    :position="this.$q.screen.gt.sm ? 'standard' : 'bottom'"
    :full-width="this.$q.screen.gt.sm ? false : true"
    @before-show="getPaydelivery"
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ title }}
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
      <q-card-section style="height: calc(50vh)" class="scroll">
        <div
          v-if="loading_get"
          class="row q-gutter-x-sm justify-center absolute-center text-center full-width"
        >
          <q-circular-progress
            indeterminate
            rounded
            size="sm"
            color="primary"
          />
          <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
        </div>

        <q-list>
          <template v-for="items in data" :key="items">
            <q-item
              tag="label"
              v-ripple:purple
              class="border-grey q-mb-sm rounded-borders"
              :class="{
                'border-primary': this.payment_id == items.id,
                'bg-disabled text-disable': isAlreadySaved(items.id),
              }"
            >
              <q-item-section avatar>
                <q-radio
                  v-model="payment_id"
                  :val="items.id"
                  :disable="isAlreadySaved(items.id)"
                  unchecked-icon="panorama_fish_eye"
                />
              </q-item-section>
              <q-item-section class="text-weight-medium text-subtitle2">
                {{ items.name }}
              </q-item-section>
              <q-item-section side v-if="items.url_image">
                <q-img
                  :src="items.url_image"
                  style="height: 30px; width: 40px"
                  loading="lazy"
                  fit="scale-down"
                  class="radius8"
                >
                  <template v-slot:loading>
                    <q-skeleton
                      height="30px"
                      width="40px"
                      square
                      class="bg-grey-2"
                    />
                  </template>
                </q-img>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card-section>
      <q-card-actions>
        <q-btn
          unelevated
          rounded
          color="primary"
          no-caps
          class="full-width q-mb-sm"
          size="lg"
          :loading="loading"
          :disable="hasSelected"
          @click="onSubmit()"
        >
          <div class="text-weight-bold text-body1">{{ label.submit }}</div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "PaydeliveryComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      payment_id: "",
      loading_get: true,
      client_uuid: null,
    };
  },
  mounted() {
    const user_data = auth.getUser();
    this.client_uuid = user_data?.client_uuid ?? null;
  },
  computed: {
    getData() {
      return this.data;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasSelected() {
      if (this.payment_id > 0) {
        return false;
      }
      return true;
    },
  },
  methods: {
    isAlreadySaved(id) {
      if (!this.saved_payment) {
        return false;
      }
      if (this.saved_payment.includes(id)) {
        return true;
      }
      return false;
    },
    showPaymentForm() {
      this.show_modal = true;
    },
    close() {
      this.show_modal = false;
    },
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "savedPaydelivery",
        "payment_id=" +
          this.payment_id +
          "&payment_code=" +
          this.payment_code +
          "&merchant_id=" +
          this.payment_credentials?.merchant_id
      )
        .then((data) => {
          this.close();
          this.$emit("afterAddpayment");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    getPaydelivery() {
      this.data = [];
      this.payment_id = null;
      this.loading_get = true;
      APIinterface.fetchDataPost(
        "getPaydelivery",
        "client_uuid=" + this.client_uuid
      )
        .then((data) => {
          this.data = data.details.data;
          this.saved_payment = data.details.saved_payment;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading_get = false;
        });
    },
  },
};
</script>
