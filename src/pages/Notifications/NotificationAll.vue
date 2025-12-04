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
          $t("Notifications")
        }}</q-toolbar-title>

        <q-btn
          v-if="hasItems"
          round
          dense
          icon="o_delete_outline"
          unelevated
          class="ht-btn-ghost"
          @click="confirmDeleteCart"
        />
      </q-toolbar>
    </q-header>

    <q-page class="ht-page q-pa-md">
      <q-list>
        <q-virtual-scroll
          class="fit"
          separator
          :items="data"
          :virtual-scroll-item-size="60"
          v-slot="{ item: items }"
        >
          <div
            class="ht-card q-mb-sm q-pb-xs cursor-pointer"
            @click="handleNoti(items)"
          >
            <q-item>
              <q-item-section avatar>
                <q-avatar
                  :color="
                    DataStore.notificationColor[toSeo(items.notification_type)]
                      ?.bg || 'primary'
                  "
                  :text-color="
                    DataStore.notificationColor[toSeo(items.notification_type)]
                      ?.text || 'white'
                  "
                  :icon="getIcon(items.notification_type)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ items.message }}</q-item-label>
                <q-item-label caption>{{ items.date }}</q-item-label>
              </q-item-section>
              <q-item-section v-if="!items.viewed" side top>
                <div class="ht-notification-dot"></div>
              </q-item-section>
            </q-item>
          </div>
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
            icon="/svg/bell.svg"
            v-if="!hasItems && !loading"
            :message="$t('No new notifications')"
            :subtitle="$t('pull down to refresh')"
          />
        </template>
        <template v-slot:loading>
          <LoadingData :page="page"></LoadingData>
        </template>
      </q-infinite-scroll>

      <PageScrollUp></PageScrollUp>

      <ConfirmDelete
        ref="ref_delete"
        @afterConfirm="afterConfirm"
      ></ConfirmDelete>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "NotificationsPage",
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
    ConfirmDelete: defineAsyncComponent(() =>
      import("components/ConfirmDelete.vue")
    ),
  },
  data() {
    return {
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      page: 1,
      data: [],
    };
  },
  mounted() {
    if (this.DataStore.data?.notificationList) {
      this.data = this.DataStore.data?.notificationList?.data;
      this.page = this.DataStore.data?.notificationList?.page;
      this.hasMore = this.DataStore.data?.notificationList?.hasMore;
    } else {
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }

    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.notificationList = {
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
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
    confirmDeleteCart() {
      this.$refs.ref_delete.ConfirmDelete({
        confirm: this.$t("Delete all"),
        title: this.$t("Are you sure want to delete all notifications?"),
        subtitle: this.$t("This action cannot be undone."),
      });
    },
    async afterConfirm() {
      console.log("afterConfirm");
      this.$refs.ref_delete.modal = false;
      try {
        APIinterface.showLoadingBox("", this.$q);
        await APIinterface.fetchDataByTokenPost("deleteNotifications");
        this.resetPagination();
      } catch (error) {
      } finally {
        APIinterface.hideLoadingBox(this.$q);
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
    getIcon(value) {
      if (value == "order_update") {
        return "las la-file-invoice";
      } else if (value == "chat-message") {
        return "lab la-rocketchat";
      } else if (value == "booking") {
        return "las la-chair";
      } else {
        return "o_receipt";
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
          `getNotification?${params}`
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
    handleNoti(value) {
      const id = value?.notification_uuid ?? null;
      const meta_data = value?.meta_data ?? null;
      const message_type = meta_data?.page ?? null;

      if (!value.viewed) {
        APIinterface.fetchDataByTokenPost(
          "setNotiViewed",
          new URLSearchParams({
            id: id,
          }).toString()
        );
      }

      value.viewed = true;

      if (message_type == "order-view") {
        const order_uuid = meta_data?.order_uuid ?? null;
        if (!order_uuid) {
          return;
        }
        this.$router.push({
          path: "/checkout/successful",
          query: {
            order_uuid: order_uuid,
            back: 1,
          },
        });
      } else if (message_type == "chat-view") {
        const conversation_id = meta_data?.conversation_id ?? null;
        if (!conversation_id) {
          return;
        }
        this.$router.push({
          path: "/account/chat/conversation",
          query: {
            conversation_id: conversation_id,
          },
        });
      } else if (message_type == "booking-view") {
        this.$router.push({
          path: "/account/booking",
        });
      }
    },
  },
};
</script>
