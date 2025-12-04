<template>
  <q-page class="row">
    <template v-if="CartData.order_loading">
      <q-inner-loading
        :showing="true"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </template>
    <template v-else>
      <div class="col-12 relative-position">
        <div class="flex justify-between absolute-top q-pa-sm">
          <div>
            <q-btn
              icon="las la-times"
              dense
              round
              size="md"
              :class="{
                'border-none': $q.dark.mode,
                'border-dark-grey': !$q.dark.mode,
              }"
              :text-color="$q.dark.mode ? 'grey600' : 'dark'"
              :color="$q.dark.mode ? 'grey300' : 'white'"
              unelevated
              @click="$router.back()"
            />
          </div>
        </div>

        <div
          style="height: 55vh"
          class="flex flex-center bg-mygreyx"
          :class="{
            'bg-grey600 ': $q.dark.mode,
            'bg-mygrey ': !$q.dark.mode,
          }"
        >
          <div
            class="full-width text-center relative-position"
            style="height: 70px; max-height: 70px"
          >
            <div
              class="full-width text-center relative-position"
              style="height: 70px; max-height: 70px"
            >
              <svg
                class="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  class="checkmark__circle"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  class="checkmark__check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>

              <template v-if="!CartData.order_loading">
                <div class="text-weight-medium font17">
                  {{ $t("Order received order") }} #{{
                    CartData.order_data.order_info.order_id
                  }}
                </div>
                <div class="text-grey font12">
                  {{ $t("Got your order") }}
                  {{ CartData.order_data.order_info.customer_name }}!
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <q-dialog
      v-if="!CartData.order_loading"
      v-model="dialog"
      position="bottom"
      seamless
      transition-show="fade"
      @escape-key="$router.back()"
    >
      <q-card style="height: 45vh" v-if="CartData.hasOrderDetails">
        <q-card-section class="no-wrap">
          <div class="q-mb-md row items-center">
            <div class="col">
              <div class="font16 text-weight-medium">{{ order_status }}</div>
              <div class="font12 text-grey">
                {{ order_status_details }}
              </div>
            </div>
            <div class="col-4 text-right">
              <div class="font17 text-weight-bold">
                <!-- ESTIMATION -->
                <template
                  v-if="
                    CartData.order_data.estimation[
                      CartData.order_data.order_info.order_type
                    ]
                  "
                >
                  <template
                    v-if="
                      CartData.order_data.estimation[
                        CartData.order_data.order_info.order_type
                      ]
                    "
                  >
                    {{
                      formatDeliveryTime(CartData.order_data.estimation[
                        CartData.order_data.order_info.order_type
                      ][CartData.order_data.charge_type].estimation)
                    }}
                  </template>
                </template>
              </div>
            </div>
          </div>

          <template
            v-if="CartData.order_data.order_info.order_type == 'delivery'"
          >
            <template v-if="order_progress > 0">
              <q-linear-progress
                v-if="order_progress <= 3"
                indeterminate
                color="secondary"
              />
              <q-space class="q-pa-xs"></q-space>
            </template>
          </template>
          <template v-else>
            <template v-if="order_progress > 0">
              <q-linear-progress
                v-if="order_progress <= 2"
                indeterminate
                color="secondary"
              />
              <q-space class="q-pa-xs"></q-space>
            </template>
          </template>

          <div
            class="q-pa-sm bg-mygreyx radius10"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          >
            <template
              v-if="CartData.order_data.order_info.order_type == 'delivery'"
            >
              <q-stepper
                v-model="order_progress"
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
                  :done-color="order_progress > 1 ? 'primary' : 'red'"
                  :done="order_progress > 1 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="2"
                  icon="restaurant"
                  active-icon="restaurant"
                  done-icon="restaurant"
                  :done-color="order_progress > 2 ? 'primary' : 'red'"
                  :done="order_progress > 2 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="3"
                  icon="directions_run"
                  active-icon="directions_run"
                  done-icon="directions_run"
                  :done-color="order_progress > 3 ? 'primary' : 'red'"
                  :done="order_progress > 3 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="4"
                  icon="flag"
                  active-icon="flag"
                  done-icon="flag"
                  :done-color="order_progress > 4 ? 'primary' : 'red'"
                  :done="order_progress > 4 || order_progress <= 0"
                >
                </q-step>
              </q-stepper>
            </template>
            <template v-else>
              <q-stepper
                v-model="order_progress"
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
                  :done-color="order_progress > 1 ? 'primary' : 'red'"
                  :done="order_progress > 1 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="2"
                  icon="restaurant"
                  active-icon="restaurant"
                  done-icon="restaurant"
                  :done-color="order_progress > 2 ? 'primary' : 'red'"
                  :done="order_progress > 2 || order_progress <= 0"
                >
                </q-step>
                <q-step
                  :name="3"
                  icon="flag"
                  active-icon="flag"
                  done-icon="flag"
                  :done-color="order_progress > 3 ? 'primary' : 'red'"
                  :done="order_progress > 3 || order_progress <= 0"
                >
                </q-step>
              </q-stepper>
            </template>
          </div>

          <q-space class="q-pa-sm"></q-space>

          <div class="row items-center q-mb-md">
            <div class="col-2 q-mr-sm">
              <q-img
                :src="CartData.order_data.merchant_info.url_logo"
                style="width: 50px; height: 50px"
                fit="cover"
                spinner-color="primary"
                spinner-size="xs"
                class="rounded-borders"
              ></q-img>
            </div>
            <div class="col">
              <div class="text-weight-medium">
                {{ CartData.order_data.merchant_info.restaurant_name }}
              </div>
              <div class="text-grey font12 ellipsis-2-lines">
                {{ CartData.order_data.merchant_info.address }}
              </div>
            </div>
            <div class="col-2">
              <q-btn
                round
                color="primary"
                icon="las la-phone"
                unelevated
                :href="'tel:' + CartData.order_data.merchant_info.contact_phone"
              />
            </div>
          </div>

          <q-list dense>
            <q-expansion-item
              expand-separator
              :label="itemCount(parseInt(CartData.order_data.items_count))"
              :caption="
                $t('Total price') +
                ' ' +
                CartData.order_data.order_info.pretty_total
              "
            >
              <q-card class="text-weight-light">
                <q-card-section class="q-pa-none">
                  <q-list>
                    <template
                      v-for="items in CartData.order_data.items"
                      :key="items"
                    >
                      <div
                        class="bg-secondaryx radius10 q-mb-sm"
                        :class="{
                          'bg-grey600': $q.dark.mode,
                          'bg-secondary ': !$q.dark.mode,
                        }"
                      >
                        <q-item>
                          <q-item-section avatar>
                            <q-img
                              :src="items.url_image"
                              style="width: 50px; height: 50px"
                              fit="cover"
                              spinner-color="primary"
                              spinner-size="xs"
                              class="rounded-borders"
                            ></q-img>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-weight-medium">
                              {{ items.qty }} x
                              {{ items.item_name }}
                              <template v-if="items.size_name">
                                ({{ items.size_name }})
                              </template>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </template>
                  </q-list>
                  <q-list
                    dense
                    separator
                    class="bg-mygreyx radius10"
                    :class="{
                      'bg-grey600 ': $q.dark.mode,
                      'bg-mygrey ': !$q.dark.mode,
                    }"
                  >
                    <q-item
                      v-for="summary in CartData.order_data.order_info.summary"
                      :key="summary"
                    >
                      <q-item-section
                        :class="
                          summary.type == 'total' ? 'text-weight-bold' : ''
                        "
                        >{{ summary.name }}</q-item-section
                      >
                      <q-item-section
                        side
                        :class="
                          summary.type == 'total' ? 'text-weight-bold' : ''
                        "
                      >
                        <NumberFormat :amount="summary.value"></NumberFormat>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ComponentsRealtime
      ref="realtime"
      getevent="tracking"
      @after-receive="afterReceive"
    />
  </q-page>
