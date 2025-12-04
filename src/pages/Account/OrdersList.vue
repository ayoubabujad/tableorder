<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="ht-page-gradient q-pa-md">
      <!-- 🎨 Theme Tabs -->
      <div class="ht-tabs flex justify-center q-gutter-sm q-mb-md">
        <template v-for="items in tabList" :key="items">
          <div
            class="ht-tab"
            :class="{ 'active': tabs === items.value }"
            @click="tabs = items.value; resetPagination()"
          >
            {{ items.label }}
          </div>
        </template>
      </div>
      <!-- <q-separator></q-separator> -->

      <q-space class="q-pa-sm"></q-space>

      <q-virtual-scroll
        class="fit"
        :items="data"
        :virtual-scroll-item-size="60"
        v-slot="{ item: items }"
      >
        <div class="hidden">{{ items }}</div>
        <!-- 🎨 Theme Order Card -->
        <div class="ht-card q-mb-md ht-animate-in">
          <q-item clickable @click="viewOrder(items)" class="q-pa-md">
            <q-item-section avatar top class="hidden">
              <q-img
                :src="items.merchant_logo"
                style="height: 80px; width: 80px"
                loading="lazy"
                fit="contain"
                class="radius8"
                ratio="9/16"
              >
                <template v-slot:loading>
                  <q-skeleton
                    height="80px"
                    width="80px"
                    square
                    class="bg-grey-2"
                  />
                </template>
              </q-img>
            </q-item-section>
            <q-item-section top>
              <q-item-label class="text-weight-bold text-body1 ht-text-primary"
                >{{ $t("Order") }} #{{ items.order_id }}</q-item-label
              >

              <q-item-label class="ht-text-secondary q-mt-xs">{{ items.date_created }}</q-item-label>
              <q-item-label class="q-gutter-x-sm q-mt-sm">
                <span class="ht-badge">
                  {{ items.status }}
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-item-label class="text-h6 text-weight-bold ht-text-accent">{{
                items.total
              }}</q-item-label>
              <q-item-label class="ht-text-secondary"> {{ items.earn_points }}</q-item-label>
              <q-item-label>
                <div
                  v-if="items.ratings > 0"
                  class="flex items-center q-gutter-x-xs"
                >
                  <q-icon name="star" color="amber-5" size="1.5em"></q-icon>
                  <div class="text-weight-bold">{{ items.ratings }}</div>
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>

          <div class="q-pa-xs"><q-separator></q-separator></div>

          <div v-if="items.is_order_ongoing" class="q-pa-sm">
            <TrackProgress
              :order_type="items.order_type"
              :order_progress="items?.progress?.order_progress"
            ></TrackProgress>
          </div>
          <div class="flex justify-betweenx items-center q-gutter-x-sm">
            <q-btn
              v-if="items.show_review"
              no-caps
              unelevated
              class="q-pl-sm q-pr-sm"
              color="lightblue"
              text-color="blue-grey-6"
              flat
              @click="showReview(items)"
            >
              <q-icon
                name="star"
                color="amber-5"
                size="1.5em"
                class="q-mr-xs"
              ></q-icon>
              <div class="text-caption text-weight-bold">
                {{ $t("Add Review") }}
              </div>
            </q-btn>

            <q-btn
              v-if="items.show_review_delivery && !items.show_review"
              no-caps
              unelevated
              class="q-pl-sm q-pr-sm"
              color="lightblue"
              text-color="blue-grey-6"
              flat
              @click="addDriverReview(items)"
            >
              <q-icon
                name="delivery_dining"
                color="lightblue"
                size="1.5em"
                class="q-mr-xs"
              ></q-icon>
              <div class="text-caption text-weight-bold">
                {{ $t("Review Driver") }}
              </div>
            </q-btn>

            <q-btn
              v-if="!items.is_order_ongoing"
              no-caps
              unelevated
              rounded
              class="ht-btn-secondary"
              @click="reOrder(items)"
            >
              <q-icon
                name="refresh"
                size="1.5em"
                class="q-mr-xs"
              ></q-icon>
              <div class="text-weight-medium">
                {{ $t("Reorder") }}
              </div>
            </q-btn>

            <!-- <q-btn
              v-if="!items.is_order_ongoing"
              no-caps
              unelevated
              outline
              rounded
              class="border-blue none-border q-pl-sm q-pr-sm"
              dense
            >
              <q-icon
                name="refresh"
                color="blue-8"
                size="1.5em"
                class="q-mr-xs"
              ></q-icon>
              <div class="text-weight-mediumx text-blue-8">
                {{ $t("Reorder") }}
              </div>
            </q-btn> -->
          </div>
        </div>
      </q-virtual-scroll>

      <q-infinite-scroll
        ref="nscroll"
        @load="fetchOrder"
        :offset="250"
        :disable="scroll_disabled"
      >
        <template v-slot:default>
          <NoData
            v-if="!hasItems && !loading"
            icon="no-orders.png"
            :message="
              tabs == 'history' ? $t('No Past Orders') : $t('No Orders')
            "
            :subtitle="
              tabs == 'history'
                ? $t('no_past_orders')
                : $t('You dont have any orders yet.')
            "
          />
        </template>
        <template v-slot:loading>
          <LoadingData :page="page"></LoadingData>
        </template>
      </q-infinite-scroll>

      <q-space class="q-pa-md"></q-space>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          color="grey-2"
          text-color="grey"
          padding="xs"
        />
      </q-page-scroller>

      <OrderDetails
        ref="ref_orderdetails"
        :order_uuid="order_uuid"
        @onclose-order="oncloseOrder"
        :show_actions="false"
        @on-ratereview="showReview"
      ></OrderDetails>

      <AddReview
        ref="ref_revieworder"
        @after-addreview="afterAddreview"
      ></AddReview>

      <ReviewDelivery
        ref="ref_review_delivery"
        @after-addreview="afterAddreview"
      ></ReviewDelivery>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
