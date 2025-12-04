<template>
  <q-dialog
    v-model="modal"
    persistent
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    backdrop-filter="blur(4px)"
  >
    <q-card class="radius10">
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Receipt") }}
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
      <q-card-section>
        <OrderStatusAnimation status="completed" style="height: 100px" />

        <q-markup-table flat>
          <tbody>
            <tr>
              <td class="text-left">{{ $t("Amount Loaded") }}</td>
              <td class="text-right">{{ data?.amount }}</td>
            </tr>
            <tr>
              <td class="text-left">{{ $t("Payment Method") }}</td>
              <td class="text-right">{{ data?.payment_name }}</td>
            </tr>
            <tr>
              <td class="text-left">{{ $t("Transaction ID") }}</td>
              <td class="text-right">{{ data?.transaction_id }}</td>
            </tr>
            <tr>
              <td class="text-left">{{ $t("Date/Time") }}</td>
              <td class="text-right">{{ data?.transaction_date }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-card-actions class="q-pl-md q-pr-md myshadow">
        <q-btn
          @click="modal = false"
          color="grey"
          flat
          class="fit"
          size="large"
        >
          <div class="text-weight-medium text-subtitle2">
            {{ $t("Close") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "AddFundsReceipt",
  components: {
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
  },
  data() {
    return {
      modal: false,
      data: null,
    };
  },
  setup() {
    return {};
  },
  methods: {
    showModal(value) {
      console.log("showModal", value);
      this.modal = true;
      this.data = value;
    },
  },
};
</script>