</template>

<script>
import { userCartData } from "stores/CartData";
import { defineAsyncComponent } from "vue";
import { formatDeliveryTime } from "src/utils/DeliveryTimeFormatter";

export default {
  name: "TrackOrder",
  components: {
    NumberFormat: defineAsyncComponent(() =>
      import("components/NumberFormat.vue")
    ),
    ComponentsRealtime: defineAsyncComponent(() =>
      import("components/ComponentsRealtime.vue")
    ),
  },
  data() {
    return {
      dialog: true,
      step: 1,
      order_uuid: "",
      order_status: "",
      order_progress: -1,
      order_status_details: "",
      instructions: [],
    };
  },
  watch: {
    CartData: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (newValue.order_data) {
          if (Object.keys(newValue.order_data).length > 0) {
            this.order_progress = newValue.order_data.progress.order_progress;

            this.order_status = newValue.order_data.progress.order_status;
            this.order_status_details =
              newValue.order_data.progress.order_status_details;

            this.instructions = newValue.order_data.instructions;
          }
        }
      },
    },
  },
  setup(props) {
    const CartData = userCartData();
    return { CartData };
  },
  created() {
    this.order_uuid = this.$route.query.order_uuid;
    this.CartData.getOrder(this.order_uuid);
  },
  methods: {
    afterReceive(data) {
      if (
        Object.keys(this.CartData.order_data).length > 0 &&
        Object.keys(data).length > 0
      ) {
        if (data.order_id !== this.CartData.order_data.order_info.order_id) {
          return false;
        }
        if (data.order_progress === 0) {
          this.order_progress = data.order_progress;
          this.order_status = data.order_status;
          this.order_status_details = data.order_status_details;
        } else if (data.order_progress === -1) {
          // do nothing
        } else {
          this.order_progress = data.order_progress;
          this.order_status = data.order_status;
          this.order_status_details = data.order_status_details;
        }
      }
    },
    itemCount(count) {
      if (count > 1) {
        return count + " " + this.$t("items");
      }
      return count + " " + this.$t("item");
    },
    formatDeliveryTime(minutes) {
      return formatDeliveryTime(minutes);
    },
    //
  },
};
</script>