import { defineAsyncComponent } from "vue";

export default {
  name: "OrdersList",
  components: {
    TrackProgress: defineAsyncComponent(() =>
      import("components/TrackProgress.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    OrderDetails: defineAsyncComponent(() =>
      import("components/OrderDetails.vue")
    ),
    AddReview: defineAsyncComponent(() => import("components/AddReview.vue")),
    ReviewDelivery: defineAsyncComponent(() =>
      import("components/ReviewDelivery.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  data() {
    return {
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      page: 1,
      data: [],
      tabs: "recent",
      order_uuid: null,
      tabList: [
        {
          value: "recent",
          label: this.$t("Recent"),
        },
        {
          value: "history",
          label: this.$t("Past Orders"),
        },
      ],
    };
  },
  mounted() {
    this.DataStore.show_toobar = true;
    this.DataStore.data.page_title = this.$t("Orders");
    this.DataStore.back_btn = true;

    this.$watch(
      () => this.DataStore.$state.is_refresh_order,
      (newData, oldData) => {
        console.log("is_refresh_order", newData);
        if (newData) {
          this.DataStore.$state.is_refresh_order = false;
          this.resetPagination();
        }
      }
    );

    if (this.DataStore.data?.orderList) {
      this.data = this.DataStore.data?.orderList?.data;
      this.page = this.DataStore.data?.orderList?.page;
      this.hasMore = this.DataStore.data?.orderList?.hasMore;
    } else {
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }
    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.orderList = {
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
    };
    this.DataStore.back_btn = false;
  },
  computed: {
    hasItems() {
      if (!this.data) {
        return false;
      }
      return this.data.length > 0;
    },
  },
  methods: {
    addDriverReview(value) {
      console.log("addDriverReview", value);
      this.$refs.ref_review_delivery.show(value);
    },
    showReview(value) {
      this.$refs.ref_revieworder.order_uuid = value?.order_uuid;
      this.$refs.ref_revieworder.modal = true;
    },
    afterAddreview() {
      this.$refs.ref_orderdetails.modal = false;
      this.resetPagination();
    },
    viewOrder(value) {
      this.order_uuid = value?.order_uuid;
      if (value.is_order_ongoing) {
        this.$router.replace({
          path: "/checkout/successful",
          query: { order_uuid: this.order_uuid },
        });
      } else {
        this.$refs.ref_orderdetails.modal = true;
      }
    },
    toSeo(value) {
      if (!value) {
        return;
      }
      let text = value;
      let result = text.toLowerCase().replace(/\s+/g, "_");
      return result;
    },
    async fetchOrder(index, done) {
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
          order_type: this.tabs,
          page: this.page,
        }).toString();

        const response = await APIinterface.fetchGet(`OrderList?${params}`);
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
      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    async reOrder(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const order_uuid = value?.order_uuid;
        console.log("order_uuid", order_uuid);
        const response = await APIinterface.fetchDataByTokenPost(
          "orderBuyAgain",
          {
            cart_uuid: this.DataStorePersisted.cart_uuid,
            order_uuid: order_uuid,
          }
        );
        console.log("response", response);
        this.DataStorePersisted.cart_uuid = response.details.cart_uuid;
        this.$router.push("/cart");
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    //
  },
};
</script>
