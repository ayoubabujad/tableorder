<template>
  <q-dialog
    v-model="dialog"
    :position="this.$q.screen.lt.md ? 'bottom' : 'standard'"
    transition-show="fade"
    transition-hide="fadeout"
    @before-show="getCustomerDefaultPayment"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ $t("Add Funds to Your Wallet") }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-form @submit="onSubmit">
        <q-card-section>
          <div class="text-body2 q-mb-md">
            {{ $t("topup_message") }}
          </div>

          <div class="text-body1 text-weight-medium q-mb-sm">
            {{ $t("Payment Method") }}
          </div>

          <template v-if="loading">
            <div class="q-pa-sm">
              <q-circular-progress
                indeterminate
                rounded
                size="25px"
                color="primary"
              />
            </div>
          </template>

          <template v-if="hasPayment">
            <div class="radius20 bg-mygrey">
              <q-item>
                <q-item-section avatar>
                  <template v-if="getPayment.logo_type == 'icon'">
                    <div
                      class="rounded-borders"
                      style="padding: 1px 2px"
                      :class="
                        SettingStore.payment_icons[getPayment.payment_code]
                          ? SettingStore.payment_icons[getPayment.payment_code]
                              .bg
                          : 'bg-blue'
                      "
                    >
                      <q-icon
                        :name="
                          SettingStore.payment_icons[getPayment.payment_code]
                            ? SettingStore.payment_icons[
                                getPayment.payment_code
                              ].icon
                            : 'credit_card'
                        "
                        size="sm"
                        color="white"
                      ></q-icon>
                    </div>
                  </template>
                  <template v-else>
                    <q-img
                      :src="getPayment.logo_image"
                      fit="contain"
                      style="max-height: 40px; max-width: 40px"
                      spinner-size="sm"
                      spinner-color="primary"
                    ></q-img>
                  </template>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ getPayment.attr1 }}</q-item-label>
                  <q-item-label caption>{{ getPayment.attr2 }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    :label="$t('Change')"
                    color="primary"
                    no-caps
                    :to="{
                      path: '/account/payments',
                      query: { redirect: '/account/wallet' },
                    }"
                  ></q-btn>
                </q-item-section>
              </q-item>
            </div>

            <q-input
              v-model="amount"
              :label="$t('Enter amount')"
              type="number"
              :rules="[
                (val) => val > 0 || this.$t('Please enter valid amount'),
              ]"
            />

            <q-btn
              type="submit"
              :label="$t('Add Funds')"
              :loading="loading_submit"
              unelevated
              :color="$q.dark.mode ? 'grey300' : 'primary'"
              text-color="white"
              no-caps
              class="full-width"
              size="17px"
              rounded
            />
          </template>

          <template v-else>
            <div class="q-gutter-y-sm">
              <div
                v-if="!loading"
                class="text-body q-pa-sm bg-red-2 text-dark radius10"
              >
                {{
                  $t(
                    "We noticed you haven't added a default payment method yet"
                  )
                }}.
              </div>
              <div class="text-body2">
                {{ $t("topup_message1") }}
              </div>

              <q-btn
                color="primary"
                rounded
                :label="$t('Add online payment')"
                class="fit"
                size="lg"
                no-caps
                unelevated
                :to="{
                  path: '/account/payments',
                  query: { redirect: '/account/wallet' },
                }"
              />
            </div>
          </template>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "WalletTopupform",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  data() {
    return {
      dialog: false,
      amount: 2,
      loading: false,
      default_payment: [],
      loading_submit: false,
    };
  },
  computed: {
    hasPayment() {
      if (Object.keys(this.default_payment).length > 0) {
        return true;
      }
      return false;
    },
    getPayment() {
      return this.default_payment;
    },
  },
  methods: {
    getCustomerDefaultPayment() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getCustomerDefaultPayment")
        .then((data) => {
          this.default_payment = data.details.data;
          this.$emit("setPaymentcredentials", data.details.payment_credentials);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      this.loading_submit = true;
      APIinterface.fetchDataByTokenPost(
        "prepareAddFunds",
        "amount=" +
          this.amount +
          "&payment_code=" +
          this.default_payment.payment_code +
          "&payment_uuid=" +
          this.default_payment.payment_uuid +
          "&currency_code=" +
          this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.$emit("afterPreparepayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
  },
};
</script>
