<template>
  <q-list bordered dense class="rounded-borders q-pt-xs q-pb-xs q-mb-sm">
    <q-item clickable @click.stop="modal = true">
      <q-item-section avatar class="item-column-less">
        <q-avatar
          color="primary"
          text-color="white"
          icon="las la-percentage"
          size="md"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("Points discount") }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <template v-if="hasDiscount">
          <q-btn
            flat
            unelevated
            no-caps
            color="negative"
            icon="clear"
            round
            size="sm"
            :loading="loading_remove"
            @click.stop="removePoints"
          ></q-btn>
        </template>
        <template v-else>
          <q-btn round color="yellow-9" icon="add" flat size="sm" />
        </template>
      </q-item-section>
    </q-item>
    <q-item class="item-normal-height">
      <q-item-section>
        <template v-if="loading">
          <q-item-label>
            <q-skeleton
              recttype="type"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </q-item-label>
        </template>
        <template v-else>
          <template v-if="data.discount > 0">
            <q-item-label caption class="text-green">{{
              data.discount_label
            }}</q-item-label>
          </template>
          <template v-else>
            <q-item-label>{{ data.redeem_discount }}</q-item-label>
            <q-item-label caption class="text-green">{{
              data.redeem_label
            }}</q-item-label>
          </template>
        </template>
      </q-item-section>
    </q-item>
  </q-list>

  <q-dialog
    v-model="modal"
    persistent
    position="bottom"
    transition-show="fade"
    transition-hide="fadeout"
    @before-show="beforeShow"
  >
    <q-card
      :class="{
        'bg-grey600': $q.dark.mode,
        'bg-mygrey': !$q.dark.mode,
      }"
    >
      <q-form @submit="Submit">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ $t("Apply discount") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section
          style="max-height: 50vh; min-height: 30vh"
          class="scroll q-pa-none"
        >
          <div class="q-pa-md q-pt-none">
            <div
              class="radius10 q-mb-xs"
              :class="{
                'bg-grey600 ': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
                disabled: refresh,
              }"
            >
              <template v-if="points_use_thresholds">
                <q-tabs
                  v-model="points_tab"
                  class="text-dark q-mb-lg"
                  no-caps
                  active-color="white"
                  active-bg-color="primary"
                  indicator-color="transparent"
                  @update:model-value="setPoints"
                >
                  <template v-for="items in data_points" :key="items">
                    <q-tab
                      :name="items"
                      :disable="balance > items.points ? false : true"
                    >
                      <div class="text-caption">{{ items.label }}</div>
                      <div class="text-subtitle2 q-mb-sm">
                        {{ items.amount }}
                      </div>
                      <q-linear-progress
                        size="18px"
                        :value="balance / items.points"
                        style="min-width: 70px"
                        class="radius20"
                        :color="balance >= items.points ? 'yellow-9' : 'blue'"
                      >
                        <div
                          v-if="balance >= items.points"
                          class="absolute-full flex flex-center"
                        >
                          <span class="text-white font12 text-weight-bold">{{
                            $t("REDEEM")
                          }}</span>
                        </div>
                      </q-linear-progress>
                    </q-tab>
                  </template>
                </q-tabs>
              </template>
              <template v-else>
                <q-item>
                  <q-item-section>
                    <q-input
                      v-model="points"
                      :label="$t('Enter points to convert to discount')"
                      stack-label
                      :rules="[
                        (val) =>
                          (val && val.length > 0) ||
                          this.$t('This field is required'),
                        (val) =>
                          !isNaN(val) ||
                          this.$t('Please enter a numeric value'),
                      ]"
                    />
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      type="submit"
                      unelevated
                      rounded
                      color="primary"
                      text-color="white"
                      no-caps
                      class="full-width"
                      :label="$t('Apply')"
                      size="15px"
                      :loading="loading_apply"
                    >
                    </q-btn>
                  </q-item-section>
                </q-item>
              </template>
            </div>
          </div>
        </q-card-section>
        <q-card-actions>
          <template v-if="points_use_thresholds">
            <q-btn
              type="submit"
              unelevated
              rounded
              color="primary"
              text-color="white"
              no-caps
              class="full-width"
              :label="$t('Apply')"
              size="17px"
              :disable="points > 0 ? false : true"
            >
            </q-btn>
          </template>
          <template v-else>
            <q-btn
              v-close-popup
              unelevated
              rounded
              color="red-2"
              text-color="red-9"
              no-caps
              class="full-width"
              :label="$t('Close')"
              size="17px"
              :loading="refresh"
            >
            </q-btn>
          </template>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "PointsDiscount",
  props: ["settings"],
  data() {
    return {
      loading: false,
      points_enabled: false,
      points_use_thresholds: false,
      data: false,
      modal: false,
      points: 0,
      data_points: [],
      balance: 0,
      points_id: 0,
      loading_apply: false,
      loading_remove: false,
      points_tab: 0,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  mounted() {
    this.points_enabled = this.settings.points_enabled;
    this.points_use_thresholds = this.settings.points_use_thresholds;

    if (this.points_enabled) {
      this.getCartpoints();
    }
  },
  computed: {
    hasDiscount() {
      if (Object.keys(this.data).length > 0) {
        return this.data.discount > 0 ? true : false;
      }
      return false;
    },
  },
  methods: {
    getCartpoints() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "getCartpoints",
        "cart_uuid=" +
          APIinterface.getStorage("cart_uuid") +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    beforeShow() {
      this.points = 0;
      if (this.points_use_thresholds) {
        this.getPointsthresholds();
      }
    },
    Submit() {
      console.log("submit", this.points);
      this.loading_apply = true;
      APIinterface.fetchDataByTokenPost(
        "applyPoints",
        "cart_uuid=" +
          APIinterface.getStorage("cart_uuid") +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency() +
          "&points=" +
          this.points +
          "&points_id=" +
          this.points_id
      )
        .then((data) => {
          this.modal = false;
          this.getCartpoints();
          this.$emit("afterApplypoints");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_apply = false;
        });
    },
    removePoints() {
      this.loading_remove = true;
      APIinterface.fetchDataByTokenPost(
        "removePoints",
        "cart_uuid=" + APIinterface.getStorage("cart_uuid")
      )
        .then((data) => {
          this.getCartpoints();
          this.$emit("afterApplypoints");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_remove = false;
        });
    },
    getPointsthresholds() {
      this.loading_points = true;
      APIinterface.fetchDataByTokenPost(
        "getPointsthresholds",
        "cart_uuid=" +
          APIinterface.getStorage("cart_uuid") +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data_points = data.details.data;
          this.balance = data.details.balance;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_points = false;
        });
    },
    setPoints() {
      this.points = this.points_tab.points;
      this.points_id = this.points_tab.id;
    },
  },
};
</script>
