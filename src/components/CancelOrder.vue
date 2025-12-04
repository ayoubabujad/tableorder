<template>
  <q-dialog
    v-model="show_modal"
    @before-show="cancelOrderStatus"
    persistent
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <template v-if="loading">
        <q-card-section style="height: calc(35vh)">
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
        </q-card-section>
      </template>
      <template v-else>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ $t("Cancel order") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div
            class="text-weight-bold text-body1"
            v-if="cancel_response.refund_status === 'full_refund'"
          >
            {{ $t("Are you sure") }}?
          </div>
          <h5 class="text-weight-bold no-margin text-body1" v-else>
            {{ $t("How would you like to proceed") }}?
          </h5>

          <div class="q-mt-md">
            <p class="text-body2">{{ cancel_msg }}</p>
          </div>

          <div class="q-mt-md q-mb-sm" v-if="cancel_response.refund_msg">
            <p class="text-body2">
              {{ cancel_response.refund_msg }}
            </p>
          </div>
        </q-card-section>

        <q-card-actions class="myshadow q-pa-md">
          <div class="row fit q-gutter-x-sm">
            <div class="col">
              <q-btn
                unelevated
                rounded
                color="mygrey"
                text-color="dark"
                no-caps
                v-close-popup
                size="lg"
                class="fit"
              >
                <div class="text-subtitle2 text-weight-bold">
                  {{ $t("Don't Cancel") }}
                </div>
              </q-btn>
            </div>
            <div class="col">
              <q-btn
                unelevated
                rounded
                :color="!cancel_status ? 'disabled' : 'primary'"
                :text-color="!cancel_status ? 'disabled' : 'white'"
                no-caps
                size="lg"
                :disable="!cancel_status"
                :loading="loading_submit"
                @click="applyCancelOrder"
                class="fit"
              >
                <div class="text-subtitle2 text-weight-bold">
                  {{ $t("Cancel order") }}
                </div>
              </q-btn>
            </div>
          </div>
        </q-card-actions>
      </template>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "CancelOrder",
  data() {
    return {
      loading: false,
      loading_submit: false,
      show_modal: false,
      order_uuid: "",
      cancel_status: false,
      cancel_msg: "",
      cancel_response: [],
    };
  },
  methods: {
    showModal(orderUuid) {
      this.order_uuid = orderUuid;
      this.show_modal = true;
    },
    cancelOrderStatus() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "cancelOrderStatus",
        "order_uuid=" + this.order_uuid
      )
        .then((data) => {
          this.cancel_status = data.details.cancel_status;
          this.cancel_msg = data.details.cancel_msg;
          this.cancel_response = data.details;
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    applyCancelOrder() {
      this.loading_submit = true;
      APIinterface.fetchDataByTokenPost(
        "applyCancelOrder",
        "order_uuid=" + this.order_uuid
      )
        .then((data) => {
          this.show_modal = false;
          APIinterface.notify("dark", data.msg, "check_circle", this.$q);
          this.$emit("afterCancelorder");
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
  },
};
</script>
