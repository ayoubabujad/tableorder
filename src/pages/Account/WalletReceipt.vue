<template>
  <q-header reveal>
    <q-toolbar>
      <q-btn
        to="/account/wallet"
        :replace="true"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'grey' : 'mygrey'"
        :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
      />
      <q-toolbar-title class="text-weight-bold">{{
        $t("Receipt")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <q-card class="box-shadow0">
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
          to="/account/wallet"
          :replace="true"
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
  </q-page>
</template>

<script>
import { useDataStore } from "src/stores/DataStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "WalletReceipt",
  components: {
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
  },
  data() {
    return {
      data: null,
    };
  },
  setup(props) {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    this.DataStore.data.walletTransactions = null;
    this.data = {
      amount: this.$route.query?.amount || "",
      payment_name: this.$route.query?.payment_name || "",
      transaction_id: this.$route.query?.transaction_id || "",
      transaction_date: this.$route.query?.transaction_date || "",
    };
  },
};
</script>
