<template>
  <q-pull-to-refresh @refresh="refresh">
    <!-- 🎨 Theme Header -->
    <q-header class="ht-header">
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          class="ht-btn-ghost"
        />
        <q-toolbar-title class="text-weight-bold text-white">{{
          $t("Payment Methods")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="ht-page q-pa-md">
      <template v-if="loading">
        <template v-for="items in 5" :key="items">
          <q-skeleton
            height="40px"
            class="q-mb-sm"
            :class="{
              'bg-grey600': $q.dark.mode,
              'bg-mygrey': !$q.dark.mode,
            }"
          />
        </template>
        <q-space class="q-pa-md"></q-space>
        <template v-for="items in 5" :key="items">
          <q-skeleton
            height="40px"
            class="q-mb-sm"
            :class="{
              'bg-grey600': $q.dark.mode,
              'bg-mygrey': !$q.dark.mode,
            }"
          />
        </template>
      </template>
      <template v-else>
        <!-- 💳 Linked Payment Methods -->
        <div class="ht-section-title q-mb-md">
          <q-icon name="o_credit_card" class="ht-text-accent" />
          {{ $t("Linked Methods") }}
        </div>

        <template v-if="!hasData">
          <div class="ht-card q-pa-md q-mb-md">
            <div class="ht-text-secondary text-center">
              {{ $t("You don't have link payment") }}
            </div>
          </div>
        </template>
        <template v-else>
          <template v-for="items in data" :key="items">
            <div
              class="ht-list-item"
              :class="{ 'selected': default_payment_uuid == items.payment_uuid }"
              @click="setDefaultPayment(items)"
            >
              <div class="flex items-center q-gutter-md">
                <template v-if="items.logo_type == 'icon'">
                  <div class="ht-icon-box">
                    <q-icon
                      :name="
                        SettingStore.payment_icons[items.payment_code]
                          ? SettingStore.payment_icons[items.payment_code].icon
                          : 'credit_card'
                      "
                      size="24px"
                    ></q-icon>
                  </div>
                </template>
                <template v-else>
                  <q-img
                    :src="items.logo_image"
                    style="height: 48px; width: 48px"
                    loading="lazy"
                    fit="scale-down"
                    class="radius8"
                  >
                    <template v-slot:loading>
                      <q-skeleton height="48px" width="48px" square class="bg-grey-2" />
                    </template>
                  </q-img>
                </template>
                <div class="flex-1">
                  <div class="text-weight-bold ht-text-primary">{{ items.attr1 }}</div>
                  <div class="ht-text-secondary text-caption">{{ items.attr2 }}</div>
                </div>
                <div v-if="default_payment_uuid == items.payment_uuid">
                  <span class="ht-badge">{{ $t('Default') }}</span>
                </div>
                <div class="ht-radio" :class="{ 'checked': default_payment_uuid == items.payment_uuid }"></div>
              </div>
            </div>
          </template>
        </template>

        <div class="ht-divider q-my-lg"></div>

        <!-- ➕ Add Payment Methods -->
        <div class="ht-section-title q-mb-md">
          <q-icon name="o_add_card" class="ht-text-accent" />
          {{ $t("Add Methods") }}
        </div>

        <template v-if="!hasPaymentList">
          <div class="ht-card q-pa-md">
            <div class="ht-text-secondary text-center">
              {{ $t("No payment available") }}
            </div>
          </div>
        </template>
        <template v-else>
          <template v-for="items in payment_list" :key="items">
            <div class="ht-list-item" @click="onSelectPayment(items)">
              <div class="flex items-center q-gutter-md">
                <template v-if="items.logo_type == 'icon'">
                  <div class="ht-icon-box">
                    <q-icon
                      :name="
                        SettingStore.payment_icons[items.payment_code]
                          ? SettingStore.payment_icons[items.payment_code].icon
                          : 'credit_card'
                      "
                      size="24px"
                    ></q-icon>
                  </div>
                </template>
                <template v-else>
                  <q-img
                    :src="items.logo_image"
                    style="height: 48px; width: 48px"
                    loading="lazy"
                    fit="scale-down"
                    class="radius8"
                  >
                    <template v-slot:loading>
                      <q-skeleton height="48px" width="48px" square class="bg-grey-2" />
                    </template>
                  </q-img>
                </template>
                <div class="flex-1">
                  <div class="text-weight-bold ht-text-primary">{{ items.payment_name }}</div>
                </div>
                <q-icon name="chevron_right" class="ht-text-secondary" />
              </div>
            </div>
          </template>
        </template>
      </template>

      <LoaderDialog ref="loader_dialog"></LoaderDialog>

      <PaymentComponents
        ref="payment_components"
        :payment_credentials="payment_credentials"
        @after-addpayment="afterAddpayment"
      ></PaymentComponents>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import { useUserStore } from "stores/UserStore";

export default {
  name: "PaymentMethods",
  components: {
    LoaderDialog: defineAsyncComponent(() =>
      import("components/LoaderDialog.vue")
    ),
    PaymentComponents: defineAsyncComponent(() =>
      import("components/PaymentComponents.vue")
    ),
  },
  data() {
    return {
      modal: false,
      loading: false,
      data: [],
      payment_list: [],
      payment_credentials: [],
      default_payment_uuid: "",
      redirect: "",
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const UserStore = useUserStore();
    return { DataStorePersisted, SettingStore, UserStore };
  },
  mounted() {
    this.redirect = this.$route.query.redirect ?? null;
    this.paymentListnew();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasPaymentList() {
      if (Object.keys(this.payment_list).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    async paymentListnew() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "paymentListnew",
        "currency_code=" + this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details.data;
          this.default_payment_uuid = data.details.default_payment_uuid;
          this.payment_list = data.details.payment_list;
          this.payment_credentials = data.details.credentials;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    async refresh(done) {
      this.$refs.loader_dialog.modal = true;
      APIinterface.fetchDataByTokenPost(
        "paymentListnew",
        "currency_code=" + this.DataStorePersisted.getUseCurrency()
      )
        .then((data) => {
          this.data = data.details.data;
          this.default_payment_uuid = data.details.default_payment_uuid;
          this.payment_list = data.details.payment_list;
          this.payment_credentials = data.details.credentials;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.$refs.loader_dialog.modal = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    setDefaultPayment(data) {
      this.$refs.loader_dialog.modal = true;
      APIinterface.fetchDataByTokenPost(
        "setDefaultPayment",
        "payment_uuid=" + data.payment_uuid
      )
        .then((data) => {
          this.$router.replace(`${this.redirect}?refresh=1`);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.$refs.loader_dialog.modal = false;
        });
    },
    onSelectPayment(data) {
      this.$refs.payment_components.onSelectPayment(data);
    },
    afterAddpayment() {
      if (!APIinterface.empty(this.redirect)) {
        this.$router.replace(this.redirect);
      } else {
        this.refresh(null);
      }
    },
  },
};
</script>
