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
          $t("Points")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md q-gutter-y-md">
      <q-card class="radius8 box-shadow0 bg-white q-pa-sm">
        <q-item>
          <q-item-section>
            <q-item-label class="text-weight-bold text-body1">{{
              $t("Available Points")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Your points transaction history") }}
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

      <q-tabs
        v-model="tabs"
        dense
        class="text-grey"
        active-color="transparent"
        indicator-color="transparent"
        align="justify"
        narrow-indicator
        no-caps
        @update:model-value="resetPagination"
      >
        <template v-for="items in tabList" :key="items">
          <q-tab :name="items.value" no-caps content-class="text-weight-500 ">
            <template v-slot:default>
              <q-btn
                no-caps
                unelevated
                :color="tabs == items.value ? 'primary' : 'transparent'"
                :text-color="tabs == items.value ? 'white' : 'grey'"
                rounded
                style="min-width: 150px"
                dense
              >
                <div>{{ items.label }}</div>
              </q-btn>
            </template>
          </q-tab>
        </template>
      </q-tabs>

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
            :message="$t('No loyalty points yet.')"
            :subtitle="$t('no_points_yet')"
          />
        </template>
        <template v-slot:loading>
          <LoadingData :page="page"></LoadingData>
        </template>
      </q-infinite-scroll>

      <PageScrollUp></PageScrollUp>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "PointPage",
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    return { SettingStore, DataStore };
  },
  data() {
    return {
      tabs: "transactions",
      tabList: [
        {
          value: "transactions",
          label: this.$t("Transactions"),
        },
        {
          value: "points_merchant",
          label: this.$t("Points by merchant"),
        },
      ],
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      page: 1,
      data: [],
      loading1: false,
      balance: 0,
    };
  },
  mounted() {
    if (this.DataStore.data?.pointList) {
      this.tabs = this.DataStore.data?.pointList?.tabs;
      this.data = this.DataStore.data?.pointList?.data;
      this.page = this.DataStore.data?.pointList?.page;
      this.hasMore = this.DataStore.data?.pointList?.hasMore;
      this.balance = this.DataStore.data?.pointList?.balance;
    } else {
      this.getAvailablePoints();
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }

    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.pointList = {
      tabs: this.tabs,
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
      balance: this.balance,
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
    async getAvailablePoints() {
      try {
        this.loading1 = true;
        const response = await APIinterface.fetchDataByTokenPost(
          "getAvailablePoints"
        );
        console.log("response", response);
        this.balance = response.details.total;
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

        const method =
          this.tabs == "transactions"
            ? "getPointsTransaction"
            : "getPointsTransactionMerchant";

        const response = await APIinterface.fetchGet(`${method}?${params}`);
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
        this.getAvailablePoints();
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
  },
};
</script>
