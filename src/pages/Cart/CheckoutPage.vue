<template>
  <q-pull-to-refresh @refresh="refresh">
    <!-- 🎨 Theme Header -->
    <q-header class="ht-header">
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          class="ht-btn-ghost"
        />
        <q-toolbar-title class="text-weight-bold text-white">{{
          $t("Order Confirmation")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="ht-page">
      <template v-if="CartData.loading">
        <div class="q-pa-md">
          <template v-for="items in 3" :key="items">
            <q-skeleton
              height="50px"
              square
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>

          <template v-for="items in 3" :key="items">
            <q-skeleton
              height="180px"
              square
              class="radius10 q-mb-sm"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>
        </div>
      </template>
      <template v-else-if="CartData.hasItem">
        <div class="fixed-top text-center z-max q-pa-xl" v-if="loading">
          <q-btn
            :loading="true"
            color="white"
            text-color="primary"
            round
          ></q-btn>
        </div>

        <div class="q-pa-sm q-gutter-y-sm">
          <!-- TABLE ORDER INFO BANNER - Simplified for Dine-in -->
          <div class="ht-card q-pa-md table-order-banner">
            <div class="flex items-center q-gutter-md">
              <div class="table-icon-box">
                <q-icon name="table_restaurant" size="32px" color="white" />
              </div>
              <div class="flex-1">
                <div class="text-subtitle1 text-weight-bold">{{ DataStorePersisted.table_name || $t("Your Table") }}</div>
                <div class="text-caption" style="opacity: 0.85;">{{ $t("Dine-in Order") }}</div>
              </div>
            </div>
          </div>

          <div class="ht-card q-gutter-y-sm q-pb-md">
            <!-- TABLE ORDER: Transaction type is always dine-in, no toggle needed -->

            <div
              v-if="CartData.hasError"
              class="bg-error text-error q-pa-sm text-caption line-normal"
            >
              <q-list>
                <q-item>
                  <q-item-section avatar class="min-avatar">
                    <q-icon name="eva-info-outline"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <template v-for="error in CartData.getError" :key="error">
                      <div>{{ error }}</div>
                    </template>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- TABLE ORDER: Simplified - no delivery/address options needed -->
            <q-list v-if="CartData.getInstructions">
              <q-item
                class="bg-blue-1 q-mb-sm"
                style="border-radius: 12px; margin: 8px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
              >
                <q-item-section>
                  <div class="flex items-start q-gutter-md">
                    <div class="bg-blue-6 text-white rounded-borders" style="padding: 8px; border-radius: 8px;">
                      <q-icon name="eva-info-outline" size="20px" />
                    </div>
                    <div class="flex-1">
                      <div class="text-subtitle2 text-weight-bold text-blue-10">
                        {{ CartData.getInstructions?.title || "" }}
                      </div>
                      <div class="text-caption text-blue-8 q-mt-sm">
                        {{ CartData.getInstructions?.subtitle || "" }}
                      </div>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="ht-card">
            <q-item dense>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2">{{
                  $t("Your Items")
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>
                  <q-btn
                    flat
                    :label="$t('Add more items')"
                    no-caps
                    color="primary"
                    to="/home"
                  ></q-btn
                ></q-item-label>
              </q-item-section>
            </q-item>
            <q-card-section>
              <ItemsListCart
                layout="2"
                :item_visible="2"
                :item_count="CartData.getItems?.length"
                :cart_loading="CartData.loading"
                :cart_uuid="DataStorePersisted.cart_uuid"
                :cart_items="CartData.getItems"
                :cart_subtotal="CartData.getSubtotal"
                @after-updatecart="afterUpdatecart"
                @showItemdetails="showItemDetails"
              >
              </ItemsListCart>
            </q-card-section>
          </div>

          <!-- TABLE ORDER: No courier tip section needed for dine-in -->

          <div class="ht-card">
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2 ht-text-primary">{{
                  $t("Payment details")
                }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="!CartData.isStrictTowallet">
                <q-item-label>
                  <q-btn
                    flat
                    :label="$t('Change')"
                    no-caps
                    color="primary"
                    to="/payment"
                    padding="0"
                  ></q-btn
                ></q-item-label>
              </q-item-section>
            </q-item>

            <template v-if="CartData.isStrictTowallet">
              <q-item tag="label">
                <q-item-section avatar style="width: 50px">
                  <q-icon color="secondary" name="o_account_balance_wallet" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ CartData.getWallet?.wallet_balance }}</q-item-label
                  >
                  <q-item-label lines="2" caption class="font11">
                    {{ $t("Wallet Balance") }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-else>
              <template
                v-if="SettingStore.settings_data?.digitalwallet_enabled"
              >
                <WalletComponents
                  ref="digital_wallet"
                  :cart_updated="loading"
                  @after-applywallet="afterApplywallet"
                >
                </WalletComponents>
                <q-separator inset></q-separator>
              </template>

              <q-item
                tag="label"
                to="/payment"
              >
                <q-item-section avatar class="min-avatar">
                  <template v-if="CartData.getPayment?.logo">
                    <q-img
                      :src="CartData.getPayment?.logo || ''"
                      style="height: 30px; width: 30px"
                      loading="lazy"
                      fit="scale-down"
                      class="radius8"
                    >
                      <template v-slot:loading>
                        <q-skeleton
                          height="30px"
                          width="30px"
                          square
                          class="bg-grey-2"
                        />
                      </template>
                    </q-img>
                  </template>
                  <template v-else>
                    <q-icon
                      :color="CartData.getPayment ? 'blue-grey-6' : 'red'"
                      :name="
                        CartData.getPayment
                          ? 'eva-credit-card-outline'
                          : 'eva-alert-triangle-outline'
                      "
                    ></q-icon>
                  </template>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{
                      CartData.getPayment?.attr1 || $t("Select payment method")
                    }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ CartData.getPayment?.attr2 || "" }}
                  </q-item-label>
                  <q-item-label v-if="wallet_data" caption>
                    {{ wallet_data?.pay_remaining || "" }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator inset></q-separator>

            </template>

            <template
              v-for="items_discount in CartData.getDiscountapplied"
              :key="items_discount"
            >
              <q-item>
                <q-item-section avatar class="min-avatar">
                  <q-icon name="check_circle" color="green-4"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-green-4">{{
                    items_discount.label
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    icon="eva-trash-outline"
                    no-caps
                    unelevated
                    dense
                    color="red-2"
                    text-color="red-7"
                    @click="removeDiscount(items_discount)"
                  ></q-btn>
                </q-item-section>
              </q-item>
            </template>

            <q-item tag="label" @click="this.$refs.ref_promo.modal = true">
              <q-item-section avatar class="min-avatar">
                <q-icon name="o_local_offer" color="blue-grey-6"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t("Add discount & promo") }}</q-item-label>
              </q-item-section>
              <q-item-section side class="q-mr-xs">
                <q-btn
                  :label="$t('Add')"
                  rounded
                  no-caps
                  color="mygrey1"
                  flat
                  text-color="primary"
                  unelevated
                  @click="this.$refs.ref_promo.modal = true"
                  padding="0"
                ></q-btn>
              </q-item-section>
            </q-item>
            <q-space class="q-pa-sm"></q-space>
          </div>

          <div class="ht-card">
            <q-item dense>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2 ht-text-primary">{{
                  $t("Summary")
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-list dense>
              <template v-for="items in CartData.getSummary" :key="items">
                <q-item>
                  <q-item-section avatar> {{ items.name }} </q-item-section>
                  <q-item-section></q-item-section>
                  <q-item-section side>{{ items.value }}</q-item-section>
                </q-item>
              </template>
              <template v-if="CartData.getPoints">
                <template v-if="CartData.getPoints.points_enabled">
                  <q-item dense>
                    <q-item-section class="text-caption text-green-6">
                      {{ CartData.getPoints.points_label }}
                    </q-item-section>
                  </q-item>
                </template>
              </template>
            </q-list>
          </div>
        </div>
        <!-- end padding -->

        <q-space class="q-pa-sm"></q-space>

        <!-- 🛒 Theme Footer -->
        <q-footer class="ht-footer q-pa-sm">
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-medium text-body1 ht-text-primary">{{
                $t("Total Price")
              }}</q-item-label>
              <q-item-label class="text-h6 text-weight-bold ht-text-accent">
                {{ CartData.getTotal }}
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <q-btn
                v-close-popup
                unelevated
                rounded
                no-caps
                class="full-width"
                :class="CartData.canCheckout ? 'ht-btn-primary' : ''"
                :label="$t('Place Order')"
                size="lg"
                :color="!CartData.canCheckout ? 'grey-4' : ''"
                :text-color="!CartData.canCheckout ? 'grey-6' : ''"
                :disable="!CartData.canCheckout"
                @click="onPlaceorder"
                :loading="loading_submit"
              >
              </q-btn>
            </q-item-section>
          </q-item>
        </q-footer>
      </template>

      <template v-else-if="!CartData.hasItem">
        <EmptyCart></EmptyCart>
      </template>

      <!-- <AddressRecent
        ref="ref_address"
        :isLogin="isLogin"
        @set-location="setLocation"
        redirect="/checkout"
      >
      </AddressRecent> -->

      <component
        :is="AddressRecent"
        ref="ref_address"
        :isLogin="isLogin"
        redirect="/checkout"
        @set-location="setLocation"
        @afterChooselocation="afterChooselocation"
      >
      </component>

      <!-- <AddressDetails
        ref="ref_address_details"
        :is_address_found="CartData.getAddress?.is_address_found"
        :address_data="CartData.getAddressDetails"
        :maps_config="SettingStore.getMapConfig ?? null"
        :delivery_options_data="SettingStore.deliveryOptions"
        @after-saveaddress="afterSaveaddress"
      ></AddressDetails> -->

      <component
        :is="AddressDetails"
        ref="ref_address_details"
        :is_address_found="CartData.getAddress?.is_address_found"
        :address_data="
          SettingStore.search_mode == 'location'
            ? CartData.getAddress
            : CartData.getAddressDetails
        "
        :maps_config="SettingStore.getMapConfig ?? null"
        :delivery_options_data="SettingStore.deliveryOptions"
        :country_id="SettingStore.country_id"
        :enabled_map_selection="
          SettingStore.location_enabled_map_selection || false
        "
        @after-saveaddress="afterSaveaddress"
      ></component>

      <DeliveryTime
        ref="ref_deliverytime"
        :merchant_id="SettingStore.merchant_id"
        :cart_uuid="DataStorePersisted.cart_uuid"
        :save_delivery_date="CartData.geDeliveryDate"
        :save_delivery_time="CartData.geDeliveryTime?.start_time || null"
        :is_persistent="is_persistent"
        @after-saveschedule="getCart(false)"
      >
      </DeliveryTime>

      <PromoDiscount
        ref="ref_promo"
        :cart_uuid="DataStorePersisted.cart_uuid"
        :merchant_id="SettingStore.merchant_id"
        :currency_code="DataStorePersisted.getCurrency"
        :client_uuid="client_uuid"
        @after-applypromo="getCart(false)"
      ></PromoDiscount>

      <ItemDetails
        ref="item_details"
        :money_config="SettingStore.settings_data?.money_config"
        @after-addtocart="afterUpdatecart"
      ></ItemDetails>

      <TimePassedmodal
        ref="ref_timepass"
        @select-anothertime="selectAnothertime"
        @clear-cart="clearCart"
      >
      </TimePassedmodal>

      <StripeComponents
        ref="stripe"
        payment_code="stripe"
        :title="$t('Stripe')"
        @after-payment="afterPayment"
      />
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { userCartData } from "stores/CartData";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import auth from "src/api/auth";
import { useDataStore } from "src/stores/DataStore";
import config from "src/api/config";
// PWA-only: Browser handled via location.href
import { formatDeliveryTime } from "src/utils/DeliveryTimeFormatter";

