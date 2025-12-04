<template>
  <!-- 🎨 Theme Header -->
  <q-header class="ht-header">
    <q-toolbar>
      <q-btn
        v-if="isCanBack"
        dense
        icon="close"
        @click="$router.back()"
        round
        unelevated
        class="ht-btn-ghost"
      />
      <q-btn
        v-else
        dense
        icon="close"
        to="/orders"
        round
        unelevated
        class="ht-btn-ghost"
      />
      <q-space></q-space>
      <q-btn flat dense no-caps class="text-white">
        <div>{{ $t("Order Help") }}</div>
      </q-btn>
    </q-toolbar>
  </q-header>
  <q-page class="ht-page relative-position">
    <template v-if="loading">
      <div
        class="row q-gutter-x-sm justify-center absolute-center text-center full-width"
      >
        <q-circular-progress indeterminate rounded size="sm" color="primary" />
        <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
      </div>
    </template>
    <template v-else>
      <!-- 🌟 Hero Section -->
      <div class="ht-header" style="height: calc(15vh)"></div>

      <div class="q-pa-md absolute-top q-gutter-y-md">
        <!-- 📦 Order Status Card -->
        <div class="ht-card-elevated q-pb-md q-pl-sm q-pr-sm">
          <q-list dense>
            <q-item>
              <q-item-section>
                <q-item-label>
                  <div class="ht-text-secondary">
                    <template v-if="progress_data?.is_order_ongoing">
                      {{ $t("Delivery in") }}
                    </template>
                    <template v-else>
                      {{ progress_data?.order_status_details }}
                    </template>
                  </div>
                </q-item-label>
                <q-item-label class="text-h5 text-weight-bold ht-text-primary">
                  {{ formatEstimatedTime(progress_data) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <OrderStatusAnimation :status="getImageProgress" />
              </q-item-section>
            </q-item>

            <TrackProgress
              :order_type="getOrderType"
              :order_progress="getProgress"
            ></TrackProgress>

            <div class="q-pl-md q-pr-md hidden">
              <div class="row items-center justify-center">
                <template v-for="(items, index) in orderSteps" :key="items">
                  <div class="col-md-auto">
                    <q-icon
                      :name="items.icon"
                      size="sm"
                      :color="
                        order_progress >= items.progress ? 'primary' : 'grey'
                      "
                    ></q-icon>
                  </div>
                  <div class="col" v-if="orderSteps.length > index + 1">
                    <div class="q-pl-xs q-pr-xs">
                      <q-linear-progress
                        rounded
                        size="8px"
                        :value="order_progress >= items.progress ? 1 : 0"
                        :indeterminate="
                          order_progress == items.progress ? true : false
                        "
                      />
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <q-space class="q-pa-xs"></q-space>
            <q-item>
              <q-item-section>
                <q-item-label>
                  <div
                    class="text-body2 ht-text-secondary"
                    :class="{ 'text-warning': isWarning }"
                  >
                    {{ progress_data?.order_status }}
                  </div>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="showCancel"
                  :label="$t('Cancel')"
                  no-caps
                  unelevated
                  flat
                  padding="0"
                  class="text-weight-bold ht-text-accent"
                  @click="this.$refs.cancel_order.showModal(order_uuid)"
                ></q-btn>

                <q-btn
                  v-if="progress_data?.completed"
                  no-caps
                  unelevated
                  rounded
                  class="ht-btn-secondary"
                  :disabled="isReviewed"
                  @click="showReview"
                >
                  <div class="text-caption text-weight-bold">
                    {{ $t("Add Review") }}
                  </div>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 📱 WhatsApp Confirm -->
        <template
          v-if="data?.enabled_whatsapp && progress_data?.is_order_ongoing"
        >
          <div class="text-center">
            <q-btn
              color="green"
              text-color="white"
              no-caps
              unelevated
              rounded
              size="md"
              target="_blank"
              :href="data?.whatsapp_confirm_url ?? null"
              icon="fab fa-whatsapp"
              class="q-px-lg"
            >
              <div class="text-weight-bold q-ml-sm">
                {{ $t("Confirm order via WhatsApp") }}
              </div>
            </q-btn>
          </div>
        </template>

        <!-- 🚗 Driver Card -->
        <div
          class="ht-card"
          v-if="showDriver && data?.order_info?.order_type == 'delivery'"
        >
          <q-item>
            <q-item-section avatar top>
              <q-avatar>
                <img :src="progress_data?.driver_info?.photo" />
              </q-avatar>
            </q-item-section>
            <q-item-section top>
              <q-item-label class="text-weight-bold">{{
                progress_data?.driver_info?.full_name
              }}</q-item-label>
              <q-item-label
                caption
                v-if="progress_data?.driver_info?.car_maker"
              >
                {{ progress_data?.driver_info?.car_maker }} &bull;
                {{ progress_data?.driver_info?.plate_number }}
              </q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="flex items-center text-caption q-gutter-x-xs">
                <div>
                  <q-icon name="star" color="amber-5" size="17px"></q-icon>
                </div>
                <div class="text-weight-bold">
                  {{ progress_data?.driver_info?.average_rating }}
                </div>
              </div>
            </q-item-section>
          </q-item>

          <div class="row q-pl-md q-pr-md q-gutter-x-md q-pb-md">
            <div class="col" v-if="SettingStore.settings_data?.chat_enabled">
              <q-btn
                outline
                no-caps
                rounded
                class="fit"
                dense
                color="grey"
                :to="{
                  path: '/account/chat/conversation',
                  query: {
                    chat_type: 'driver',
                    order_uuid: 'ORD-' + this.order_uuid,
                    order_id: data?.order_info?.order_id,
                    client_uuid: progress_data?.driver_info?.driver_uuid,
                    name: progress_data?.driver_info?.full_name,
                    first_name: progress_data?.driver_info?.last_name,
                    last_name: progress_data?.driver_info?.last_name,
                    avatar: progress_data?.driver_info?.photo,
                  },
                }"
              >
                <div class="text-dark">{{ $t("Chat rider") }}</div>
              </q-btn>
            </div>
            <div class="col">
              <q-btn
                outline
                no-caps
                rounded
                class="fit"
                dense
                color="grey"
                :href="'tel:' + progress_data?.driver_info?.phone || ''"
              >
                <div class="text-dark">{{ $t("Call") }}</div>
              </q-btn>
            </div>
          </div>
          <div class="q-pl-md q-pr-md q-pb-md" v-if="showTracking">
            <div
              class="ht-card relative-position"
              style="height: calc(40vh); overflow: hidden;"
            >
              <MapComponents
                ref="mapRef"
                class="maps"
                size="fit"
                :keys="SettingStore.getMapConfig?.key"
                :provider="SettingStore.getMapConfig?.provider"
                :zoom="SettingStore.getMapConfig?.zoom"
                :language="SettingStore.getMapConfig?.language"
                :map_style="SettingStore.getMapConfig?.map_custom_style"
                :center="map_center"
                :markers="map_marker"
                :map_controls="true"
                :controls_center="true"
                @after-selectmap="afterSelectmap"
              />
            </div>
          </div>
        </div>

        <!-- 📍 Order Info Card -->
        <div class="ht-card">
          <q-item dense>
            <q-item-section>
              <q-item-label>{{ $t("Order ID") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>#{{ data?.order_info?.order_id }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold text-capitalize">{{
                data?.order_info?.customer_name
              }}</q-item-label>
              <q-item-label
                v-if="data?.order_info?.order_type == 'delivery'"
                class="text-dark text-caption"
                >{{ getDeliveryAddress }}</q-item-label
              >

              <q-item-label class="text-dark text-caption">
                {{ data?.order_info?.contact_number }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>

        <!-- 🏪 Merchant Card -->
        <div class="relative-position">
          <div class="ht-card" style="z-index: 9">
            <q-item>
              <q-item-section avatar top>
                <q-img
                  :src="getMerchant?.url_logo"
                  style="height: 60px; width: 60px"
                  loading="lazy"
                  fit="cover"
                  class="radius8"
                >
                  <template v-slot:loading>
                    <q-skeleton
                      height="60px"
                      width="60px"
                      square
                      class="bg-grey-2"
                    />
                  </template>
                </q-img>
              </q-item-section>
              <q-item-section top>
                <q-item-label caption lines="1">
                  <span
                    v-for="cuisine in getMerchant?.cuisine"
                    :key="cuisine"
                    class="q-mr-xs"
                  >
                    {{ cuisine.cuisine_name }} &bullet;</span
                  >
                </q-item-label>
                <q-item-label class="text-weight-bold">{{
                  getMerchant?.restaurant_name
                }}</q-item-label>
                <q-item-label class="text-dark text-caption">
                  {{ getMerchant?.merchant_address }}
                </q-item-label>

                <q-item-label>
                  <div class="q-gutter-x-md flex justify-end">
                    <q-btn
                      v-if="SettingStore.settings_data?.chat_enabled"
                      unelevated
                      color="blue-grey-1"
                      text-color="blue-grey-8"
                      no-caps
                      rounded
                      icon="eva-message-circle-outline"
                      :to="{
                        path: '/account/chat/conversation',
                        query: {
                          chat_type: 'order',
                          order_uuid: this.order_uuid,
                          order_id: data?.order_info?.order_id,
                          client_uuid: getMerchant?.merchant_uuid,
                          name: getMerchant?.restaurant_name,
                          first_name: getMerchant?.restaurant_name,
                          last_name: '',
                          avatar: getMerchant?.url_logo,
                        },
                      }"
                    >
                    </q-btn>

                    <q-btn
                      unelevated
                      color="blue-grey-1"
                      text-color="blue-grey-8"
                      no-caps
                      rounded
                      icon="eva-phone-outline"
                      :href="'tel:' + data?.merchant_info?.contact_phone || ''"
                    >
                    </q-btn>

                    <q-btn
                      v-if="data?.order_info?.order_type != 'delivery'"
                      unelevated
                      color="blue-grey-1"
                      text-color="blue-grey-8"
                      no-caps
                      rounded
                      icon="eva-navigation-2-outline"
                      target="_blank"
                      :href="`https://www.google.com/maps/dir/?api=1&destination=${getMerchant?.latitude},${getMerchant?.longitude}`"
                    >
                    </q-btn>
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <!-- Total Badge -->
          <div
            class="ht-badge-light"
            style="
              border-bottom-left-radius: 15px;
              border-bottom-right-radius: 15px;
              margin-top: -6px;
              padding: 12px 16px;
            "
          >
            <div class="flex justify-between items-center">
              <div class="text-weight-bold ht-text-primary">
                {{ $t("Total") }}
              </div>
              <div class="text-weight-bold text-h6 ht-text-accent">
                {{ data?.order_info?.total_from_used_currency_to_based_currency_pretty }}
              </div>
            </div>
          </div>
        </div>

        <q-space class="q-pa-sm"></q-space>

        <!-- 👁️ View Summary Button -->
        <div class="text-center">
          <q-btn
            no-caps
            unelevated
            rounded
            size="lg"
            class="fit ht-btn-primary"
            @click="this.$refs.ref_orderdetails.modal = true"
          >
            <div class="text-weight-bold text-subtitle2">
              {{ $t("View order summary") }}
            </div>
          </q-btn>
        </div>
        <q-space class="q-pa-sm"></q-space>
      </div>
      <!-- absolute top -->
    </template>

    <TrackDriver
      ref="ref_trackdriver"
      @set-driverlocation="setDriverlocation"
    ></TrackDriver>

    <OrderDetails
      ref="ref_orderdetails"
      :order_uuid="order_uuid"
      @onclose-order="oncloseOrder"
      :show_actions="false"
      @on-ratereview="showReview"
    ></OrderDetails>

    <CancelOrder
      ref="cancel_order"
      @after-cancelorder="afterCancelorder"
    ></CancelOrder>

    <AddReview
      ref="ref_revieworder"
      @after-addreview="afterAddreview"
    ></AddReview>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
// PWA-only: No Capacitor App needed
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "src/stores/SettingStore";
import { useDataStore } from "src/stores/DataStore";
import { userCartData } from "stores/CartData";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
import { formatDeliveryTime } from "src/utils/DeliveryTimeFormatter";

export default {
  name: "CheckoutSuccesful",
  components: {
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
    MapComponents: defineAsyncComponent(() =>
      import("components/MapComponents.vue")
    ),
    TrackDriver: defineAsyncComponent(() =>
      import("components/TrackDriver.vue")
    ),
    CancelOrder: defineAsyncComponent(() =>
      import("components/CancelOrder.vue")
    ),
    OrderDetails: defineAsyncComponent(() =>
      import("components/OrderDetails.vue")
    ),
    AddReview: defineAsyncComponent(() => import("components/AddReview.vue")),
    TrackProgress: defineAsyncComponent(() =>
      import("components/TrackProgress.vue")
    ),
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStore, CartData, DataStorePersisted };
  },
  data() {
    return {
      order_progress: 1,
      progress_data: null,
      step: 3,
      loading: false,
      order_uuid: "",
      data: null,
      fetch_error: null,
      order_cancelled: null,
      timer: null,
      request_interval: 50000,
      map_marker: {},
      map_center: {},
      driver_coordinates: null,
      loading_chat: false,
      from_info: null,
      to_info: null,
      lottieInstance: null,
      back_url: null,
      isCanBack: null,
      backButtonListener: null,
      orderSteps: [
        { progress: 1, icon: "check_box" },
        { progress: 2, icon: "room_service" },
        { progress: 3, icon: "moped" },
        { progress: 4, icon: "home" },
      ],
    };
  },
  mounted() {
    this.CartData.cart_data = null;
    this.DataStorePersisted.cart_uuid = null;
    this.DataStore.cleanData("orderList");
    this.DataStore.cleanData("walletList");
    this.DataStore.cleanData("pointList");
    this.DataStore.cleanData("walletTransactions");

    this.order_uuid = this.$route.query.order_uuid;
    this.back_url = this.$route.query?.back_url ?? null;
    this.isCanBack = this.$route.query?.back ?? null;
    this.isCanBack = this.isCanBack == 1 ? true : false;

    let user = auth.getUser();

    this.from_info = {
      client_uuid: user.client_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      photo: user.avatar,
      user_type: "customer",
    };

    this.getOrder();

    if (this.$q.platform.is.android && !this.back_url) {
      App.addListener("backButton", this.handleBackButton).then((listener) => {
        this.backButtonListener = listener;
      });
    }

    this.$watch(
      () => this.DataStore.$state.receive_eventTracking,
      (newData, oldData) => {
        console.log("receive_eventTracking", newData);
        this.order_progress = newData.order_progress;
        this.progress_data = newData;
      }
    );
    //
  },
  beforeUnmount() {
    if (this.backButtonListener) {
      this.backButtonListener.remove();
    }
  },
  computed: {
    getProgress() {
      return this.order_progress;
    },
    isReviewed() {
      return this.data?.is_reviewed ? this.data.is_reviewed : false;
    },
    getMerchant() {
      return this.data?.merchant_info ? this.data.merchant_info : null;
    },
    orderInfo() {
      return this.data?.order_info ? this.data.order_info : null;
    },
    driverInfo() {
      // return this.data?.progress?.driver_info
      //   ? this.data.progress.driver_info
      //   : null;

      if (this.data?.progress?.driver_info) {
        return this.data.progress.driver_info;
      }

      if (this.progress_data?.driver_info) {
        return this.progress_data?.driver_info;
      }

      return null;
    },
    showDriver() {
      return this.progress_data?.driver_info;
    },
    showCancel() {
      const is_order_ongoing = this.progress_data?.is_order_ongoing ?? true;
      if (!is_order_ongoing) {
        return false;
      }
      if (!this.SettingStore.settings_data?.cancel_order_enabled) {
        return false;
      }
      return this.progress_data?.is_order_need_cancellation ?? false;
    },
    getOrderType() {
      return this.data?.order_info?.order_type ?? "";
    },
    showTracking() {
      if (this.data) {
        if (
          this.data.order_info.order_type == "delivery" &&
          this.order_progress == 3
        ) {
          return true;
        }
      }
      return false;
    },
    getDeliveryAddress() {
      let completeAdddres = "";
      if (this.data) {
        completeAdddres += this.data.order_info.address_label;
        completeAdddres += " - ";
        completeAdddres += this.data.order_info.complete_delivery_address;
      }
      return completeAdddres;
    },
    getImageProgress() {
      let results = "";
      if (this.data) {
        if (this.data.order_info.order_type == "delivery") {
          switch (this.order_progress) {
            case 0:
              results = "failed";
              break;
            case 1:
              results = "received";
              break;
            case 2:
              results = "preparing";
              break;
            case 3:
              results = "delivering";
              break;
            case 4:
              results = "completed";
              break;
            default:
              results = "receive";
              break;
          }
        } else {
          switch (this.order_progress) {
            case 0:
              results = "failed";
              break;
            case 1:
              results = "receive";
              break;
            case 2:
              results = "preparing";
              break;
            case 3:
              results = ""; // Remove animation for pickup status
              break;
            case 4:
              results = "completed";
              break;
            default:
              results = "received";
              break;
          }
        }
      }
      return results;
    },
    isWarning() {
      if (!this.progress_data) {
        return;
      }
      return (
        this.progress_data?.is_order_late ||
        this.progress_data?.is_preparation_late ||
        this.progress_data?.is_driver_delivering_late ||
        !this.progress_data?.is_order_ongoing
      );
    },
  },
  watch: {
    order_progress(newval, oldval) {
      console.log("order_progress change", newval);
      if (this.showTracking) {
        this.doFirebaseTrack();
      }
    },
  },
  methods: {
    handleBackButton() {
      setTimeout(() => {
        if (this.isCanBack) {
          this.$router.back();
        } else {
          this.$router.replace({ path: "/orders" });
        }
      }, 50);
    },
    async getOrder() {
      try {
        this.loading = true;
        const result = await APIinterface.fetchDataByTokenPost(
          "getOrder",
          "order_uuid=" + this.order_uuid
        );

        this.data = result.details;
        this.order_progress = this.data.progress.order_progress;
        this.progress_data = this.data.progress;

        this.map_center = {
          lat: parseFloat(this.data.merchant_info.latitude),
          lng: parseFloat(this.data.merchant_info.longitude),
        };

        if (this.data.progress.is_order_ongoing && !this.timer) {
          this.timer = setInterval(() => {
            this.trackOrder();
          }, this.request_interval);
        }
      } catch (error) {
        console.log("error", error);
        this.fetch_error = error;
        APIinterface.notify("negative", error, "error_outline", this.$q);
        this.data = null;
        setTimeout(() => {
          //this.$router.replace("/home");
        }, 100);
      } finally {
        this.loading = false;
      }
    },
    async trackOrder() {
      try {
        const results = await APIinterface.fetchDataByTokenGet("trackOrder", {
          order_uuid: this.order_uuid,
        });
        console.log("trackOrder", results);
        console.log("order_progress", results.details.data.order_progress);

        this.order_progress = results.details.data.order_progress;
        this.progress_data = results.details.data;

        if (!results.details.data.is_order_ongoing) {
          this.stopTimer();
        }
      } catch (error) {
        console.log("error", error);
      } finally {
      }
    },
    stopTimer() {
      clearInterval(this.timer);
    },
    doFirebaseTrack() {
      console.log("doFirebaseTrack");
      this.addTrackMarker();

      setTimeout(() => {
        if (this.$refs.ref_trackdriver) {
          this.$refs.ref_trackdriver.driver_uuid = this.driverInfo?.driver_uuid;
        }
      }, 100);
    },
    addTrackMarker() {
      // restaurant
      if (this.getMerchant?.latitude && !this.map_marker[1]) {
        this.map_marker[1] = {
          lat: parseFloat(this.getMerchant?.latitude),
          lng: parseFloat(this.getMerchant?.longitude),
          label: "test",
          icon:
            this.SettingStore.getMapConfig?.provider == "mapbox"
              ? "marker_icon_merchant"
              : this.SettingStore.getMapConfig?.icon_merchant,
          draggable: false,
          title: this.getMerchant.address,
          id: 1,
        };
      }

      // customer location
      if (this.orderInfo?.longitude && !this.map_marker[2]) {
        this.map_marker[2] = {
          lat: parseFloat(this.orderInfo?.latitude),
          lng: parseFloat(this.orderInfo?.longitude),
          label: "",
          icon:
            this.SettingStore.getMapConfig?.provider == "mapbox"
              ? "marker_icon_destination"
              : this.SettingStore.getMapConfig?.icon_destination,
          draggable: false,
          title: this.orderInfo?.complete_delivery_address,
          id: 2,
        };
      }

      // driver
      console.log("driverInfo", this.driverInfo);
      if (this.driverInfo && !this.map_marker[3]) {
        this.map_marker[3] = {
          lat: parseFloat(this.driverInfo?.latitude),
          lng: parseFloat(this.driverInfo?.lontitude),
          label: "",
          icon:
            this.SettingStore.getMapConfig?.provider == "mapbox"
              ? "marker_icon_rider"
              : this.SettingStore.getMapConfig?.icon_rider,
          draggable: false,
          title: this.driverInfo?.full_name,
          id: 3,
        };
      }
    },
    setDriverlocation(data) {
      console.log("setDriverlocation", data);

      if (!data) {
        return;
      }

      this.driver_coordinates = {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
      };

      let driverCoords = null;

      if (this.SettingStore.getMapConfig?.provider == "mapbox") {
        driverCoords = [parseFloat(data.lng), parseFloat(data.lat)];
      } else {
        driverCoords = {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        };
      }

      if (this.map_marker[3]) {
        setTimeout(() => {
          if (!this.$refs.mapRef) {
            return;
          }
          this.$refs.mapRef.setNewCoordinates(driverCoords, 3);
          this.addDriverRoute();
        }, 100);
      } else {
        if (this.driverInfo) {
          this.map_marker[3] = {
            lat: parseFloat(this.driverInfo?.latitude),
            lng: parseFloat(this.driverInfo?.lontitude),
            label: "",
            icon:
              this.SettingStore.getMapConfig?.provider == "mapbox"
                ? "marker_icon_rider"
                : this.SettingStore.getMapConfig?.icon_rider,
            draggable: false,
            title: this.driverInfo?.full_name,
            id: 3,
          };
          this.$refs.mapRef.insertMarker(this.map_marker[3]);
          this.addDriverRoute();
        }
      }
    },
    addDriverRoute() {
      if (!this.data?.progress?.is_order_ongoing) {
        return;
      }
      console.log("addDriverRoute");

      if (this.map_marker[1]) {
        this.$refs.mapRef.removeMarkers(1);
      }
      let startLocation, endLocation;

      console.log("driver_coordinates", this.driver_coordinates);

      const provider = this.SettingStore.getMapConfig?.provider;
      if (provider == "mapbox") {
        startLocation = [
          parseFloat(this.driver_coordinates.lng),
          parseFloat(this.driver_coordinates.lat),
        ];
        endLocation = [
          parseFloat(this.orderInfo?.longitude),
          parseFloat(this.orderInfo?.latitude),
        ];
      } else if (provider == "google.maps") {
        startLocation = {
          lat: parseFloat(this.driver_coordinates.lat),
          lng: parseFloat(this.driver_coordinates.lng),
        };
        endLocation = {
          lat: parseFloat(this.orderInfo?.latitude),
          lng: parseFloat(this.orderInfo?.longitude),
        };
      }
      this.$refs.mapRef.addRoute(startLocation, endLocation);
    },
    oncloseOrder(value) {
      console.log("oncloseOrder", value);
      if (value) {
        this.getOrder();
      }
    },
    showReview() {
      let itemList = [];
      Object.entries(this.data?.items).forEach(([key, items]) => {
        itemList.push({
          item_token: items.item_token,
          item_name: items.item_name,
          item_id: items?.item_id,
          rating: 0,
        });
      });

      this.$refs.ref_revieworder.show({
        order_uuid: this.order_uuid,
        restaurant_name: this.data?.merchant_info?.restaurant_name,
        merchant_logo: this.data?.merchant_info?.url_logo,
        items: itemList,
      });
    },
    afterAddreview() {
      console.log("afterAddreview");
      this.$refs.ref_orderdetails.modal = false;
      this.getOrder();
    },
    afterCancelorder() {
      this.$refs.cancel_order.show_modal = false;
      this.order_cancelled = true;
      this.getOrder();
    },
    formatEstimatedTime(progressData) {
      // If we have raw estimation time in minutes, use it
      if (progressData?.estimated_time_minutes) {
        return formatDeliveryTime(progressData.estimated_time_minutes);
      }

      // Fallback to the formatted time if raw data is not available
      return progressData?.estimated_time || '';
    },
    //
  },
};
</script>
