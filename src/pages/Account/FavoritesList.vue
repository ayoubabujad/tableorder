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
          $t("Favorites")
        }}</q-toolbar-title>
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
            class="ht-card q-mb-sm q-pb-sm cursor-pointer"
            @click.stop="onClickItem(items)"
          >
            <q-item>
              <q-item-section avatar v-if="items.url_image">
                <q-img
                  :src="items.url_image"
                  style="height: 80px; width: 80px"
                  loading="lazy"
                  fit="cover"
                  class="radius8"
                  ratio="9/16"
                >
                  <template v-slot:loading>
                    <q-skeleton
                      height="80px"
                      width="80px"
                      square
                      class="bg-grey-2"
                    />
                  </template>
                </q-img>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ items.item_name }}</q-item-label>
                <q-item-label caption lines="2">{{
                  items.item_description
                }}</q-item-label>

                <div class="flex justify-between q-mt-sm">
                  <div>{{ items.lowest_price }}</div>
                  <div v-if="items.total_reviews > 0">
                    <div class="flex items-center text-caption q-gutter-x-xs">
                      <div><q-icon name="star" color="amber-5"></q-icon></div>
                      <div class="text-weight-bold">
                        {{ items.average_rating }}
                      </div>
                      <div>({{ items.total_reviews }})</div>
                    </div>
                  </div>
                </div>
              </q-item-section>
              <q-item-section side top>
                <div class="column justify-between full-height">
                  <div class="col-4">
                    <FavsItems
                      ref="favs"
                      :item_token="items.item_uuid"
                      :cat_id="items.cat_id"
                      :active="items.save_fav"
                      :data="items"
                      @after-savefav="afterSavefav"
                    />
                  </div>
                  <div class="col-4">
                    <q-btn
                      round
                      unelevated
                      :color="!items.item_available ? 'disabled' : 'primary'"
                      :text-color="!items.item_available ? 'disabled' : 'white'"
                      size="sm"
                      icon="las la-plus"
                      :disable="!items.item_available"
                      class="myshadow"
                      @click.stop="onClickItem(items)"
                    />
                  </div>
                </div>
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
            v-if="!hasItems && !loading"
            :message="$t('No Favorites item added yet')"
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

      <!-- 🛒 Theme Footer -->
      <q-footer class="ht-footer q-pa-sm" v-if="CartData.hasItem">
        <q-item>
          <q-item-section>
            <q-item-label class="text-weight-medium text-body1 ht-text-primary">{{
              $t("Total Price")
            }}</q-item-label>
            <q-item-label class="text-h6 text-weight-bold ht-text-accent">
              {{ CartData.getSubtotal }}
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-btn
              v-close-popup
              unelevated
              rounded
              no-caps
              class="full-width ht-btn-primary"
              :label="$t('Checkout')"
              size="lg"
              :disable="!CartData.canCheckout"
              to="/checkout"
            >
            </q-btn>
          </q-item-section>
        </q-item>
      </q-footer>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { userCartData } from "stores/CartData";

export default {
  name: "FavoritesList",
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
    FavsItems: defineAsyncComponent(() => import("components/FavsItems.vue")),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
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
  setup() {
    const DataStore = useDataStore();
    const CartData = userCartData();
    return { DataStore, CartData };
  },
  mounted() {
    if (!this.CartData.hasItem) {
      this.CartData.getCart(true, null);
    }

    if (this.DataStore.data?.favList) {
      this.data = this.DataStore.data?.favList?.data;
      this.page = this.DataStore.data?.favList?.page;
      this.hasMore = this.DataStore.data?.favList?.hasMore;
    } else {
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
    }

    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.favList = {
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
    afterAddtocart() {
      this.CartData.getCart(true, null);
    },
    onClickItem(value) {
      console.log("onClickItem", value);
      this.$refs.item_details.showModal(true, {
        item_uuid: value.item_uuid,
        cat_id: value.cat_id,
      });
    },
    afterSavefav(value) {
      console.log("value", value);
      this.data = this.data.filter((item) => item.item_id !== value.item_id);
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
          `fetchfavouritesitems?${params}`
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
  },
};
</script>
