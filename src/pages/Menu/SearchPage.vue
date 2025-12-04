<template>
  <q-header
    reveal
    @reveal="scrollHandler"
    :class="{
      'bg-mydark ': $q.dark.mode,
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
        :color="$q.dark.mode ? 'white' : 'mygrey'"
        text-color="dark"
      />
      <q-toolbar-title class="text-weight-bold text-darkx">
        {{ $t("Search") }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <q-form>
      <q-input
        v-model="q"
        :label="$t('Search menu')"
        outlined
        :color="$q.dark.mode ? 'grey600' : 'grey-1'"
        :bg-color="$q.dark.mode ? 'grey600' : 'grey-1'"
        label-color="grey-5"
        borderless
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey" />
        </template>
        <template v-slot:append>
          <q-btn
            v-if="isSubmit"
            round
            color="dark"
            icon="close"
            no-caps
            unelevated
            size="sm"
            @click="resetSearch"
          />
          <q-btn
            v-else
            unelevated
            :label="$t('Search')"
            no-caps
            :color="$q.dark.mode ? 'grey300' : 'primary'"
            @click="onSubmit"
            :loading="search_loading"
          ></q-btn>
        </template>
      </q-input>
    </q-form>

    <q-space class="q-pa-md"></q-space>

    <!-- SEARCH RESULT -->
    <template v-if="hasData">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-weight-bold font15">
          {{ $t("Search results for") }} “{{ this.q }}” ({{ Count() }})
        </div>
      </div>
      <q-intersection once transition="scale" class="example-item">
        <ItemsList :data="search_data" @on-click="viewItems"></ItemsList>
      </q-intersection>
    </template>
    <template v-else-if="isSubmit">
      <div class="q-mb-md">
        <div class="text-weight-bold font15">
          {{ $t("No results for") }} “{{ this.q }}”
        </div>
        <div class="text-grey">
          {{
            $t("Sorry, no product matched for your search. Please try again")
          }}.
        </div>
      </div>
    </template>
    <!-- SEARCH RESULT -->

    <template v-if="!isSubmit">
      <div
        v-if="hasFeaturedData"
        class="row items-center justify-between q-mb-xs"
      >
        <div class="text-weight-bold font15">{{ $t("Trending Items") }}</div>
        <div>
          <q-btn
            flat
            no-caps
            :color="$q.dark.mode ? 'grey300' : 'primary'"
            to="/items/feature?tag=trending&title=Trending"
            >{{ $t("See All") }}</q-btn
          >
        </div>
      </div>

      <template v-if="loading">
        <div class="q-gutter-sm">
          <template v-for="x in 3" :key="x">
            <q-skeleton height="80px" square class="radius10 bg-mygrey" />
          </template>
        </div>
      </template>
      <template v-else>
        <q-list>
          <q-intersection once transition="scale" class="example-item">
            <ItemsList :data="data" @on-click="viewItems"></ItemsList>
          </q-intersection>
        </q-list>
      </template>
    </template>

    <ItemDetails
      ref="item_details"
      @after-addtocart="afterAddtocart"
    ></ItemDetails>

    <q-footer
      bordered
      class="bg-transparent modified-footer text-center relative-position text-dark flex flex-centerx justify-end"
    >
      <CartTotalSticky
        :morphGroupModel="morphGroupModel"
        :loading="false"
        :data="[]"
      ></CartTotalSticky>
    </q-footer>
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 18]"
    >
      <q-btn fab icon="keyboard_arrow_up" color="dark" padding="xs" />
    </q-page-scroller>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "src/stores/CartData";

export default {
  name: "SearchPage",
  data() {
    return {
      morphGroupModel: "cart",
      tag: "trending",
      loading: false,
      data: [],
      q: "",
      search_loading: false,
      search_data: [],
      isSubmit: false,
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    return { DataStorePersisted, CartData };
  },
  components: {
    ItemsList: defineAsyncComponent(() => import("components/ItemsList.vue")),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    CartTotalSticky: defineAsyncComponent(() =>
      import("components/CartTotalSticky.vue")
    ),
  },
  created() {
    this.getFeaturedItems();
  },
  computed: {
    hasData() {
      if (Object.keys(this.search_data).length > 0) {
        return true;
      }
      return false;
    },
    hasFeaturedData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getFeaturedItems() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "getFeaturedItems",
        "page=" + 1 + "&tag=" + this.tag + "&limit=3"
      )
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    viewItems(data) {
      this.$refs.item_details.showModal(true, data);
    },
    afterAddtocart() {
      this.CartData.getCart(true, null);
    },
    onSubmit() {
      if (!APIinterface.empty(this.q)) {
        this.search_loading = true;
        APIinterface.fetchDataPost("menuSearch", "q=" + this.q)
          .then((data) => {
            this.search_data = data.details.data;
          })
          .catch((error) => {
            this.search_data = [];
          })
          .then((data) => {
            this.search_loading = false;
            this.isSubmit = true;
          });
      }
    },
    Count() {
      if (Object.keys(this.search_data).length > 0) {
        return Object.keys(this.search_data).length;
      }
      return 0;
    },
    resetSearch() {
      this.isSubmit = false;
      this.search_data = [];
      this.q = "";
    },
  },
};
</script>
