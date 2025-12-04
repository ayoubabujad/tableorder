<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="fade"
    transition-hide="fadeout"
    :position="this.$q.screen.gt.sm ? 'standard' : 'bottom'"
    :full-width="this.$q.screen.gt.sm ? false : true"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ title }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-body2">
          {{ label.notes }}
        </div>
      </q-card-section>

      <q-separator spaced />
      <q-card-actions>
        <q-btn
          :label="label.submit"
          :loading="loading"
          @click="onSubmit()"
          unelevated
          no-caps
          color="primary text-white"
          class="full-width q-mb-sm"
          size="lg"
          rounded
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "BankComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      credentials: [],
    };
  },
  methods: {
    showPaymentForm() {
      this.show_modal = true;
      this.setCredentials();
    },
    close() {
      this.show_modal = false;
    },
    closePayment() {
      this.$emit("afterCancelPayment");
    },
    setCredentials() {
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        this.credentials = this.payment_credentials[this.payment_code];
      }
    },
    onSubmit() {
      const $data = {
        merchant_id: this.credentials.merchant_id,
        payment_code: this.payment_code,
      };
      this.loading = true;
      APIinterface.fetchDataByTokenPost("SavedPaymentProvider", $data)
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
  },
};
</script>
