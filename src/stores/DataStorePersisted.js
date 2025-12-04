import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useDataStorePersisted = defineStore("datastorepersisted", {
  state: () => ({
    app_version: 0,
    app_language: null,
    dark_mode: false,
    rtl: false,
    cart_uuid: null,
    coordinates: [],
    place_data: null,
    recent_addresses: [],
    skip_home: false,
    use_currency_code: "",
    alert_count: 0,
    chat_count: 0,
    push_enabled: true,
    promotional_push_enabled: true,
    web_token: null,

    // for locations
    location_data: null,
    recent_location: [],

    // for branch selection
    selected_branch: null, // { branch_id, branch_name, address, ... }

    // TABLE ORDERING (QR Code)
    is_table_order: false,    // true when ordering via QR code
    table_id: null,           // table identifier from QR code
    table_name: null,         // display name "Table 5"
    table_uuid: null,         // unique table UUID if provided
  }),

  getters: {
    hasRecentAddress() {
      if (!this.location_data) {
        return false;
      }
      if (Object.keys(this.location_data).length > 0) {
        return true;
      }
      return false;
    },
    getCurrency(state) {
      return state.use_currency_code || "";
    },
  },

  persist: true,

  actions: {
    getUseCurrency() {
      if (
        typeof this.use_currency_code === "undefined" ||
        this.use_currency_code === null ||
        this.use_currency_code === "" ||
        this.use_currency_code === "null" ||
        this.use_currency_code === "undefined"
      ) {
        return "";
      } else {
        return this.use_currency_code;
      }
    },

    saveRecentAddress(place_data) {
      const exists = this.recent_addresses.some(
        (addr) =>
          addr.latitude === place_data.latitude &&
          addr.longitude === place_data.longitude
      );

      if (!exists) {
        this.recent_addresses.unshift(place_data);
        if (this.recent_addresses.length > 8) {
          this.recent_addresses.pop();
        }
      }
    },

    saveRecentLocation(place_data) {
      console.log("place_data", place_data);

      const exists = this.recent_location.some(
        (addr) =>
          addr.state_id === place_data.state_id &&
          addr.city_id === place_data.city_id &&
          addr.area_id === place_data.area_id
      );

      console.log("exists", exists);
      if (exists) {
        return;
      }

      this.recent_location.unshift(place_data);
      if (this.recent_location.length > 8) {
        this.recent_location.pop();
      }
    },

    // Branch selection methods
    selectBranch(branch) {
      this.selected_branch = branch;
    },

    clearBranch() {
      this.selected_branch = null;
    },

    getSelectedBranchId() {
      return this.selected_branch?.branch_id || null;
    },

    // TABLE ORDERING METHODS
    setTableOrder(tableId, tableName = null, tableUuid = null) {
      this.is_table_order = true;
      this.table_id = tableId;
      this.table_name = tableName || `Table ${tableId}`;
      this.table_uuid = tableUuid;
    },

    clearTableOrder() {
      this.is_table_order = false;
      this.table_id = null;
      this.table_name = null;
      this.table_uuid = null;
    },

    getTableId() {
      return this.table_id;
    },

    isTableOrderMode() {
      return this.is_table_order && this.table_id !== null;
    },
  },
});
