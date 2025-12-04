<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header reveal @reveal="scrollHandler">
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
        <q-toolbar-title class="text-weight-bold text-darkx">{{
          $t(title)
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <q-list>
        <ItemsList :data="data" @on-click="viewItems"></ItemsList>
      </q-list>

      <q-space class="q-pa-md"></q-space>

      <q-infinite-scroll
        ref="nscroll"
        @load="fetchData"
        :offset="250"
        :disable="scroll_disabled"
      >
        <template v-slot:default>
          <NoData
            v-if="!hasItems && !loading"
            :message="$t('No Results')"
            :subtitle="$t('No available data')"
          />
        </template>
        <template v-slot:loading>
          <LoadingData :page="page"></LoadingData>
        </template>
      </q-infinite-scroll>

      <ItemDetails
        ref="item_details"
        @after-addtocart="afterAddtocart"
      ></ItemDetails>

      <PageScrollUp></PageScrollUp>
      <CartFooter></CartFooter>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "stores/CartData";
import { useDataStore } from "src/stores/DataStore";
import auth from "src/api/auth";

export default {
  name: "CategoryItems",
  data() {
    return {
      morphGroupModel: "cart",
      title: "",
      tag: null,
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      page: 1,
      data: [],
      cat_id: null,
      client_uuid: null,
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    const DataStore = useDataStore();
    return { DataStorePersisted, CartData, DataStore };
  },
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    ItemsList: defineAsyncComponent(() => import("components/ItemsList.vue")),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
    CartFooter: defineAsyncComponent(() => import("components/CartFooter.vue")),
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
    if (auth.authenticated()) {
      const userInfo = auth.getUser();
      this.client_uuid = userInfo?.client_uuid;
    }

    this.title = this.$route.query.title;
    this.tag = this.$route.query.tag ?? null;
    this.cat_id = this.$route.query.cat_id ?? null;

    if (
      this.DataStore.data?.featured_data &&
      this.DataStore.data?.tag == this.tag &&
      this.DataStore.data?.cat_id == this.cat_id
    ) {
      this.data = this.DataStore.data?.featured_data?.data;
      this.page = this.DataStore.data?.featured_data?.page;
      this.hasMore = this.DataStore.data?.featured_data?.hasMore;
    } else {
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }
    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.tag = this.tag;
    this.DataStore.data.cat_id = this.cat_id;
    this.DataStore.data.featured_data = {
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
    };
  },
  methods: {
    afterAddtocart() {
      this.CartData.getCart(true, null);
    },
    viewItems(data) {
      this.$refs.item_details.showModal(true, data);
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
          tag: this.tag ?? "",
          cat_id: this.cat_id ?? "",
          currency_code: this.DataStorePersisted.getUseCurrency(),
          client_uuid: this.client_uuid ?? "",
        }).toString();

        const response = await APIinterface.fetchDataPost(
          `getFeaturedItems`,
          params
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
    //
  },
};
</script>
