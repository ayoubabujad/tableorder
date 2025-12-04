<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      reveal
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
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
          $t("Bookings")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md q-gutter-y-md">
      <q-card class="radius8 box-shadow0 bg-white q-pa-sm">
        <q-item>
          <q-item-section>
            <q-item-label class="text-weight-bold text-body1">{{
              $t("Total Bookings")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Your bookings reservations") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <q-spinner-ios size="sm" v-if="loading1" />
              <div v-else class="text-weight-bold text-yellow-9 text-h6">
                <pre>{{ summary?.total_reservation }}</pre>
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
        align="left"
        narrow-indicator
        no-caps
        @update:model-value="resetPagination"
        mobile-arrows
      >
        <template v-for="items in tabList" :key="items">
          <q-tab
            :name="items.value"
            no-caps
            content-class="text-weight-500 "
            style="padding: 0px"
          >
            <template v-slot:default>
              <q-btn
                no-caps
                unelevated
                :color="tabs == items.value ? 'primary' : 'transparent'"
                :text-color="tabs == items.value ? 'white' : 'grey'"
                rounded
                dense
                style="min-width: 100px"
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
          v-slot="{ item, index }"
        >
          <q-card
            flat
            class="radius8 box-shadow0 bg-white q-pa-xs q-mb-sm cursor-pointer"
            @click="viewDetails(item, index)"
          >
            <q-item dense>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t("Reservation ID")
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ item.reservation_id }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t("Guest")
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ item.guest_number }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t("Date")
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ item.reservation_date }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t("Status")
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-capitalize">
                  <q-badge
                    :color="
                      DataStore.statusBookingColor[toSeo(item.status_raw)]
                        ?.bg || 'primary'
                    "
                    :text-color="
                      DataStore.statusBookingColor[toSeo(item.status_raw)]
                        ?.text || 'white'
                    "
                    class="text-capitalize"
                    rounded
                  >
                    <div class="text-weight-bold q-pa-xs">
                      {{ item.status }}
                    </div>
                  </q-badge>
                </q-item-label>
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
            :message="$t('No Bookings')"
            :subtitle="
              tabs == 'all' ? $t('no_bookings') : $t('No available data')
            "
            :isCenter="hasItems ? true : false"
          />
        </template>
        <template v-slot:loading>
          <LoadingData :page="page"></LoadingData>
        </template>
      </q-infinite-scroll>

      <PageScrollUp></PageScrollUp>

      <BookingDetails
        ref="ref_booking"
        :cancel_reason="cancel_reason"
        @after-cancel="afterCancel"
      ></BookingDetails>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";

export default {
  name: "BookingList",
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
    BookingDetails: defineAsyncComponent(() =>
      import("components/BookingDetails.vue")
    ),
  },
  data() {
    return {
      tabs: "",
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      page: 1,
      data: [],
      loading1: false,
      summary: null,
      tabList: [],
      cancel_reason: null,
    };
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    return { SettingStore, DataStore };
  },
  computed: {
    hasItems() {
      if (!this.data) {
        return false;
      }
      return this.data.length > 0;
    },
  },
  mounted() {
    if (this.DataStore.data?.bookingList) {
      this.tabList = this.DataStore.data?.bookingList?.tabList;
      this.tabs = this.DataStore.data?.bookingList?.tabs;
      this.data = this.DataStore.data?.bookingList?.data;
      this.page = this.DataStore.data?.bookingList?.page;
      this.hasMore = this.DataStore.data?.bookingList?.hasMore;
      this.summary = this.DataStore.data?.bookingList?.summary;
    } else {
      this.setTab();
      this.fetchBalance();
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }
    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.bookingList = {
      tabList: this.tabList,
      tabs: this.tabs,
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
      summary: this.summary,
    };
  },
  methods: {
    viewDetails(value, index) {
      this.$refs.ref_booking.ViewDetails(value, index);
    },
    afterCancel(value, index) {
      if (this.data[index]) {
        this.data[index] = value;
      }
    },
    openBooking(value) {
      console.log("openBooking", value);
      this.$refs.ref_details.data = value;
      this.$refs.ref_details.modal = true;
    },
    setTab() {
      const Tabs = this.SettingStore.settings_data?.booking_status_list;
      if (Tabs) {
        this.tabs = Object.keys(Tabs)[0];
        Object.entries(Tabs).forEach(([key, items]) => {
          this.tabList.push({
            label: items,
            value: key,
          });
        });
      }
    },
    async fetchBalance() {
      try {
        this.loading1 = true;
        const response = await APIinterface.fetchGetBooking("BookingSummary");
        this.summary = response.details.summary;
        this.cancel_reason = response.details.cancel_reason;
      } catch (error) {
        this.summary = null;
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
          status: this.tabs,
        }).toString();

        const response = await APIinterface.fetchGetBooking(
          `BookingList?${params}`
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
    toSeo(value) {
      if (!value) {
        return;
      }
      let text = value;
      let result = text.toLowerCase().replace(/\s+/g, "_");
      return result;
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
  },
};
</script>
