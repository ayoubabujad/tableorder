<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
  >
    <q-card class="ht-page">
      <!-- 🎨 Theme Header -->
      <q-toolbar class="ht-header">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold text-white">
            {{ $t("Promo") }}
          </div>
        </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          class="ht-btn-ghost"
        />
      </q-toolbar>
      <!-- 🎫 Promo Input Section -->
      <q-card-section class="q-pa-md">
        <div class="ht-card q-pa-sm">
          <q-input
            v-model="promo_code"
            borderless
            class="q-pl-md q-pr-md"
            :placeholder="$t('Enter promo code')"
            clearable
            clear-icon="eva-close-circle-outline"
          >
            <template v-slot:prepend>
              <q-icon name="o_local_offer" class="ht-text-accent" />
            </template>
            <template v-slot:append>
              <q-btn
                no-caps
                :label="$t('Add')"
                no-wrap
                unelevated
                rounded
                padding="8px 24px"
                :class="promo_code ? 'ht-btn-primary' : ''"
                :color="!promo_code ? 'grey-4' : ''"
                :text-color="!promo_code ? 'grey-6' : ''"
                :loading="loading_addcode"
                :disable="!promo_code"
                @click="AddPromocode"
              ></q-btn>
            </template>
          </q-input>
        </div>
      </q-card-section>

      <!-- <q-space style="height: 8px" class="bg-mygrey1 q-mt-md"></q-space> -->

      <template v-if="loading">
        <div
          class="row q-gutter-x-sm justify-center absolute-center text-center full-width"
        >
          <q-circular-progress
            indeterminate
            rounded
            size="sm"
            color="primary"
          />
          <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
        </div>
      </template>
      <template v-else>
        <!-- 🎁 Available Promos List -->
        <div class="q-pa-md">
          <div class="ht-section-title">
            <q-icon name="o_local_offer" class="ht-text-accent" />
            {{ $t("Available promotions") }}
          </div>

          <template v-if="!CartStore.getPromo">
            <div class="ht-empty-state">
              <div class="ht-empty-icon">
                <q-icon name="o_local_offer" />
              </div>
              <div class="ht-empty-title">{{ $t("No available promo") }}</div>
            </div>
          </template>

          <template v-for="items in CartStore.getPromo" :key="items">
            <div
              class="ht-list-item"
              @click="!loading_addcode ? Onselectpromo(items) : false"
            >
              <div class="flex items-start q-gutter-md">
                <div class="ht-icon-box">
                  <q-icon name="discount" size="24px" />
                </div>
                <div class="flex-1">
                  <div class="text-weight-bold text-body1 ht-text-primary">
                    {{ items.title }}
                  </div>
                  <div class="ht-text-secondary text-caption q-mt-xs">
                    {{ items.sub_title }}
                  </div>
                  <div v-if="items.max_spend" class="ht-text-secondary text-caption">
                    {{ items.max_spend }}
                  </div>
                  <div v-if="items.max_cap" class="ht-text-secondary text-caption">
                    {{ items.max_cap }}
                  </div>
                  <div v-if="items.valid_to" class="ht-text-secondary text-caption">
                    {{ items.valid_to }}
                  </div>
                </div>
                <q-btn
                  v-if="items.promo_type != 'points'"
                  no-caps
                  unelevated
                  rounded
                  class="ht-btn-secondary"
                  padding="8px 16px"
                >
                  <div class="text-weight-bold">
                    {{ $t("Use now") }}
                  </div>
                </q-btn>
              </div>
            </div>
          </template>
        </div>
      </template>
    </q-card>
  </q-dialog>

  <PointsCart
    ref="ref_points"
    :cart_uuid="cart_uuid"
    :currency_code="currency_code"
    :merchant_id="merchant_id"
    @after-applypoints="afterApplypromo"
  ></PointsCart>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { userCartData } from "src/stores/CartData";
import { defineAsyncComponent } from "vue";

export default {
  name: "PromoDiscount",
  props: ["merchant_id", "currency_code", "client_uuid", "cart_uuid"],
  components: {
    PointsCart: defineAsyncComponent(() => import("components/PointsCart.vue")),
  },
  setup() {
    const CartStore = userCartData();
    return { CartStore };
  },
  data() {
    return {
      modal: false,
      promo_code: null,
      loading: false,
      loading_addcode: false,
    };
  },
  methods: {
    afterApplypromo() {
      this.modal = false;
      this.$emit("afterApplypromo");
    },
    async onBeforeShow() {
      try {
        this.promo_code = null;
        this.loading = true;
        const results = await this.CartStore.fetchPromo({
          merchant_id: this.merchant_id,
          client_uuid: this.client_uuid,
          currency_code: this.currency_code,
        });
        console.log("results", results);
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading = false;
      }
    },
    async Onselectpromo(value) {
      console.log("value", value);
      if (value.promo_type == "points") {
        this.$refs.ref_points.balance = value.balance;
        this.$refs.ref_points.use_thresholds = value.use_thresholds;
        this.$refs.ref_points.modal = true;
        return;
      }

      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = {
          cart_uuid: this.cart_uuid,
          promo_id: value.promo_id,
          promo_type: value.promo_type,
          currency_code: this.currency_code,
        };
        console.log("params", params);
        await APIinterface.fetchDataPost("applyPromodiscount", params);
        this.afterApplypromo();
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },

    async AddPromocode() {
      try {
        this.loading_addcode = true;
        const params = new URLSearchParams({
          cart_uuid: this.cart_uuid,
          promo_code: this.promo_code,
        }).toString();
        await APIinterface.fetchDataByTokenPost("applyPromoCode", params);
        this.modal = false;
        this.$emit("afterApplypromo");
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading_addcode = false;
      }
    },
  },
};
</script>
