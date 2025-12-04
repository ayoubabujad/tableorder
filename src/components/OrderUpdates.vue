<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card>
      <q-card-section>
        <div class="flex justify-between">
          <div class="text-h6 text-weight-bold q-pb-md">
            {{ data?.merchant?.restaurant_name }}
          </div>
          <div>
            <q-btn
              v-close-popup
              dense
              color="grey-5"
              icon="close"
              size="md"
              unelevated
              flat
              class="q-mr-sm"
            />
          </div>
        </div>
        <q-separator></q-separator>

        <q-list dense>
          <q-item>
            <q-item-section>
              <q-item-label>
                <div class="text-weight-light">
                  <template v-if="data?.is_order_ongoing">
                    {{ $t("Estimated arrival") }}
                  </template>
                  <template v-else>
                    {{ data?.order_status_details }}
                  </template>
                </div>
              </q-item-label>
              <q-item-label class="text-subtitle1 text-weight-bold">
                {{ data?.estimated_time }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <OrderStatusAnimation :status="getImageProgress" />
            </q-item-section>
          </q-item>

          <TrackProgress
            :order_type="data?.order_type"
            :order_progress="data?.order_progress"
          ></TrackProgress>

          <q-space class="q-pa-xs"></q-space>

          <q-item>
            <q-item-section>
              <q-item-label class="text-grey">
                <div
                  class="text-body2"
                  :class="{
                    'text-warning': isWarning,
                  }"
                >
                  {{ data?.order_status }}
                </div>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                v-if="data?.is_order_ongoing"
                no-caps
                unelevated
                color="primary"
                class="text-weight-bold"
                rounded
                style="min-width: 100px"
                :to="{
                  path: '/checkout/successful',
                  query: { order_uuid: data?.order_uuid },
                }"
              >
                <div class="text-caption text-weight-bold">
                  {{ $t("Track") }}
                </div>
              </q-btn>

              <q-btn
                v-if="data?.completed"
                no-caps
                unelevated
                color="lightblue"
                text-color="blue-grey-6"
                class="text-weight-bold"
                @click="showReview"
                rounded
              >
                <div class="text-caption text-weight-bold">
                  {{ $t("Add Review") }}
                </div>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <AddReview
    ref="ref_revieworder"
    @after-addreview="afterAddreview"
  ></AddReview>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "OrderUpdates",
  components: {
    TrackProgress: defineAsyncComponent(() =>
      import("components/TrackProgress.vue")
    ),
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
    AddReview: defineAsyncComponent(() => import("components/AddReview.vue")),
  },
  data() {
    return {
      modal: false,
      data: null,
    };
  },
  methods: {
    showModal(value) {
      this.data = value;
      this.modal = true;
    },
    showReview() {
      this.modal = false;
      this.$refs.ref_revieworder.data = null;
      this.$refs.ref_revieworder.order_uuid = this.data?.order_uuid;
      this.$refs.ref_revieworder.modal = true;
    },
    afterAddreview() {
      this.$refs.ref_orderdetails.modal = false;
    },
  },
  computed: {
    isWarning() {
      if (!this.data?.progress_data) {
        return;
      }
      return (
        this.data?.progress_data?.is_order_late ||
        this.data?.progress_data?.is_preparation_late ||
        this.data?.progress_data?.is_driver_delivering_late ||
        !this.data?.progress_data?.is_order_ongoing
      );
    },
    getImageProgress() {
      let results = "";
      if (this.data) {
        if (this.data?.order_type == "delivery") {
          switch (this.data?.order_progress) {
            case 0:
              results = "failed";
              break;
            case 1:
              results = "received";
              break;
            case 2:
              results = "cooking";
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
          switch (this.data?.order_progress) {
            case 0:
              results = "failed";
              break;
            case 1:
              results = "receive";
              break;
            case 2:
              results = "cooking";
              break;
            case 3:
              results = "pickup";
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
  },
};
</script>
