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
        <q-toolbar-title class="text-weight-bold text-darkx">
          {{ $t("Reviews") }}</q-toolbar-title
        >
      </q-toolbar>
    </q-header>
    <q-page class="q-pl-md q-pr-md">
      <template v-if="loading1"></template>
      <template v-else>
        <div class="row">
          <div class="col-4 relative-position">
            <div class="absolute-center full-width text-center">
              <div class="text-h5 text-weight-bold">
                {{ review?.review_count?.ratings }}
              </div>
              <div class="text-body2 text-grey-7">
                ({{ review?.review_count?.review_count }})
              </div>
            </div>
          </div>
          <q-separator vertical></q-separator>
          <div class="col q-pa-sm">
            <div v-for="n in 5" :key="n">
              <div class="row items-center justify-between">
                <div class="text-caption col-1 text-center text-grey">
                  {{ 6 - n }}
                </div>
                <div class="col">
                  <q-slider
                    :model-value="ratings[6 - n]"
                    dense
                    color="blue-7"
                    track-color="grey-3"
                    readonly
                    :min="0"
                    :max="100"
                    thumb-size="0"
                    track-size="9px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-space class="q-pa-sm"></q-space>

        <div class="row items-center q-gutter-x-sm">
          <div class="col-3" style="width: 31%">
            <q-select
              outlined
              v-model="sort"
              :options="sortList"
              dense
              no-caps
              behavior="menu"
              bg-color="grey-2"
              rounded
              @update:model-value="resetPagination"
              map-options
              emit-value
            />
          </div>
          <div class="col scroll">
            <q-virtual-scroll
              :items="filter_start_list"
              virtual-scroll-horizontal
              v-slot="{ item }"
              class="q-pt-xs q-pb-xs"
            >
              <q-btn
                unelevated
                no-caps
                class="border-grey1 q-mr-sm"
                rounded
                @click="setFilter(item.value)"
                :color="filter_rate == item.value ? 'grey-2' : 'transparent'"
              >
                <q-icon
                  class="q-pa-none"
                  name="star"
                  size="20px"
                  color="amber-5"
                ></q-icon>
                <div class="q-pl-xs text-dark">{{ item.label }}</div>
              </q-btn>
            </q-virtual-scroll>
          </div>
        </div>
      </template>

      <q-space class="q-pa-sm"></q-space>

      <q-list>
        <q-virtual-scroll
          class="fit"
          separator
          :items="data"
          :virtual-scroll-item-size="60"
          v-slot="{ item: items }"
        >
          <q-card flat class="border-grey1 q-mb-sm radius8">
            <div class="hidden">{{ items }}</div>
            <q-card-section class="q-pa-none">
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <TextComponents
                      :description="items.review"
                      max_lenght="100"
                      :label="{
                        read_less: $t('Read less'),
                        read_more: $t('Read More'),
                      }"
                    />
                  </q-item-label>
                  <q-item-label>
                    <div
                      v-if="items.meta?.upload_images"
                      class="flex items-center q-gutter-xs"
                    >
                      <ItemGallery
                        :item_gallery="items.meta?.upload_images"
                      ></ItemGallery>
                    </div>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar top>
                  <q-avatar
                    v-if="items.as_anonymous"
                    color="primary"
                    text-color="white"
                    size="35px"
                  >
                    <span class="text-capitalize">{{ items.initial }}</span>
                  </q-avatar>
                  <q-avatar v-else size="35px">
                    <img :src="items.url_image" />
                  </q-avatar>
                </q-item-section>
                <q-item-section top>
                  <q-item-label class="text-weight-bold">{{
                    items.fullname
                  }}</q-item-label>
                  <q-item-label class="text-caption text-grey">{{
                    items.date_created
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div
                    class="flex border-grey1 radius20 items-start q-pa-xs q-gutter-x-xs"
                  >
                    <div class="borderx">
                      <q-icon
                        class="q-pa-none"
                        name="star"
                        size="15px"
                        color="amber-5"
                      ></q-icon>
                    </div>
                    <div class="text-weight-bold">
                      {{ items.rating }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-card-section>
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
          <div
            v-if="!hasItems && !loading"
            class="row q-gutter-x-sm justify-center items-center absolute-center text-center full-width"
          >
            <img src="/svg/no-data.svg" />
            <div class="text-body1 text-grey">
              {{ $t("No data available") }}
            </div>
          </div>
        </template>
        <template v-slot:loading>
          <div
            class="row q-gutter-x-sm justify-center"
            :class="{
              'absolute-center text-center full-width': page == 1,
            }"
          >
            <q-circular-progress
              indeterminate
              rounded
              size="sm"
              color="primary"
            />
            <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
          </div>
        </template>
      </q-infinite-scroll>

      <q-space class="q-pa-md"></q-space>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          color="grey-2"
          text-color="grey"
          padding="xs"
        />
      </q-page-scroller>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { defineAsyncComponent } from "vue";

const heavyList = [];
for (let i = 0; i < 5; i++) {
  heavyList.push({
    label: i + 1,
    value: i + 1,
  });
}

export default {
  name: "CategoryItems",
  components: {
    TextComponents: defineAsyncComponent(() =>
      import("components/TextComponents.vue")
    ),
    ItemGallery: defineAsyncComponent(() =>
      import("components/ItemGallery.vue")
    ),
  },
  data() {
    return {
      title: "",
      tag: null,
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      loading1: false,
      page: 1,
      data: [],
      cat_id: null,
      sort: "relevance",
      filter_start_list: heavyList,
      sortList: [
        {
          label: this.$t("Relevance"),
          value: "relevance",
        },
        {
          label: this.$t("Recent"),
          value: "recent",
        },
      ],
      review: null,
      filter_rate: null,
    };
  },
  setup(props) {
    const DataStore = useDataStore();
    return { DataStore };
  },
  computed: {
    hasItems() {
      if (!this.data) {
        return false;
      }
      return this.data.length > 0;
    },
    ratings() {
      if (!this.review) {
        return 0;
      }
      return this.review?.review_details ?? null;
    },
  },
  mounted() {
    if (this.DataStore.data?.review_data) {
      this.data = this.DataStore.data?.review_data?.data;
      this.page = this.DataStore.data?.review_data?.page;
      this.hasMore = this.DataStore.data?.review_data?.hasMore;
      this.review = this.DataStore.data?.review_data?.review;
      this.filter_rate = this.DataStore.data?.review_data?.filter_rate;
    } else {
      setTimeout(() => {
        this.$refs.nscroll?.trigger();
      }, 200);
      this.fecthReviewSummary();
    }
    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.data.review_data = {
      data: this.data,
      page: this.page,
      hasMore: this.hasMore,
      review: this.review,
      filter_rate: this.filter_rate,
    };
  },
  methods: {
    setFilter(value) {
      if (this.filter_rate && this.filter_rate == value) {
        this.filter_rate = null;
      } else {
        this.filter_rate = value;
      }
      this.resetPagination();
    },
    async fecthReviewSummary() {
      try {
        this.loading1 = true;
        const response = await APIinterface.fetchDataGet(
          "fecthReviewSummary",
          ""
        );
        console.log("response", response);
        this.review = response.details;
      } catch (error) {
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
          sort: this.sort,
          filter_rate: this.filter_rate ?? "",
        }).toString();

        const response = await APIinterface.fetchDataGet(`getReview2`, params);
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
      this.review = null;
      this.fecthReviewSummary();
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
