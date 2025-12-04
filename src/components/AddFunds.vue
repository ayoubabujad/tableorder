<template>
  <q-dialog
    v-model="modal"
    persistent
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    backdrop-filter="blur(4px)"
    @before-show="onBeforeShow"
  >
    <q-card class="radius10">
      <q-card-section class="q-gutter-y-md scroll" style="height: calc(60vh)">
        <div class="text-center q-gutter-y-sm">
          <div class="text-h5 text-weight-bold">
            {{ $t("Add Funds to Your Wallet") }}
          </div>
          <div class="text-body2">
            {{ $t("Enter the amount you wish to top up") }}.
          </div>
        </div>

        <q-input v-model="amount" type="number" :placeholder="amount_eg">
        </q-input>

        <template v-if="loading_payment">
          <div class="flex justify-center q-pa-sm">
            <q-spinner-ios size="sm" />
          </div>
        </template>
        <template v-else>
          <NoData
            v-if="!data && !loading"
            :message="$t('No available payment methods')"
            :subtitle="$t('No available data')"
          />

          <q-list>
            <template v-for="items in data" :key="items">
              <q-item
                clickable
                v-ripple:purple
                tag="label"
                class="border-grey radius8 q-mb-sm"
                :class="{
                  'border-primary': payment_uuid == items.payment_uuid,
                }"
              >
                <q-item-section avatar>
                  <q-radio
                    v-model="payment_uuid"
                    :val="items.payment_uuid"
                    unchecked-icon="panorama_fish_eye"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    <template v-if="items.payment_code == 'paydelivery'">
                      <div class="text-weight-medium text-subtitle2">
                        {{ items.attr2 }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ items.payment_name }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="text-weight-medium text-subtitle2">
                        {{ items.attr1 }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ items.attr2 }}
                      </div>
                    </template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-icon name="arrow_forward_ios"></q-icon>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <q-item
              clickable
              v-ripple:purple
              tag="label"
              class="border-grey radius8 q-mb-sm"
              to="/account/payments"
            >
              <q-item-section>
                <q-item-label>
                  <div class="text-weight-medium text-subtitle2">
                    {{ $t("Add New Payment Method") }}
                  </div>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>
                  <q-icon name="arrow_forward_ios"></q-icon>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-card-section>
      <q-card-actions class="q-pl-md q-pr-md myshadow">
        <q-btn
          :color="!isCanAdd ? 'disabled' : 'primary'"
          :text-color="!isCanAdd ? 'disabled' : 'white'"
          class="fit"
          size="large"
          rounded
          unelevated
          :disable="!isCanAdd"
          :loading="loading || is_redirect"
          @click="onSubmit"
        >
          <div class="text-weight-bold text-subtitle2">
            {{ $t("confirm top up") }}
          </div>
        </q-btn>

        <q-btn @click="Back" color="grey" flat class="fit" size="large">
          <div class="text-weight-medium text-subtitle2 text-uppercase">
            {{ $t("Back") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { useSettingStore } from "src/stores/SettingStore";
import { NumberFormat } from "@coders-tm/vue-number-format";
import config from "src/api/config";
import { defineAsyncComponent } from "vue";

export default {
  name: "AddFunds",
  components: {
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
  },
  props: ["currency_code", "slug"],
  data() {
    return {
      data: null,
      modal: false,
      amount: 1,
      loading_payment: false,
      loading: false,
      payment_uuid: null,
      is_redirect: false,
      payment_processsing: false,
      amount_eg: "",
    };
  },
  setup() {
    const DataStore = useDataStore();
    const SettingStore = useSettingStore();
    return { DataStore, SettingStore };
  },
  mounted() {
    const number = new NumberFormat(
      this.SettingStore.settings_data?.money_config
    );
    this.amount_eg = this.$t("eg.,") + " " + number.format(10);
  },
  computed: {
    isWeb() {
      if (!this.$q.capacitor) {
        return true;
      }
      return false;
    },
    isCanAdd() {
      if (this.amount && this.payment_uuid) {
        return true;
      }
      return false;
    },
  },
  methods: {
    Back() {
      this.modal = false;
      this.$emit("afterBack");
    },
    onBeforeShow() {
      this.loading = false;
      //this.amount = null;
      this.is_redirect = false;
      this.payment_processsing = false;
      if (!this.DataStore.data.saved_payment_list) {
        this.getDefaultpayment();
      } else {
        this.payment_uuid =
          this.DataStore.data?.saved_payment_list?.default_payment_uuid || null;
      }
    },
    async getDefaultpayment() {
      try {
        this.loading_payment = true;
        const params = new URLSearchParams({
          exclude: "offline_payment",
        }).toString();
        const response = await APIinterface.fetchDataByTokenPost(
          "MyPayments",
          params
        );
        this.payment_uuid = response.details.default_payment_uuid;
        this.data = response.details.data;
      } catch (error) {
      } finally {
        this.loading_payment = false;
      }
    },
    async onSubmit() {
      try {
        this.loading = true;
        const baseURL =
          process.env.VUE_ROUTER_MODE === "history"
            ? window.location.origin + "/"
            : window.location.origin + "/#/";

        const params = new URLSearchParams({
          return_url: this.isWeb ? `${baseURL}${this.slug}` : null,
          slug: this.slug,
          isWeb: this.isWeb,
          amount: this.amount,
          payment_uuid: this.payment_uuid || "",
          currency_code: this.currency_code,
          custom_scheme: config.custom_scheme,
        }).toString();

        const response = await APIinterface.fetchDataByTokenPost(
          "prepareaddfunds",
          params
        );
        console.log("response", response);

        this.is_redirect =
          response.details?.payment_instructions?.redirect == "redirect"
            ? true
            : false;

        setTimeout(() => {
          this.is_redirect = false;
        }, 2000);

        this.$emit("afterPreparepayment", response.details);
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
