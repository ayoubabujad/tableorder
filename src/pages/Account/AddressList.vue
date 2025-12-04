<template>
  <q-page class="modern-page">
    <!-- 🎨 Animated Background -->
    <div class="modern-gradient-bg"></div>

    <!-- 🔙 Back Button -->
    <div class="modern-back-btn">
      <q-btn
        @click="$router.back()"
        round
        size="md"
        icon="arrow_back"
        class="btn-glass shadow-soft"
      />
    </div>

    <!-- 📍 Address List Container -->
    <div class="address-container">
      <!-- ✨ Header Section -->
      <div class="address-header text-center q-pa-lg">
        <div class="header-icon q-mb-md">
          <div class="icon-wrapper bg-gradient-primary">
            <q-icon name="location_on" size="50px" color="white" />
          </div>
        </div>
        <div class="text-h5 text-weight-bold text-white q-mb-xs">
          {{ $t("My Addresses") }}
        </div>
        <div class="text-body2 text-white-7">
          {{ $t("Manage your delivery locations") }}
        </div>
      </div>

      <!-- 📱 Address List Content -->
      <div class="address-content">
          <q-pull-to-refresh @refresh="refresh">
            <q-list class="q-pa-md">
              <q-virtual-scroll
                class="fit"
                :items="data"
                :virtual-scroll-item-size="120"
                v-slot="{ item: items }"
              >
                <!-- 🏠 Modern Address Card -->
                <div class="address-card-wrapper q-mb-md">
                  <div class="modern-card address-card q-pa-md"
                       @click.stop="setAddress(items)">
                    <div class="row items-center">
                      <!-- 📍 Address Icon -->
                      <div class="col-auto q-mr-md">
                        <div class="address-icon">
                          <q-icon name="home" size="24px" color="white" />
                        </div>
                      </div>

                      <!-- 📝 Address Info -->
                      <div class="col">
                        <div class="text-weight-bold text-subtitle1 text-dark q-mb-xs">
                          {{ items.address_label }}
                        </div>
                        <div class="text-body2 text-grey-7 line-clamp-2">
                          {{ items?.formatted_address || items.complete_address }}
                        </div>
                      </div>

                      <!-- 🗑️ Delete Button -->
                      <div class="col-auto">
                        <q-btn
                          round
                          size="sm"
                          icon="delete_outline"
                          class="delete-btn"
                          @click.stop="ConfirmDelete(items)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </q-virtual-scroll>
            </q-list>

            <q-infinite-scroll
              ref="nscroll"
              @load="fetchData"
              :offset="250"
              :disable="scroll_disabled"
            >
              <template v-slot:default>
                <div v-if="!hasItems && !loading" class="no-data-container">
                  <NoData
                    :message="$t('No address added yet.')"
                    :subtitle="$t('no_address_yet')"
                  />
                </div>
              </template>
              <template v-slot:loading>
                <LoadingData :page="page"></LoadingData>
              </template>
            </q-infinite-scroll>
          </q-pull-to-refresh>

          <!-- 🚀 Add Address Button -->
          <div class="add-address-btn">
            <q-btn
              size="lg"
              rounded
              unelevated
              no-caps
              class="modern-btn-secondary full-width"
              @click="this.$refs.ref_address.modal = true"
            >
              <q-icon name="add_location" size="20px" class="q-mr-sm" />
              <div class="text-weight-bold text-body1">
                {{ $t("Add New Address") }}
              </div>
            </q-btn>
          </div>

        <!-- Hidden Components -->
        <ConfirmDelete
          ref="ref_delete"
          @afterConfirm="afterConfirm"
        ></ConfirmDelete>

        <component
          :is="AddressRecent"
          ref="ref_address"
          :isLogin="false"
          isnew="1"
          redirect="/account/address-list"
          @set-location="setLocation"
          @afterChooselocation="afterChooselocation"
        ></component>

        <component
          :is="AddressDetails"
          ref="ref_address_details"
          :is_address_found="is_address_found"
          :address_data="address_data"
          :maps_config="SettingStore.getMapConfig ?? null"
          :delivery_options_data="SettingStore.deliveryOptions"
          :country_id="SettingStore.country_id"
          :enabled_map_selection="
            SettingStore.location_enabled_map_selection || false
          "
          @after-saveaddress="afterSaveaddress"
        ></component>

        <PageScrollUp></PageScrollUp>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import auth from "src/api/auth";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import config from "src/api/config";

