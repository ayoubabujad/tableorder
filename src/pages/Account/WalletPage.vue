<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header reveal>
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
        <q-toolbar-title class="text-weight-bold">{{
          $t("Digital Wallet")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md q-gutter-y-md">
      <q-card class="radius8 box-shadow0 bg-white q-pa-sm">
        <q-item>
          <q-item-section>
            <q-item-label class="text-weight-bold text-body1">{{
              $t("Available Balance")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Your wallet transaction history") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <q-spinner-ios size="sm" v-if="loading1" />
              <div v-else class="text-weight-bold text-yellow-9 text-h6">
                {{ balance }}
              </div>
            </q-item-label>
          </q-item-section>
        </q-item></q-card
      >

      <div v-if="SettingStore.settings_data.digitalwallet_enabled_topup">
        <q-btn
          unelevated
          no-caps
          color="primary"
          size="lg"
          class="rounded full-width"
          rounded
          @click="this.$refs.ref_addfunds.modal = true"
        >
          <div class="text-weight-bold text-body1">{{ $t("Add Funds") }}</div>
        </q-btn>
      </div>

      <q-virtual-scroll
        class="fit"
        :items="bonus_data"
        virtual-scroll-horizontal
        v-slot="{ item }"
      >
        <q-card
          flat
          class="radius10 bg-light-blue-1 myshadow q-pa-xs q-mb-sm"
          style="max-width: 400px"
        >
          <q-item>
            <q-item-section>
              <q-item-label>{{ item.title }}</q-item-label>
              <q-item-label caption lines="2">{{
                item.discount_details
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </q-virtual-scroll>

      <q-list>
        <q-virtual-scroll
          class="fit"
          separator
          :items="data"
          :virtual-scroll-item-size="60"
          v-slot="{ item: items }"
        >
          <q-card flat class="radius8 box-shadow0 bg-white q-pa-xs q-mb-sm">
            <q-item>
              <q-item-section>
                <q-item-label>{{ items.transaction_description }}</q-item-label>
                <q-item-label caption>{{
                  items.transaction_date
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label
                  class="text-weight-bold"
                  :class="{
                    'text-positive': items.transaction_type == 'credit',
                    'text-negative': items.transaction_type !== 'credit',
                  }"
                  >{{ items.transaction_amount }}</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-card>
        </q-virtual-scroll>
      </q-list>

      <q-infinite-scroll
        ref="nscroll"
        @load="fetchData"
        :offset="250"
        :disable="scroll_disabled"
      >
        <template v-slot:default>
          <NoData
            v-if="!hasItems && !loading"
            :message="$t('Your wallet is empty.')"
            :subtitle="$t('No transactions found.')"
          />
        </template>
        <template v-slot:loading>
          <LoadingData :page="page"></LoadingData>
        </template>
      </q-infinite-scroll>

      <AddFunds
        ref="ref_addfunds"
        slug="account/wallet"
        :currency_code="DataStorePersisted.getCurrency"
        @after-preparepayment="afterPreparepayment"
      ></AddFunds>

      <StripeComponents
        ref="stripe"
        payment_code="stripe"
        :title="$t('Stripe')"
        @after-payment="afterPayment"
      />

      <AddFundsReceipt ref="ref_receipt"> </AddFundsReceipt>

      <PageScrollUp></PageScrollUp>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
// PWA-only: Browser handled via location.href

export default {
  name: "WalletPage",
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
    AddFunds: defineAsyncComponent(() => import("components/AddFunds.vue")),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
    AddFundsReceipt: defineAsyncComponent(() =>
      import("components/AddFundsReceipt.vue")
    ),
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStore, DataStorePersisted };
  },
  data() {
    return {
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      page: 1,
      data: [],
      loading1: false,
      balance: 0,
      bonus_data: null,
    };
  },
  mounted() {
    const error = this.$route.query?.error || null;
    const message = this.$route.query?.message || null;
    if (error) {
      APIinterface.notify("negative", error, "error_outline", this.$q);
      this.$router.replace({
        path: this.$route.path,
        query: {},
      });
    }
    if (message) {
      APIinterface.notify("positive", message, "check_circle", this.$q);
      this.$router.replace({
        path: this.$route.path,
        query: {},
      });
    }

    if (this.DataStore.data?.walletTransactions) {
      this.tabs = this.DataStore.data?.walletTransactions?.tabs;
      this.data = this.DataStore.data?.walletTransactions?.data;
      this.page = this.DataStore.data?.walletTransactions?.page;
      this.hasMore = this.DataStore.data?.walletTransactions?.hasMore;
      this.balance = this.DataStore.data?.walletTransactions?.balance;
      this.bonus_data = this.DataStore.data?.walletTransactions?.bonus_data;
    } else {
      this.fetchBalance();
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }

    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.walletTransactions = {
      tabs: this.tabs,
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
      balance: this.balance,
      bonus_data: this.bonus_data,
    };
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
    async fetchBalance() {
      try {
        this.loading1 = true;
        const response = await APIinterface.fetchDataByTokenPost(
          "fetchWalletBalance",
          new URLSearchParams({
            transaction_type: "digital_wallet",
          }).toString()
        );
        this.balance = response.details.total;
        this.bonus_data = response.details.data;
      } catch (error) {
        this.balance = 0;
      } finally {
        this.loading1 = false;
      }
    },
    async fetchData(index, done) {
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
          page: this.page,
        }).toString();

        const response = await APIinterface.fetchGet(
          `getWalletTransaction?${params}`
        );
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
        this.fetchBalance();
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
    afterPreparepayment(data) {
      try {
        this.$refs[data.payment_code].Dopayment(data);
      } catch (error) {
        this.PaymentRender(data);
      }
    },
    async PaymentRender(data) {
      let redirect = data?.payment_url || null;
      if (this.$q.capacitor) {
        await Browser.open({ url: redirect });
      } else {
        location.href = redirect;
      }
    },
    afterPayment(data) {
      this.$refs.ref_addfunds.modal = false;
      this.$refs.ref_receipt.showModal(data);

      this.resetPagination();
      setTimeout(() => {
        this.fetchBalance();
      }, 500);
    },
    //
  },
};
</script>