export default {
  name: "CheckoutPage",
  components: {
    EmptyCart: defineAsyncComponent(() => import("components/EmptyCart.vue")),
    ItemsListCart: defineAsyncComponent(() =>
      import("components/ItemsListCart.vue")
    ),
    TipSelections: defineAsyncComponent(() =>
      import("components/TipSelections.vue")
    ),
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
    DeliveryTime: defineAsyncComponent(() =>
      import("components/DeliveryTime.vue")
    ),
    PromoDiscount: defineAsyncComponent(() =>
      import("components/PromoDiscount.vue")
    ),
    WalletComponents: defineAsyncComponent(() =>
      import("components/WalletComponents.vue")
    ),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
    TimePassedmodal: defineAsyncComponent(() =>
      import("components/TimePassedmodal.vue")
    ),
    CheckoutBooking: defineAsyncComponent(() =>
      import("components/CheckoutBooking.vue")
    ),
  },
  data() {
    return {
      loading: false,
      loading_submit: false,
      transaction_type: null,
      summary_expansion: false,
      wallet_data: null,
      is_persistent: false,
      client_uuid: null,
      is_login: false,
      is_afterpay: false,
      payload: [
        "items",
        "merchant_info",
        "service_fee",
        "delivery_fee",
        "packaging",
        "tax",
        "tips",
        "checkout",
        "discount",
        "distance_local_new",
        "summary",
        "subtotal",
        "total",
        "items_count",
        "check_opening",
        "transaction_info",
        "card_fee",
        "points",
        "points_discount",
        "estimation",
      ],
    };
  },
  setup() {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();

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
      CartData,
      DataStorePersisted,
      SettingStore,
      DataStore,
      AddressRecent,
      AddressDetails,
    };
  },
  mounted() {
    this.is_persistent = false;
    this.is_afterpay = false;
    const is_refresh = this.$route.query.refresh ?? null;

    if (is_refresh) {
      this.CartData.cart_data = null;
      this.$router.replace({
        path: this.$route.path,
        query: {},
      });
    }

    this.is_login = auth.authenticated();
    if (this.is_login) {
      const userInfo = auth.getUser();
      this.client_uuid = userInfo?.client_uuid || null;
    }

    // TABLE ORDER: Force dinein mode
    if (this.DataStorePersisted.isTableOrderMode()) {
      this.transaction_type = "dinein";
      // Auto-set transaction type on server
      this.setTransactionType("dinein");
    }

    this.getCart(true);
  },
  computed: {
    isLogin() {
      return auth.authenticated();
    },
    isWeb() {
      if (!this.$q.capacitor) {
        return true;
      }
      return false;
    },
    // TABLE ORDER MODE
    isTableOrder() {
      return this.DataStorePersisted.isTableOrderMode();
    },
  },
  methods: {
    checkTime() {
      if (this.$refs.ref_timepass) {
        this.$refs.ref_timepass.modal =
          this.CartData.cart_data?.time_already_passed ?? false;
      }
    },
    selectAnothertime() {
      this.$refs.ref_timepass.modal = false;
      this.is_persistent = true;
      this.$refs.ref_deliverytime.modal = true;
    },
    async clearCart() {
      try {
        if (this.$refs.ref_timepass) {
          this.$refs.ref_timepass.modal = false;
        }
        APIinterface.showLoadingBox("", this.$q);
        const params = new URLSearchParams({
          cart_uuid: this.DataStorePersisted.cart_uuid,
        }).toString();
        await APIinterface.fetchDataGet("clearCart", params);
        this.getCart(false);
        this.$router.push("/home");
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async refresh(done) {
      setTimeout(() => {
        done();
      }, 300);
      await this.CartData.getCart(false, this.payload);
    },
    async getCart(cartLoading) {
      try {
        this.loading = true;
        await this.CartData.getCart(cartLoading, this.payload);
        this.transaction_type = this.CartData.geTransactiontype;
      } catch (error) {
      } finally {
        this.loading = false;
      }
      this.checkTime();
    },
    afterUpdatecart() {
      console.log("afterUpdatecart");
      this.getCart(false);
    },
    afterSaveaddress(value) {
      console.log("afterSaveaddress", value);
      if (this.SettingStore.search_mode == "address") {
        this.DataStorePersisted.place_data = value;
        this.DataStorePersisted.coordinates = {
          lat: value.latitude,
          lng: value.longitude,
        };
      } else if (this.SettingStore.search_mode == "location") {
        this.DataStorePersisted.location_data = value;
      }
      this.DataStore.data.address_book = null;
      this.getCart(false);
    },
    afterApplytip() {
      this.getCart(false);
    },
    async setTransactionType(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        await APIinterface.fetchDataPost(
          "setTransactionType",
          "cart_uuid=" +
            this.DataStorePersisted.cart_uuid +
            "&transaction_type=" +
            value
        );
        this.CartData.getCart(false, this.payload);
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    expansionShow() {
      this.summary_expansion = true;
    },
    expansionHide() {
      this.summary_expansion = false;
    },
    async onPlaceorder() {
      const transaction_type = this.CartData.geTransactiontype;
      const payment_method = this.CartData.getPayment;
      const payment_credentials = this.CartData.getPayment?.credentials || null;

      if (transaction_type == "delivery") {
        if (!this.CartData.getAddress?.is_address_found) {
          APIinterface.notify(
            "negative",
            this.$t("Please complete your delivery address to continue."),
            "error_outline",
            this.$q
          );
          return;
        }
      }

      if (transaction_type == "pickup") {
        this.$q
          .dialog({
            title: "Confirm",
            message: this.$t("pickup_collection_confirm"),
            class: "radius28",
            persistent: true,
            ok: {
              unelevated: true,
              rounded: true,
              color: "primary",
              "text-color": "white",
              size: "md",
              label: this.$t("Ok"),
              "no-caps": true,
              class: "text-weight-bold text-subtitle2 q-pl-lg q-pr-lg",
            },
            cancel: {
              unelevated: true,
              rounded: true,
              color: "grey-3",
              "text-color": "black",
              size: "md",
              label: this.$t("Cancel"),
              "no-caps": true,
              class: "text-weight-medium text-subtitle2 q-pl-lg q-pr-lg",
            },
          })
          .onOk(() => {
            this.submitOrder();
          })
          .onCancel(() => {})
          .onDismiss(() => {});
      } else {
        this.submitOrder();
      }

      //
    },
    async submitOrder() {
      const payment_uuid = this.CartData.getPayment?.payment_uuid || null;
      if (!payment_uuid) {
        this.$router.push("/payment");
        return;
      }

      const baseURL =
        process.env.VUE_ROUTER_MODE === "history"
          ? window.location.origin + "/"
          : window.location.origin + "/#/";

      const params = {
        return_url: this.isWeb ? baseURL : null,
        cart_uuid: this.CartData.getCartID,
        payment_uuid: this.CartData.getPayment?.payment_uuid,
        currency_code: this.DataStorePersisted.getCurrency,

        guest_number: this.$refs.checkout_booking
          ? this.$refs.checkout_booking.guest_number
          : "",
        room_uuid: this.$refs.checkout_booking
          ? this.$refs.checkout_booking.room_uuid
          : "",
        table_uuid: this.$refs.checkout_booking
          ? this.$refs.checkout_booking.table_uuid
          : "",
        use_digital_wallet: this.$refs?.digital_wallet?.use_wallet || 0,
        custom_scheme: config.custom_scheme,
      };
      if (this.SettingStore.search_mode == "address") {
        params.address_uuid =
          this.CartData.getAddressDetails?.address_uuid || "";
      } else if (this.SettingStore.search_mode == "location") {
        params.address_uuid = this.CartData.getAddress?.address_uuid || "";
      }

      try {
        this.loading_submit = true;
        const result = await APIinterface.fetchDataByToken(
          "PlaceOrder",
          params
        );

        if (result.details.payment_instructions.method === "offline") {
          this.is_afterpay = true;
          this.$router.replace({
            path: "/checkout/successful",
            query: { order_uuid: result.details.order_uuid },
          });
          setTimeout(() => {
            // CLEAR DATA
            this.CartData.cart_data = null;
            this.DataStorePersisted.cart_uuid = null;
            this.DataStore.cleanData("orderList");
            this.DataStore.cleanData("walletList");
            this.DataStore.cleanData("pointList");
            this.DataStore.cleanData("walletTransactions");
          }, 500);
        } else {
          this.doPayment(result.details);
        }
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading_submit = false;
      }
    },
    doPayment(data) {
      try {
        console.log("data", data.payment_code);
        this.$refs[data.payment_code].PaymentRender(data);
      } catch (error) {
        this.PaymentRender(data);
      }
    },
    async PaymentRender(data) {
      let redirect = data.payment_url;
      if (this.$q.capacitor) {
        await Browser.open({ url: redirect });
      } else {
        location.href = redirect;
      }
    },
    afterPayment(value) {
      console.log("afterPayment", value);
      this.is_afterpay = true;

      this.DataStore.cleanData("orderList");
      this.DataStore.cleanData("walletList");
      this.DataStore.cleanData("pointList");
      this.DataStore.cleanData("walletTransactions");

      this.$router.replace({
        path: "/checkout/successful",
        query: { order_uuid: value.order_uuid },
      });
    },
    setLocation(value) {
      console.log("setLocation", value);
      this.DataStorePersisted.place_data = value;
      this.DataStorePersisted.coordinates.lat = value?.latitude;
      this.DataStorePersisted.coordinates.lng = value?.longitude;

      if (!value?.address_uuid) {
        this.DataStorePersisted.saveRecentAddress(value);
      }
      this.getCart(false);
    },
    afterChooselocation(value) {
      console.log("afterChooselocation", value);
      this.getCart(false);
    },
    AddEditAddress() {
      this.$refs.ref_address_details.modal = true;
    },
    async changeDeliveryType(value) {
      const delivery_type = this.CartData.geDeliverytype;
      console.log("changeDeliveryType", value);
      console.log("delivery_type", delivery_type);
      if (value == "schedule") {
        this.$refs.ref_deliverytime.modal = true;
      } else {
        try {
          APIinterface.showLoadingBox("", this.$q);
          const result = await APIinterface.fetchDataPost(
            "setDeliveryNow",
            "cart_uuid=" + this.DataStorePersisted.cart_uuid
          );
          console.log("result", result);
          this.CartData.getCart(false, this.payload);
        } catch (error) {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        } finally {
          APIinterface.hideLoadingBox(this.$q);
        }
      }
    },
    removeDiscount(value) {
      console.log("removeDiscount", value);
      if (value.discount_type == "points_discount") {
        this.removePoints();
      } else {
        this.removePromo(value);
      }
    },
    async removePromo(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = {
          cart_uuid: this.DataStorePersisted.cart_uuid,
          promo_id: value.discount_id,
          promo_type: value.discount_type,
        };
        await APIinterface.fetchDataByToken("removePromo", params);
        this.getCart(false);
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async removePoints() {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = new URLSearchParams({
          cart_uuid: this.DataStorePersisted.cart_uuid,
        }).toString();
        await APIinterface.fetchDataByTokenPost("removePoints", params);
        this.getCart(false);
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    afterApplywallet(value) {
      const use_wallet = value?.use_wallet || false;
      if (use_wallet) {
        this.wallet_data = value;
      } else {
        this.wallet_data = null;
      }
    },
    showItemDetails(value) {
      this.$refs.item_details.showModal(true, value);
    },
    formatDeliveryTimeDisplay(estimation) {
      // Handle both single values and ranges like "1009-1014"
      if (typeof estimation === 'string' && estimation.includes('-')) {
        const parts = estimation.split('-');
        if (parts.length === 2) {
          const start = parseInt(parts[0].trim());
          const end = parseInt(parts[1].trim());
          return formatDeliveryTime(start, true, end);
        }
      }
      // Handle single numeric values
      const minutes = parseInt(estimation);
      return formatDeliveryTime(minutes);
    },
    //
  },
};
</script>

<style lang="scss" scoped>
/* TABLE ORDER STYLES */
.table-order-banner {
  background: linear-gradient(135deg, var(--ht-primary, #3b82f6) 0%, var(--ht-primary-dark, #3b82f6) 100%);
  color: white;
  border-radius: 16px;
}

.table-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
</style>
