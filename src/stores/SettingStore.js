import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { api } from "boot/axios";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";
import jwtDecode from "jwt-decode";

export const useSettingStore = defineStore("SettingsStore", {
  state: () => ({
    loading: false,
    settings_data: [],
    merchant_id: "",
    merchant_uuid: "",
    category_loading: true,
    category_data: [],
    loading_transaction: true,
    format_transaction_data: [],
    loading_gettimes: false,
    delivery_date_list: [],
    delivery_time_list: [],
    addresses_loading: false,
    addresses_data: [],
    realtime_data: [],

    search_mode: null,
    location_searchtype: null,
    location_enabled_map_selection: false,
    country_id: null,

    payment_icons: {
      cod: {
        bg: "bg-green",
        icon: "local_atm",
      },
      paypal: {
        bg: "bg-blue",
        icon: "lab la-paypal",
      },
      stripe: {
        bg: "bg-blue-6",
        icon: "lab la-stripe",
      },
      razorpay: {
        bg: "bg-blue-10",
        icon: "credit_card",
      },
      mercadopago: {
        bg: "bg-light-blue-5",
        icon: "credit_card",
      },
      bank: {
        bg: "bg-blue-7",
        icon: "account_balance",
      },
      ocr: {
        bg: "bg-light-green",
        icon: "credit_card",
      },
      paydelivery: {
        bg: "bg-yellow-9",
        icon: "credit_card",
      },
    },
  }),

  getters: {
    getTransactionData(state) {
      if (Object.keys(state.format_transaction_data).length > 0) {
        return state.format_transaction_data;
      }
      return false;
    },
    hasAddressData(state) {
      if (Object.keys(state.addresses_data).length > 0) {
        return true;
      }
      return false;
    },
    getStatusAllowedCancel() {
      if (Object.keys(this.settings_data).length > 0) {
        return this.settings_data.status_allowed_cancelled;
      }
      return false;
    },
    getStatusAllowedReview() {
      if (Object.keys(this.settings_data).length > 0) {
        return this.settings_data.status_allowed_review;
      }
      return false;
    },
    getMapConfig() {
      try {
        const maps_config = jwtDecode(this.settings_data?.maps_config);
        return maps_config;
      } catch (error) {
        return false;
      }
    },
    deliveryOptions(state) {
      return state.settings_data?.addresss_delivery_option || null;
    },
  },

  actions: {
    async getSettings() {
      try {
        const DataStorePersisted = useDataStorePersisted();

        this.loading = true;
        const response = await api.get(
          "/getSettings?currency_code=" + DataStorePersisted.getUseCurrency()
        );
        this.settings_data = response.data.details;
        this.merchant_uuid = response.data.details.merchant_uuid;
        this.merchant_id = response.data.details.merchant_id;

        if (APIinterface.empty(DataStorePersisted.transaction_type)) {
          DataStorePersisted.transaction_type =
            this.settings_data.default_services;
        }
        if (APIinterface.empty(DataStorePersisted.whento_deliver)) {
          DataStorePersisted.whento_deliver = this.settings_data.default_when;
        }

        return this.settings_data;
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },
    async getCategory() {
      try {
        this.category_loading = true;
        console.log("getCategory");
        const response = await api.get("/category");
        if (response.data.code == 1) {
          this.category_data = response.data.details.data;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.category_loading = false;
      }
    },
    formatTransaction() {
      this.loading_transaction = true;
      const DataStorePersisted = useDataStorePersisted();
      let params = {
        transaction_type: DataStorePersisted.transaction_type,
        whento_deliver: DataStorePersisted.whento_deliver,
        delivery_date: DataStorePersisted.delivery_date,
        delivery_time: DataStorePersisted.delivery_time,
        delivery_time_data: DataStorePersisted.delivery_time_data,
      };
      APIinterface.fetchDataPost("formatTransaction", params)
        .then((data) => {
          this.format_transaction_data = data.details;
          if (data.details.time_already_past) {
            DataStorePersisted.whento_deliver = "now";
            DataStorePersisted.delivery_date = "";
            DataStorePersisted.delivery_time = "";
            DataStorePersisted.delivery_time_data = [];
          }
        })
        .catch((error) => {
          this.format_transaction_data = [];
        })
        .then((data) => {
          this.loading_transaction = false;
        });
    },
    async getDeliveryTimes() {
      try {
        this.loading_gettimes = true;
        const response = await api.get("/getDeliveryTimes");
        const data = await response.data;
        if (data.code == 1) {
          if (Object.keys(data.details.opening_date).length > 0) {
            Object.entries(data.details.opening_date).forEach(
              ([key, items]) => {
                this.delivery_date_list.push({
                  label: items.name,
                  value: items.value,
                });
              }
            );
          }

          const keys = Object.keys(data.details.opening_date);
          const delivery_date = keys[0];
          this.delivery_time_list = data.details.opening_time;
          return delivery_date;
        }
        return false;
      } catch (error) {
        console.error("Error fetching data:", error);
        return false;
      } finally {
        this.loading_gettimes = false;
      }
    },
    async clientAddresses() {
      try {
        this.addresses_loading = true;
        const response = await api.get("/clientAddresses", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${auth.getToken()}`,
          },
        });
        if (response.data.code == 1) {
          this.addresses_data = response.data.details.addresses;
        } else {
          this.addresses_data = [];
        }
        return this.addresses_data;
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.addresses_loading = false;
      }
    },
  },
});
