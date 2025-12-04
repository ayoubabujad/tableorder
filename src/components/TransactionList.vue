<template>
  <div
    class="border-dark-greyx q-pa-xs radius20 relative-position"
    :class="{
      'bg-grey600 ': $q.dark.mode,
      'border-dark-grey ': !$q.dark.mode,
    }"
    style="min-height: 45px"
  >
    <q-tabs
      v-model="transaction_type"
      dense
      class="text-grey"
      :active-color="$q.dark.mode ? 'grey300' : 'primary'"
      :indicator-color="$q.dark.mode ? 'gry300' : 'primary'"
      align="justify"
      narrow-indicator
      no-caps
      outside-arrows
      mobile-arrows
      @click="saveTransactionType"
    >
      <template
        v-for="services_list in data.merchant_services"
        :key="services_list"
      >
        <q-tab
          :name="services_list.service_code"
          :label="services_list.service_name"
        />
      </template>
    </q-tabs>
    <q-inner-loading
      :showing="loading"
      :color="$q.dark.mode ? 'grey300' : 'primary'"
    />
  </div>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "TransactionList",
  props: ["data", "loading", "trans_type"],
  data() {
    return {
      transaction_type: "",
      loading2: false,
    };
  },
  watch: {
    trans_type: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        this.transaction_type = newValue;
      },
    },
    // transaction_type(newValue, oldValue) {
    //   this.$emit("afterSelecttransactions", newValue);
    // },
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    saveTransactionType() {
      this.loading2 = true;
      this.$emit("afterSelecttransactions", this.transaction_type);
      let cart_uuid = APIinterface.getStorage("cart_uuid");
      let params =
        "cart_uuid=" + cart_uuid + "&transaction_type=" + this.transaction_type;
      APIinterface.fetchDataPost("saveTransactionType", params)
        .then((data) => {
          if (APIinterface.empty(cart_uuid)) {
            APIinterface.setStorage("cart_uuid", data.details.cart_uuid);
          }
          this.$emit("aftersaveTransactions", this.transaction_type);
        })
        .catch((error) => {
          //
        })
        .then((data) => {
          this.loading2 = false;
        });
    },
  },
};
</script>