export default {
  name: "AddressList",
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    ConfirmDelete: defineAsyncComponent(() =>
      import("components/ConfirmDelete.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    // AddressRecent: defineAsyncComponent(() =>
    //   import("components/AddressRecent.vue")
    // ),
    // AddressDetails: defineAsyncComponent(() =>
    //   import("components/AddressDetails.vue")
    // ),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();

    const AddressRecent = defineAsyncComponent(() =>
      SettingStore.search_mode == "location"
        ? import("components/AddressRecentLocation.vue")
        : import("components/AddressRecent.vue")
    );

    const AddressDetails = defineAsyncComponent(() =>
      SettingStore.search_mode == "location"
        ? import("components/AddressDetailsLocation.vue")
        : import("components/AddressDetails.vue")
    );

    return {
      DataStore,
      DataStorePersisted,
      SettingStore,
      AddressRecent,
      AddressDetails,
    };
  },
  data() {
    return {
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      page: 1,
      data: [],
      id: null,
      address_data: null,
      is_address_found: false,
      search_mode: null,
      addnew: false,
    };
  },
  computed: {
    isLogin() {
      return auth.authenticated();
    },
    hasItems() {
      if (!this.data) {
        return false;
      }
      return this.data.length > 0;
    },
  },
  mounted() {
    this.search_mode = this.SettingStore.search_mode;
    const isnew = this.$route.query.isnew ?? null;
    if (isnew) {
      this.addnew = true;
      this.$router.replace({
        path: this.$route.path,
        query: {},
      });
    }

    if (this.DataStore.data?.addressList) {
      this.data = this.DataStore.data?.addressList?.data;
      this.page = this.DataStore.data?.addressList?.page;
      this.hasMore = this.DataStore.data?.addressList?.hasMore;
    } else {
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }
    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.addressList = {
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
    };
  },
  watch: {
    addnew(newval, oldval) {
      this.afterChooselocation(this.DataStorePersisted.location_data);
    },
  },
  methods: {
    afterChooselocation(value) {
      console.log("afterChooselocation", value);
      this.address_data = value;
      this.is_address_found = false;
      if (this.$refs.ref_address_details) {
        this.$refs.ref_address_details.modal = true;
      } else {
        setTimeout(() => {
          this.$refs.ref_address_details.modal = true;
        }, 500);
      }
    },
    ConfirmDelete(value) {
      this.$refs.ref_delete.ConfirmDelete({
        id: value.address_uuid,
        title: value.address_label,
        subtitle: value?.formatted_address || value.complete_address,
      });
    },
    async afterConfirm(value) {
      this.$refs.ref_delete.modal = false;
      console.log("afterConfirm", value);
      try {
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchDataByTokenPost(
          "deleteAddress",
          new URLSearchParams({
            address_uuid: value.id,
          })
        );
        console.log("response", response);

        this.data = this.data.filter((item) => item.address_uuid !== value.id);
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async fetchData(index, done) {
      try {
        if (this.loading) {
          return;
        }

        if (!this.hasMore) {
          this.scroll_disabled = true;
          done(true);
          return;
        }
        this.loading = true;
        const params = new URLSearchParams({
          page: this.page,
        }).toString();

        console.log(this.SettingStore.search_mode);

        let response = null;
        if (this.SettingStore.search_mode == "location") {
          response = await APIinterface.fetchGet2(
            `${config.api_location}/fetchLocationAddress`
          );
        } else {
          response = await APIinterface.fetchGet(`getAddresses?${params}`);
        }

        this.page++;
        this.data = [...this.data, ...response.details.data];

        if (response.details?.is_last_page) {
          this.hasMore = false;
          this.scroll_disabled = true;
          done(true);
          return;
        }
        done();
      } catch (error) {
        console.log("error", error);
        this.data = [];
        done(true);
      } finally {
        this.loading = false;
      }
    },
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.resetPagination();
    },
    resetPagination() {
      this.page = 1;
      this.data = [];
      this.hasMore = true;
      this.scroll_disabled = false;

      this.address_data = null;
      this.is_address_found = false;

      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    setLocation(value) {
      this.address_data = value;
      if (value?.address_uuid) {
        this.is_address_found = true;
      } else {
        this.is_address_found = false;
      }
      this.$refs.ref_address_details.modal = true;
    },
    setAddress(value) {
      this.address_data = value;
      this.is_address_found = value?.address_uuid ? true : false;
      this.$refs.ref_address_details.modal = true;
    },
    afterSaveaddress(value) {
      this.resetPagination();

      if (this.SettingStore.search_mode == "location") {
        return;
      }

      this.DataStorePersisted.place_data = value;
      this.DataStorePersisted.coordinates.lat = value?.latitude;
      this.DataStorePersisted.coordinates.lng = value?.longitude;

      if (!value?.address_uuid) {
        this.DataStorePersisted.saveRecentAddress(value);
      }
    },
  },
};
</script>

<style scoped lang="scss">
// 🎨 Address List Specific Styling (using global modern classes as base)

// 📍 Address Container Layout
.address-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// ✨ Header Section
.address-header {
  padding-top: 80px; // Account for back button

  .header-icon {
    display: flex;
    justify-content: center;

    .icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(255, 217, 61, 0.3);
    }
  }
}

// 📱 Address Content Area
.address-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  margin-top: 20px;
  min-height: 60vh;
  overflow: hidden;
}

// 🏠 Address Card Styling
.address-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 217, 61, 0.3);
    box-shadow: 0 12px 40px rgba(142, 68, 173, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.address-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(142, 68, 173, 0.3);
}

.delete-btn {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
    transform: scale(1.1);
  }
}

// 🚀 Add Address Button
.add-address-btn {
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

// 📊 No Data Container
.no-data-container {
  padding: 40px 20px;
  text-align: center;
}

// 📱 Responsive Design
@media (max-width: 600px) {
  .address-header {
    padding: 60px 16px 20px;

    .header-icon .icon-wrapper {
      width: 60px;
      height: 60px;

      .q-icon {
        font-size: 40px !important;
      }
    }
  }

  .address-card {
    margin: 0 8px 12px;
    padding: 16px !important;
  }

  .address-icon {
    width: 40px;
    height: 40px;

    .q-icon {
      font-size: 20px !important;
    }
  }

  .add-address-btn {
    padding: 16px;
  }
}

// 🌙 Dark Mode Support
body.body--dark {
  .address-content {
    background: rgba(42, 42, 58, 0.95);
  }

  .add-address-btn {
    background: rgba(42, 42, 58, 0.95);
  }
}

// 📝 Text Utilities
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: 2.8em;
}
</style>
