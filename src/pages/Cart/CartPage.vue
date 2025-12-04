<template>
  <q-pull-to-refresh @refresh="refreshCart">
    <!-- 🎨 Theme Header -->
    <q-header reveal class="ht-header">
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
          $t("Your Order")
        }}</q-toolbar-title>
        <q-btn
          v-if="CartData.hasItem"
          round
          dense
          unelevated
          icon="las la-trash"
          class="ht-btn-ghost"
          @click="confirmDeleteCart"
        />
      </q-toolbar>
    </q-header>
    <q-page class="ht-page-gradient">
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
        <div class="absolute-top text-center" v-if="loading">
          <q-btn
            :loading="true"
            color="white"
            text-color="primary"
            round
          ></q-btn>
        </div>

        <div class="q-pa-mdx">
          <template v-if="CartData.hasError">
            <div
              class="bg-error text-error q-pa-sm text-caption line-normal q-mb-sm hidden"
            >
              <q-list dense class="myqlist">
                <q-item>
                  <q-item-section avatar>
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
            <div class="flex flex-center hidden">
              <q-btn
                v-if="CartData.cart_data?.out_of_range"
                no-caps
                unelevated
                color="positive"
                rounded
                class="q-pl-xl q-pr-xl"
                @click="this.$refs.ref_addressrecent.modal = true"
              >
                <div class="text-weight-bold text-subtitle2">
                  {{ $t("Change Location") }}
                </div>
              </q-btn>
            </div>
          </template>

          <q-item>
            <q-item-section>
              <q-item-label class="text-body1 text-weight-bold">{{
                $t("Order Summary")
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

          <ItemsListCart
            layout="1"
            :item_visible="5"
            :item_count="CartData.getItems?.length"
            :cart_loading="CartData.loading"
            :cart_uuid="DataStorePersisted.cart_uuid"
            :cart_items="CartData.getItems"
            :cart_subtotal="CartData.getSubtotal"
            @after-updatecart="afterUpdatecart"
            @showItemdetails="showItemdetails"
          >
          </ItemsListCart>

          <q-space class="q-pa-sm"></q-space>

          <q-separator></q-separator>
          <q-item>
            <q-item-section>
              <q-btn
                flat
                no-caps
                color="red"
                class="text-body2 text-weight-bold"
                @click="confirmDeleteCart"
              >
                {{ $t("Empty Cart") }}
              </q-btn>
            </q-item-section>
          </q-item>
        </div>

        <div class="q-pl-md q-pr-md q-mt-sm q-pb-md">
          <SimilarItems
            ref="similar_items"
            @after-addtocart="afterUpdatecart"
            @on-itemView="onItemView"
            @after-itemhide="afterItemhide"
          >
          </SimilarItems>
        </div>

        <q-space class="q-pa-sm"></q-space>

        <!-- 🛒 Theme Footer -->
        <q-footer class="ht-footer q-pa-sm">
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-medium text-body1 ht-text-primary">{{
                $t("Total Price")
              }}</q-item-label>
              <q-item-label class="text-h6 text-weight-bold ht-text-accent">
                {{ CartData.getSubtotal }}
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <q-btn
                v-close-popup
                unelevated
                rounded
                no-caps
                class="full-width ht-btn-primary"
                :label="$t('Checkout')"
                size="lg"
                to="/checkout"
              >
              </q-btn>
            </q-item-section>
          </q-item>
        </q-footer>
      </template>
      <template v-else-if="!CartData.hasItem">
        <EmptyCart></EmptyCart>
      </template>

      <ConfirmDelete ref="ref_delete" @afterConfirm="ClearCart"></ConfirmDelete>

      <component
        :is="AddressRecent"
        ref="ref_addressrecent"
        :isLogin="isLogin"
        @set-location="setLocation"
        @afterChooselocation="afterChooselocation"
      >
      </component>

      <ItemDetails
        ref="item_details"
        :money_config="SettingStore.settings_data?.money_config"
        @after-addtocart="afterUpdatecart"
      ></ItemDetails>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { userCartData } from "stores/CartData";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import auth from "src/api/auth";

export default {
  name: "CartPage",
  components: {
    EmptyCart: defineAsyncComponent(() => import("components/EmptyCart.vue")),
    ItemsListCart: defineAsyncComponent(() =>
      import("components/ItemsListCart.vue")
    ),
    SimilarItems: defineAsyncComponent(() =>
      import("components/SimilarItems.vue")
    ),
    ConfirmDelete: defineAsyncComponent(() =>
      import("components/ConfirmDelete.vue")
    ),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
  },
  setup(props) {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();

    const AddressRecent = defineAsyncComponent(() =>
      SettingStore.search_mode == "location"
        ? import("components/AddressRecentLocation.vue")
        : import("components/AddressRecent.vue")
    );

    return { CartData, DataStorePersisted, AddressRecent, SettingStore };
  },
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    if (!this.CartData.hasItem) {
      this.CartData.getCart(true, null);
    }
  },
  computed: {
    isLogin() {
      return auth.authenticated();
    },
  },
  methods: {
    async afterUpdatecart() {
      try {
        this.loading = true;
        await this.CartData.getCart(false, null);
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    refreshCart(done) {
      setTimeout(() => {
        done();
      }, 300);
      this.CartData.getCart(false, null);
    },
    confirmDeleteCart() {
      this.$refs.ref_delete.ConfirmDelete({
        confirm: this.$t("Clear Cart?"),
        title: this.$t(
          "Are you sure you want to remove all items from your cart?"
        ),
        subtitle: this.$t("This action cannot be undone."),
      });
    },
    async ClearCart() {
      this.$refs.ref_delete.modal = false;
      try {
        this.loading = true;
        const params = new URLSearchParams({
          cart_uuid: this.DataStorePersisted.cart_uuid,
        }).toString();
        await APIinterface.fetchDataGet("clearCart", params);
        this.CartData.getCart(true, null);
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    setLocation(value) {
      this.DataStorePersisted.place_data = value;
      this.DataStorePersisted.coordinates.lat = value?.latitude;
      this.DataStorePersisted.coordinates.lng = value?.longitude;

      if (!value?.address_uuid) {
        this.DataStorePersisted.saveRecentAddress(value);
      }
      this.CartData.getCart(false);
    },
    afterChooselocation(value) {
      this.CartData.getCart(false);
    },
    showItemdetails(value) {
      this.$refs.item_details.showModal(true, value);
    },
    onItemView(value) {
      this.$refs.item_details.showModal(true, value);
    },
  },
};
</script>
