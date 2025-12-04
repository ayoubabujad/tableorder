import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { api } from "boot/axios";
import auth from "src/api/auth";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "./SettingStore";

export const userCartData = defineStore("CartData", {
  state: () => ({
    loading: false,
    reloading: false,
    cart_data: null,
    pay_load: [
      "items",
      "subtotal",
      "distance_local_new",
      "items_count",
      "merchant_info",
      "check_opening",
      "estimation",
      "transaction_info",
      "standard_estimation",
    ],
    use_payload: null,
    delivery_times: null,
    promo_data: null,
  }),

  getters: {
    getCartCount(state) {
      return state.cart_data ? parseFloat(state.cart_data.items_count) : 0;
    },
    hasItem(state) {
      return !!(state.cart_data && parseFloat(state.cart_data.items_count) > 0);
    },
    geTransactiontype(state) {
      return state.cart_data?.transaction_info?.transaction_type || null;
    },
    geTransactionInfo(state) {
      return state.cart_data?.transaction_info || null;
    },
    getItems(state) {
      return state.cart_data?.data?.items || null;
    },
    getSubtotal(state) {
      return state.cart_data?.data?.subtotal?.value || null;
    },
    isStoreopen(state) {
      return !!state.cart_data?.store_open;
    },
    getError(state) {
      if (state.cart_data) {
        if (state.cart_data.error) {
          if (
            Array.isArray(state.cart_data.error) &&
            state.cart_data.error.length > 0
          ) {
            return state.cart_data.error;
          }
        }
      }
      return false;
    },
    hasError() {
      if (this.getError) {
        return true;
      }
      return false;
    },
    canCheckout(state) {
      if (!this.isStoreopen) {
        return false;
      }
      if (this.getError) {
        return false;
      }
      return true;
    },
    getServices(state) {
      return state.cart_data?.services || null;
    },
    getAddress(state) {
      return state.cart_data?.delivery_address || false;
    },
    getAddressDetails(state) {
      return state.cart_data?.address_details || false;
    },
    getDistance(state) {
      return state.cart_data?.distance_pretty || "";
    },
    getDeliveryOptions2(state) {
      return state.cart_data?.delivery_option2 || null;
    },
    geDeliverytype(state) {
      return state.cart_data?.transaction_info?.whento_deliver || null;
    },
    getSummary(state) {
      return state.cart_data?.data?.summary || null;
    },
    getPoints(state) {
      return state.cart_data?.points_data || null;
    },
    getTotal(state) {
      return state.cart_data?.data?.total?.value || null;
    },
    getTotalRaw(state) {
      return state.cart_data?.data?.total?.raw || null;
    },
    IsTipenabled(state) {
      return state.cart_data?.enabled_tip || false;
    },
    getTiplist(state) {
      return state.cart_data?.tip_list || false;
    },
    getTipData(state) {
      const results = state.cart_data?.tips_data || false;
      if (results) {
        return results.tips > 0 ? results.tips : results.default_tip;
      }
      return 0;
    },
    getPayment(state) {
      return state.cart_data?.payment_method || false;
    },
    getPaymentList(state) {
      return state.cart_data?.payment_list || false;
    },
    isStrictTowallet(state) {
      return state.cart_data?.strict_to_wallet ?? false;
    },
    getWallet(state) {
      return state.cart_data?.wallet ?? false;
    },
    getMerchant(state) {
      return state.cart_data?.data?.merchant || false;
    },
    getDistance(state) {
      return state.cart_data?.distance_pretty || "";
    },
    getDistance1(state) {
      return state.cart_data?.distance_pretty1 || "";
    },
    getEstimatetime1(state) {
      return state.cart_data?.estimation_time_pretty || null;
    },
    getInstructions(state) {
      return state.cart_data?.order_instructions || null;
    },
    getMerchantId(state) {
      return state.cart_data?.merchant_id || null;
    },
    geDeliveryDate(state) {
      return state.cart_data?.transaction_info?.delivery_date || null;
    },
    geDeliveryTime(state) {
      return state.cart_data?.transaction_info?.delivery_time || null;
    },
    getDate() {
      return this.delivery_times?.dates || null;
    },
    getTimes() {
      return this.delivery_times?.time_ranges || null;
    },
    getPromo(state) {
      return state.promo_data?.data || false;
    },
    getDiscountapplied(state) {
      return state.cart_data?.discount_applied || null;
    },
    getCartID(state) {
      return state.cart_data?.cart_uuid || null;
    },
    // end computed
  },

  actions: {
    async getCart(cardLoading, payload) {
      if (!payload) {
        payload = this.pay_load;
      }

      const DataStorePersisted = useDataStorePersisted();
      const SettingStore = useSettingStore();

      let params = {};

      if (SettingStore.search_mode == "location") {
        params = {
          cart_uuid: DataStorePersisted.cart_uuid ?? "",
          currency_code: DataStorePersisted.getCurrency ?? "",
          payload,
          location: {
            state_id: DataStorePersisted.location_data?.state_id ?? "",
            city_id: DataStorePersisted.location_data?.city_id ?? "",
            area_id: DataStorePersisted.location_data?.area_id ?? "",
            postal_id: DataStorePersisted.location_data?.postal_code ?? "",
          },
          address_uuid: DataStorePersisted.location_data?.address_uuid ?? "",
        };
      } else {
        params = {
          cart_uuid: DataStorePersisted.cart_uuid ?? "",
          currency_code: DataStorePersisted.getCurrency ?? "",
          payload,
          latitude:
            DataStorePersisted.coordinates?.lat ??
            DataStorePersisted.place_data?.latitude,
          longitude:
            DataStorePersisted.coordinates?.lng ??
            DataStorePersisted.place_data?.longitude,
          place_data: DataStorePersisted.place_data,
        };
      }

      if (cardLoading) {
        this.loading = true;
      } else {
        this.reloading = true;
      }

      let method = auth.authenticated() ? "getCartCheckout" : "getCart";
      let response = {};
      try {
        if (auth.authenticated()) {
          response = await APIinterface.fetchDataByToken(method, params);
        } else {
          response = await APIinterface.fetchData(method, params);
        }
        this.cart_data = response.details;
        this.use_payload = payload;
        if (!DataStorePersisted.cart_uuid) {
          DataStorePersisted.cart_uuid = response.details.cart_uuid;
        }
        return response.details;
      } catch (error) {
        this.cart_data = null;
        throw error;
      } finally {
        this.loading = false;
        this.reloading = false;
      }
    },

    async fetchPromo(data) {
      try {
        const params = new URLSearchParams(data).toString();
        const results = await APIinterface.fetchDataPost("fetchPromo", params);
        this.promo_data = results.details;
        return results;
      } catch (error) {
        throw error;
      }
    },

    //
  },
});
