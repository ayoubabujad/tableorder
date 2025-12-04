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

  <q-dialog
    v-model="payment_modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
    :position="this.$q.screen.gt.sm ? 'standard' : 'bottom'"
    :full-width="this.$q.screen.gt.sm ? false : true"
  >
    <q-card
      style="width: 500px; max-width: 80vw"
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ label.payment_title }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="q-pa-md">
        <div class="text-body2">
          {{ label.payment_subtitle }}
        </div>
      </q-card-section>

      <q-separator spaced />
      <q-card-actions>
        <div ref="paypal_button" class="margin-auto full-width" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { loadScript } from "vue-plugin-load-script";

let paypalHandle;
export default {
  name: "PaypalComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      payment_modal: false,
      client_id: "",
      enabled_force: false,
      force_currency: "",
      force_amount: 0,
    };
  },
  methods: {
    showPaymentForm() {
      this.show_modal = true;
    },
    close() {
      this.show_modal = false;
    },
    onSubmit() {
      let merchantId = 0;
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        merchantId = this.payment_credentials[this.payment_code].merchant_id;
      }
      const $data = {
        merchant_id: merchantId,
        payment_code: this.payment_code,
      };
      this.loading = true;
      APIinterface.fetchDataByTokenPost("SavedPaymentProvider", $data)
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
      this.data = data;
      this.payment_modal = true;
      if (
        typeof this.payment_credentials[data.payment_code] !== "undefined" &&
        this.payment_credentials[data.payment_code] !== null
      ) {
        this.client_id = this.payment_credentials[data.payment_code].attr2;
      }

      console.log(data);
      if (data.force_payment_data) {
        if (data.force_payment_data.enabled_force) {
          this.enabled_force = true;
          this.force_currency = data.force_payment_data.use_currency_code;
          this.force_amount = data.force_payment_data.total_exchange;
        }
      }

      this.initPaypal();
    },
    initPaypal() {
      let currencyCode = this.data.currency;
      if (this.enabled_force) {
        currencyCode = this.force_currency;
      }

      loadScript(
        "https://www.paypal.com/sdk/js?client-id=" +
          this.client_id +
          "&currency=" +
          currencyCode +
          "&disable-funding=credit,card"
      )
        .then(() => {
          this.renderPaypal();
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
    renderPaypal() {
      let Amount = this.data.total;
      if (this.enabled_force) {
        Amount = this.force_amount;
      }

      paypalHandle = paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: Amount,
                },
              },
            ],
          });
        },
        onCancel: (data) => {
          //
        },
        onError: (error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((orderData) => {
            const transaction =
              orderData.purchase_units[0].payments.captures[0];
            this.CompletePaymentRequest(
              transaction.status,
              transaction.id,
              orderData.id
            );
          });
        },
      });
      paypalHandle.render(this.$refs.paypal_button);
    },
    CompletePaymentRequest(status, transaction_id, order_id) {
      let $params = {
        transaction_id: transaction_id,
        order_id: order_id,
        order_uuid: this.data.order_uuid,
        cart_uuid: this.data.cart_uuid,
      };
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("PaypalVerifyPayment", $params)
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

      if (
        typeof this.payment_credentials[datas.payment_code] !== "undefined" &&
        this.payment_credentials[datas.payment_code] !== null
      ) {
        this.client_id = this.payment_credentials[datas.payment_code].attr2;
      }
      this.PaypalInit();
    },
    PaypalInit() {
      loadScript(
        "https://www.paypal.com/sdk/js?client-id=" +
          this.client_id +
          "&currency=" +
          this.force_currency +
          "&disable-funding=credit,card"
      )
        .then(() => {
          this.renderPayment();
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
    renderPayment() {
      this.$emit("closePayment");
      let Amount = this.force_amount;

      this.payment_modal = true;

      paypalHandle = paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: parseFloat(Amount),
                },
              },
            ],
          });
        },
        onCancel: (data) => {
          //
        },
        onError: (err) => {
          this.error[0] = this.on_error.error;
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((orderData) => {
            var transaction = orderData.purchase_units[0].payments.captures[0];
            this.processPayment(
              transaction.status,
              transaction.id,
              orderData.id
            );
          });
        },
      });

      setTimeout(() => {
        paypalHandle.render(this.$refs.paypal_button);
      }, 500);
    },
    processPayment(status, transaction_id, order_id) {
      this.payment_modal = false;
      APIinterface.showLoadingBox(this.$t("processing_payment"), this.$q);
      APIinterface.PaymentPost("Paypalprocesspayment", {
        data: this.jwt_data,
        transaction_id: transaction_id,
        order_id: order_id,
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
    //
  },
};
</script>
