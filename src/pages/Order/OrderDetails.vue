<template>
  <q-header
    class="bg-whitex"
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-black': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'grey' : 'mygrey'"
        :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
      />
      <template v-if="!loading">
        <q-toolbar-title class="text-weight-bold"
          >#{{ order_info.order_id }}</q-toolbar-title
        >
      </template>
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="q-pl-md q-pr-md q-pt-xs q-pb-md">
      <template v-if="loading">
        <div class="q-gutter-y-sm">
          <template v-for="items in 2" :key="items">
            <q-skeleton
              height="60px"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
            <q-skeleton
              height="150px"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
            <q-skeleton
              height="60px"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
            <q-skeleton
              height="150px"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
            <q-skeleton
              height="60px"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>
        </div>
      </template>

      <template v-else>
        <template v-if="hasData">
          <div class="row items-center q-mb-md">
            <div class="col-2 q-mr-sm">
              <q-img
                :src="merchant.url_logo"
                style="width: 50px; height: 50px"
                fit="cover"
                spinner-color="primary"
                spinner-size="xs"
                class="rounded-borders"
                placeholder-src="placeholder.png"
              ></q-img>
            </div>
            <div class="col">
              <div class="text-weight-medium">
                {{ merchant.restaurant_name }}
              </div>
              <div class="text-grey text-caption line-normal ellipsis-2-lines">
                {{ merchant.address }}
              </div>
            </div>
            <div class="col-3" v-if="!allowed_review">
              <q-btn
                flat
                unelevated
                no-caps
                class="q-pl-none q-pr-sm"
                :to="{
                  path: '/order/track',
                  query: {
                    order_uuid: order_info.order_uuid,
                    redirect: 'back',
                  },
                }"
              >
                <div class="flex items-center">
                  <div class="q-mr-sm text-body2 text-weight-light">
                    {{ $t("Track") }}
                  </div>
                  <div
                    class="radius20 bg-yellow-2 flex flex-center"
                    style="width: 20px; height: 20px"
                  >
                    <q-icon
                      name="arrow_forward"
                      class="text-yellow-9"
                      size="16px"
                    ></q-icon>
                  </div>
                </div>
              </q-btn>
            </div>
          </div>

          <div
            v-if="!loading"
            class="q-pa-sm bg-mygreyx radius10"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          >
            <template v-if="order_info.order_type == 'delivery'">
              <q-stepper
                v-model="progress.order_progress"
                ref="stepper"
                contracted
                animated
                flat
                class="bg-transparent"
                done-color="primary"
                active-color="primary"
                :inactive-color="$q.dark.mode ? 'grey300' : 'white'"
              >
                <q-step
                  :name="1"
                  icon="check"
                  active-icon="done_all"
                  done-icon="done_all"
                  :done-color="progress.order_progress > 1 ? 'primary' : 'red'"
                  :done="
                    progress.order_progress > 1 || progress.order_progress <= 0
                  "
                >
                </q-step>
                <q-step
                  :name="2"
                  icon="restaurant"
                  active-icon="restaurant"
                  done-icon="restaurant"
                  :done-color="progress.order_progress > 2 ? 'primary' : 'red'"
                  :done="
                    progress.order_progress > 2 || progress.order_progress <= 0
                  "
                >
                </q-step>
                <q-step
                  :name="3"
                  icon="directions_run"
                  active-icon="directions_run"
                  done-icon="directions_run"
                  :done-color="progress.order_progress > 3 ? 'primary' : 'red'"
                  :done="
                    progress.order_progress > 3 || progress.order_progress <= 0
                  "
                >
                </q-step>
                <q-step
                  :name="4"
                  icon="flag"
                  active-icon="flag"
                  done-icon="flag"
                  :done-color="progress.order_progress > 4 ? 'primary' : 'red'"
                  :done="
                    progress.order_progress > 4 || progress.order_progress <= 0
                  "
                >
                </q-step>
              </q-stepper>
            </template>
            <template v-else>
              <q-stepper
                v-model="progress.order_progress"
                ref="stepper"
                contracted
                animated
                flat
                class="bg-transparent"
                done-color="primary"
                active-color="primary"
                inactive-color="white"
              >
                <q-step
                  :name="1"
                  icon="check"
                  active-icon="done_all"
                  done-icon="done_all"
                  :done-color="progress.order_progress > 1 ? 'primary' : 'red'"
                  :done="
                    progress.order_progress > 1 || progress.order_progress <= 0
                  "
                >
                </q-step>
                <q-step
                  :name="2"
                  icon="restaurant"
                  active-icon="restaurant"
                  done-icon="restaurant"
                  :done-color="progress.order_progress > 2 ? 'primary' : 'red'"
                  :done="
                    progress.order_progress > 2 || progress.order_progress <= 0
                  "
                >
                </q-step>
                <q-step
                  :name="3"
                  icon="flag"
                  active-icon="flag"
                  done-icon="flag"
                  :done-color="progress.order_progress > 3 ? 'primary' : 'red'"
                  :done="
                    progress.order_progress > 3 || progress.order_progress <= 0
                  "
                >
                </q-step>
              </q-stepper>
            </template>
          </div>

          <q-space class="q-pa-xs"></q-space>

          <q-list bordered dense class="radius10 q-pt-xs q-pb-xs q-mb-sm">
            <div class="flex justify-between items-center q-pl-md">
              <div class="text-caption text-weight-bold">
                {{ $t("Order Summary") }}
              </div>
              <div>
                <q-btn
                  flat
                  unelevated
                  no-caps
                  class="q-pl-none q-pr-sm"
                  @click.stop="orderAgain(order_info.order_uuid)"
                >
                  <div class="flex items-center">
                    <div class="q-mr-sm text-body2 text-weight-light">
                      {{ $t("Reorder") }}
                    </div>
                    <div
                      class="radius20 bg-yellow-2 flex flex-center"
                      style="width: 20px; height: 20px"
                    >
                      <q-icon
                        name="arrow_forward"
                        class="text-yellow-9"
                        size="16px"
                      ></q-icon>
                    </div>
                  </div>
                </q-btn>
              </div>
            </div>

            <template v-for="items in items_data" :key="items">
              <q-item class="item-normal-height">
                <q-item-section avatar class="item-column-less" top>
                  <q-item-label class="text-caption text-weight-medium"
                    >{{ items.qty }}x</q-item-label
                  >
                </q-item-section>
                <q-item-section top>
                  <q-item-label class="text-caption text-weight-bold">
                    <span v-html="items.item_name"></span>
                  </q-item-label>
                  <q-item-label caption v-if="items.special_instructions">
                    {{ items.special_instructions }}
                  </q-item-label>

                  <template v-if="Object.keys(items.attributes).length > 0">
                    <q-item-label caption>
                      <template
                        v-for="attributes in items.attributes"
                        :key="attributes"
                      >
                        <div>
                          <template
                            v-for="(
                              items_attributes, attributes_index
                            ) in attributes"
                            :key="items_attributes"
                          >
                            {{ items_attributes }}
                            <template
                              v-if="attributes_index < attributes.length - 1"
                              >,
                            </template>
                          </template>
                        </div>
                      </template>
                    </q-item-label>
                  </template>
                </q-item-section>

                <q-item-section side top>
                  <q-item-label class="text-caption text-weight-medium">
                    {{ items.price.pretty_total_after_discount }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <template v-if="Object.keys(items.addons).length > 0">
                <template v-for="addons in items.addons" :key="addons">
                  <template
                    v-for="addon_items in addons.addon_items"
                    :key="addon_items"
                  >
                    <q-item class="item-normal-height">
                      <q-item-section>
                        <q-item-label caption>
                          {{ addon_items.qty }}x {{ addon_items.sub_item_name }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label caption>
                          {{ addon_items.pretty_addons_total }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </template>
              </template>
            </template>
          </q-list>

          <template v-if="is_reviewed">
            <div class="q-pa-sm flex flex-center text-caption text-grey">
              {{ $t("You have rated this") }}
              <q-icon name="star" size="2em" color="yellow-9" />
              <span class="text-weight-bold">{{ data_review.rating }}</span>
            </div>
          </template>

          <template v-else>
            <q-item v-if="allowed_review">
              <q-item-section avatar>
                <q-item-label class="text-body2">{{
                  $t("Tap to rate")
                }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-rating
                  :model-value="rate_value[order_info.order_uuid]"
                  size="2em"
                  :max="5"
                  color="grey-5"
                  color-selected="yellow-2"
                  class="q-mb-xs"
                  @update:model-value="
                    (v) => setRateValue(v, order_info.order_uuid)
                  "
                />
              </q-item-section>
              <q-item-section side></q-item-section>
            </q-item>
          </template>

          <div v-if="allowed_cancelled" class="q-mb-sm text-right">
            <q-btn
              flat
              unelevated
              no-caps
              class="q-pl-none q-pr-sm"
              @click.stop="cancelOrder(order_info.order_uuid)"
            >
              <div class="flex items-center">
                <div class="q-mr-sm text-body2 text-weight-light">
                  {{ $t("Cancel this order") }}
                </div>
                <div
                  class="radius20 bg-yellow-2 flex flex-center"
                  style="width: 20px; height: 20px"
                >
                  <q-icon
                    name="arrow_forward"
                    class="text-yellow-9"
                    size="16px"
                  ></q-icon>
                </div>
              </div>
            </q-btn>
          </div>

          <div
            class="radius10 bg-mygreyx q-pt-xs q-pb-xs q-mb-sm text-caption"
            :class="{
              'bg-grey600': $q.dark.mode,
              'bg-mygrey': !$q.dark.mode,
            }"
          >
            <div class="q-pl-md q-pr-md">
              <div class="text-weight-bold">{{ $t("Orders Details") }}</div>
              <div>{{ $t("Order #") }}{{ order_info.order_id }}</div>
              <div>{{ order_info.place_on }}</div>
            </div>
            <q-separator class="q-mb-sm"></q-separator>

            <div
              class="q-pl-md q-pr-md"
              v-if="order_info.order_type == 'delivery'"
            >
              <div class="text-weight-bold">{{ $t("Delivery Details") }}</div>
              <div>
                {{ order_info.customer_name }} {{ order_info.contact_number }}
              </div>
              <div>
                {{ order_info.address1 }} {{ order_info.delivery_address }}
              </div>
              <div>
                <template v-if="order_info.whento_deliver == 'now'">
                  {{ $t("ASAP") }}
                </template>
                <template v-else>
                  {{ order_info.schedule_at }}
                </template>
              </div>
            </div>
            <q-separator class="q-mb-sm"></q-separator>

            <div class="q-pl-md q-pr-md">
              <div class="text-weight-bold">{{ $t("Payment Details") }}</div>
              <div>{{ order_info.payment_name }}</div>
              <!-- <div v-if="order_info.amount_due_raw > 0">
                {{ order_info.payment_by_wallet }}
              </div> -->
              <div>
                {{ order_info.paid_on }}
              </div>
            </div>
          </div>

          <q-list bordered dense class="radius10 q-pt-xs q-pb-xs">
            <template v-for="items in summary" :key="items">
              <template v-if="items.type != 'total'">
                <q-item class="item-normal-height">
                  <q-item-section class="text-caption">{{
                    items.name
                  }}</q-item-section>
                  <q-item-section side class="text-caption">{{
                    items.value
                  }}</q-item-section>
                </q-item>
              </template>
              <template v-else>
                <q-separator class="q-mb-sm"></q-separator>
                <q-item class="item-normal-height">
                  <q-item-section>{{ items.name }}</q-item-section>
                  <q-item-section side class="text-weight-bold">{{
                    items.value
                  }}</q-item-section>
                </q-item>
              </template>
            </template>
          </q-list>
        </template>
      </template>

      <CancelOrder
        ref="cancel_order"
        @after-cancelorder="afterCancelorder"
      ></CancelOrder>

      <AddReview ref="review" @after-addreview="afterAddreview"></AddReview>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useUserStore } from "stores/UserStore";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "OrderDetails",
  components: {
    // ItemListComponents: defineAsyncComponent(() =>
    //   import("components/ItemListComponents.vue")
    // ),
    // MapComponents: defineAsyncComponent(() =>
    //   import("components/MapComponents.vue")
    // ),
    // NoAvailableData: defineAsyncComponent(() =>
    //   import("components/NoAvailableData.vue")
    // ),
    CancelOrder: defineAsyncComponent(() =>
      import("components/CancelOrder.vue")
    ),
    AddReview: defineAsyncComponent(() => import("components/AddReview.vue")),
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const UserStore = useUserStore();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, UserStore, SettingStore };
  },
  data() {
    return {
      step: 1,
      order_uuid: "",
      loading: true,
      order_info: [],
      merchant: [],
      items_data: [],
      payment_list: [],
      summary: [],
      isDone: undefined,
      services: [],
      order_status: [],
      progress: [],
      refund_transaction: [],
      is_reviewed: false,
      data_review: [],
      allowed_cancelled: false,
      allowed_review: false,
      rate_value: [],
    };
  },
  mounted() {
    this.order_uuid = this.$route.query.order_uuid;
    this.orderDetails(null);
  },
  computed: {
    hasData() {
      if (Object.keys(this.order_info).length > 0) {
        return true;
      }
      return false;
    },
    hasRefund() {
      if (Object.keys(this.refund_transaction).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    refresh(done) {
      this.orderDetails(done);
    },
    orderDetails(done) {
      this.loading = done ? false : true;
      APIinterface.fetchDataByTokenPost(
        "orderDetails",
        "order_uuid=" + this.order_uuid + "&track_progress=1&get_review=1"
      )
        .then((data) => {
          this.merchant = data.details.data.merchant;
          this.items_data = data.details.data.items;
          this.summary = data.details.data.summary;
          this.refund_transaction = data.details.data.refund_transaction;

          this.order_info = data.details.data.order.order_info;
          this.payment_list = data.details.data.order.payment_list;
          this.services = data.details.data.order.services;
          this.order_status = data.details.data.order.status;
          this.progress = data.details.progress;
          this.is_reviewed = data.details.is_reviewed;
          this.data_review = data.details.data_review;
          this.allowed_cancelled = data.details.allowed_cancelled;
          this.allowed_review = data.details.allowed_review;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    orderAgain() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost("orderBuyAgain", {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        order_uuid: this.order_info.order_uuid,
      })
        .then((data) => {
          APIinterface.setStorage("cart_uuid", data.details.cart_uuid);
          this.$router.push("/cart");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    cancelOrder(data) {
      console.log("cancelOrder", data);
      this.$refs.cancel_order.showModal(data);
    },
    afterCancelorder() {
      this.orderDetails(null);
    },
    setRateValue(data, order_uuid) {
      this.$refs.review.order_uuid = order_uuid;
      this.$refs.review.rating_value = data;
      this.$refs.review.modal = true;
    },
    afterAddreview() {
      this.orderDetails(null);
    },
  },
};
</script>
