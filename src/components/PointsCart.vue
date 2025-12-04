<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    @before-hide="beforeHide()"
    full-width
  >
    <q-card>
      <q-toolbar class="text-dark q-mt-md">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Apply points") }}
          </div>
          <div class="text-caption">
            <span class="text-weight-bold">{{ balance }}</span>
            {{ $t("points available to use") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section class="relative-position" style="min-height: calc(30vh)">
        <template v-if="loading1">
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
        <template v-if="use_thresholds">
          <q-list>
            <template v-for="items in threshold_data" :key="items">
              <q-item
                class="q-mb-sm rounded-borders"
                :clickable="balance >= items.points"
                :v-ripple:purple="balance >= items.points"
                :class="{
                  'border-primary': balance >= items.points,
                  'border-grey': balance < items.points,
                  'text-primary': points == items.id,
                }"
                @click="points = items.id"
              >
                <q-item-section
                  class="text-weight-bold text-subtitle2"
                  :class="{
                    'text-grey': balance < items.points,
                  }"
                >
                  {{ items.label2 }}
                </q-item-section>
                <q-item-section side>
                  <q-item-label
                    caption
                    :class="{
                      'text-primary': points == items.id,
                    }"
                    >{{ items.label }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>
        <template v-else>
          <q-input
            v-model="points"
            borderless
            class="bg-grey-2 q-pl-md"
            type="number"
            :placeholder="$t('Enter points to convert to discount')"
          >
          </q-input>
        </template>
      </q-card-section>
      <q-card-actions class="row q-pl-md q-pr-md q-pb-md">
        <q-btn
          class="col"
          no-caps
          unelevated
          color="mygrey"
          text-color="dark"
          size="lg"
          rounded
          :disable="loading"
          @click="modal = false"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Cancel") }}
          </div>
        </q-btn>
        <q-btn
          class="col"
          no-caps
          unelevated
          :color="!points ? 'disabled' : 'primary'"
          :text-color="!points ? 'disabled' : 'white'"
          size="lg"
          rounded
          :loading="loading"
          :disable="!points"
          @click="applyPoints"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Redeem now") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "PointsCart",
  props: ["cart_uuid", "currency_code", "merchant_id"],
  data() {
    return {
      modal: false,
      loading: false,
      points: 0,
      balance: 0,
      use_thresholds: false,
      threshold_data: null,
      loading1: false,
    };
  },
  methods: {
    beforeHide() {
      this.threshold_data = null;
    },
    async onBeforeShow() {
      this.loading1 = true;
      this.points = 0;
      try {
        const params = new URLSearchParams({
          currency_code: this.currency_code,
          merchant_id: this.merchant_id,
        }).toString();
        const results = await APIinterface.fetchDataGet(
          "fetchPointsthresholds",
          params
        );
        this.threshold_data = results.details.data;
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading1 = false;
      }
    },
    async applyPoints() {
      try {
        this.loading = true;
        let params = {
          cart_uuid: this.cart_uuid,
          currency_code: this.currency_code,
          points: this.points,
          merchant_id: this.merchant_id,
        };
        let methods = "applyPoints";
        if (this.use_thresholds) {
          params.points = "";
          params.points_id = this.points;
          methods = "redeemPoints";
        }
        await APIinterface.fetchDataByTokenPost(
          methods,
          new URLSearchParams(params).toString()
        );
        this.modal = false;
        this.$emit("afterApplypoints");
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
