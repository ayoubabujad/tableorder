<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
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
          unelevated
          rounded
          color="primary"
          text-color="white"
          no-caps
          class="full-width q-mb-sm"
          :label="label.submit"
          size="lg"
          :loading="loading"
          @click="onSubmit()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { loadScript } from "vue-plugin-load-script";
export default {
  name: "RazorpayComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      credentials: [],
      orders: [],
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
        payment_code: this.payment_code,
        merchant_id: this.credentials.merchant_id,
        merchant_type: this.credentials.merchant_type,
      };
      this.loading = true;
      APIinterface.PaymentPost("RazorpayCreateCustomer", $data)
        .then((data) => {
          this.close();
          this.$emit("afterAddpayment");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    PaymentRender(data) {
      this.setCredentials();
      this.data = data;
      const $data = {
        cart_uuid: data.cart_uuid,
        order_uuid: data.order_uuid,
        payment_code: data.payment_code,
        merchant_id: this.credentials.merchant_id,
        merchant_type: this.credentials.merchant_type,
      };
      APIinterface.showLoadingBox(this.$t("getting_payment_info"), this.$q);
      APIinterface.PaymentPost("RazorpayCreateOrder", $data)
        .then((data) => {
          this.orders = data.details;
          this.initRazorPay();
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    initRazorPay() {
      loadScript("https://checkout.razorpay.com/v1/checkout.js")
        .then(() => {
          this.initPayment();
        })
        .catch(() => {
          APIinterface.notify(
            "dark",
            this.$t("failed loading script"),
            "error_outline",
            this.$q
          );
        });
    },
    initPayment() {
      try {
        const options = {
          key: this.credentials.attr2,
          amount: this.orders.amount,
          currency: this.orders.currency,
          name: this.orders.name,
          description: this.orders.description,
          order_id: this.orders.order_id,
          customer_id: this.orders.customer_id,
          handler: (response) => {
            this.verifyPayment(response);
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: (data) => {
              this.closePayment();
            },
          },
        };
        /* eslint-disable */
        const rzr_handle = new Razorpay(options);
        rzr_handle.on("payment.failed", (response) => {
          // this.$emit('alert', response.error.description );
        });
        rzr_handle.open();
      } catch (err) {
        APIinterface.notify("dark", err, "error_outline", this.$q);
      }
    },
    verifyPayment(data) {
      this.setCredentials();
      var $params = {
        cart_uuid: this.data.cart_uuid,
        order_uuid: this.data.order_uuid,
        payment_code: this.data.payment_code,
        merchant_id: this.credentials.merchant_id,
        merchant_type: this.credentials.merchant_type,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_signature: data.razorpay_signature,
      };
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("RazorpayVerifyPayment", $params)
        .then((data) => {
          this.$emit("afterSuccessfulpayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    Dopayment(data, datas) {
      this.jwt_data = data;
      this.force_amount = datas.amount;
      this.force_currency = datas.currency_code;

      this.setCredentials();

      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("Razorpaycreateneworder", {
        data: data,
      })
        .then((data) => {
          this.orders = data.details;
          this.RazorPayinit();
        })
        .catch((error) => {
          this.$emit("afterCancelPayment", error);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    RazorPayinit() {
      loadScript("https://checkout.razorpay.com/v1/checkout.js")
        .then(() => {
          this.Paymentinit();
        })
        .catch(() => {
          APIinterface.notify(
            "negative",
            "failed loading script",
            "error_outline",
            this.$q
          );
        });
    },
    Paymentinit() {
      try {
        let options = {
          key: this.credentials.attr2,
          amount: this.orders.amount,
          currency: this.orders.currency,
          name: this.orders.name,
          description: this.orders.description,
          order_id: this.orders.order_id,
          customer_id: this.orders.customer_id,
          handler: (response) => {
            this.processPayment(response);
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: (data) => {
              this.closePayment();
            },
          },
        };
        var rzr_handle = new Razorpay(options);
        rzr_handle.on("payment.failed", (response) => {});
        this.$emit("closeLoader");
        rzr_handle.open();
      } catch (err) {
        this.$emit("afterCancelPayment", err.message);
      }
    },
    processPayment(data) {
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("Razorpayprocesspayment", {
        data: this.jwt_data,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_signature: data.razorpay_signature,
      })
        .then((data) => {
          this.$emit("afterSuccessfulpayment", data.details);
        })
        .catch((error) => {
          this.$emit("afterCancelPayment", error);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
