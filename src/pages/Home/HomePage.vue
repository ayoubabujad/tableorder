<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="q-pa-md">
      <q-space class="q-pa-sm"></q-space>
      <div class="flex items-center q-gutter-x-sm">
        <div>
          <q-btn
            outline
            :color="$q.dark.mode ? 'bluegrey500' : 'grey-5'"
            icon="las la-map-marker"
            class="circle-borders"
            @click.stop="showAddress"
          />
        </div>
        <div>
          <!-- <pre>{{ DataStorePersisted.location_data }}</pre> -->
          <q-btn
            flat
            no-caps
            :color="$q.dark.mode ? 'grey300' : 'primary'"
            class="q-pa-none"
            @click.stop="showAddress"
          >
            <div
              class="ellipsis-2-lines line-normal text-left"
              style="max-width: 200px"
            >
              <template v-if="SettingStore.search_mode == 'location'">
                <div>
                  {{
                    DataStorePersisted.location_data?.complete_address ??
                    $t("Select your location")
                  }}
                </div>
                <div>
                  {{ DataStorePersisted.location_data?.country_name }}
                </div>
              </template>
              <template v-else>
                {{
                  DataStorePersisted.place_data
                    ? DataStorePersisted.place_data?.formatted_address
                    : $t("Select your address")
                }}
              </template>
            </div>
          </q-btn>
        </div>
      </div>
      <q-space class="q-pa-sm"></q-space>

      <CuisineCarousel
        ref="cuisine"
        :layout="1"
        :data="DataStore.data?.home_data?.category ?? null"
        :loading="DataStore.loading_home"
        @after-categoryselected="afterCategoryselected"
      ></CuisineCarousel>

      <q-space class="q-pa-sm"></q-space>

      <BannerCarousel
        ref="banner"
        :data="DataStore.data?.home_data?.banner ?? null"
        :loading="DataStore.loading_home"
        @view-items="viewItems"
      >
      </BannerCarousel>

      <q-space class="q-pa-sm"></q-space>

      <!-- BEST SELLER -->
      <div v-if="DataStore.data?.home_data?.best_seller" class="q-gutter-y-sm">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-weight-bold text-subtitle1">
            {{ $t("Best Seller") }}
          </div>
          <div>
            <q-btn
              flat
              no-caps
              :color="$q.dark.mode ? 'grey300' : 'primary'"
              to="/items/feature?tag=best_seller&title=Best Seller"
              >{{ $t("See All") }}</q-btn
            >
          </div>
        </div>
        <ItemsRow
          ref="items_grid"
          :data="DataStore.data?.home_data?.best_seller ?? null"
          :loading="DataStore.loading_home"
          @view-items="viewItems"
          @after-savefav="afterSavefav"
        ></ItemsRow>

        <!-- RECOMMEDED -->
        <div
          v-if="DataStore.data?.home_data?.recommnded"
          class="row items-center justify-between"
        >
          <div class="text-weight-bold text-subtitle1">
            {{ $t("Recommended") }}
          </div>
          <div>
            <q-btn
              flat
              no-caps
              :color="$q.dark.mode ? 'grey300' : 'primary'"
              to="/items/feature?tag=recommended&title=Recommended"
              >{{ $t("See All") }}</q-btn
            >
          </div>
        </div>
        <ItemsColumn
          ref="items_column"
          :data="DataStore.data?.home_data?.recommnded ?? null"
          :loading="DataStore.loading_home"
          @view-items="viewItems"
        ></ItemsColumn>

        <CustomerReviews
          ref="reviews"
          :data="DataStore.data?.home_data?.reviews ?? null"
          :loading="DataStore.loading_home"
        >
        </CustomerReviews>
      </div>

      <q-space class="q-pa-lg"></q-space>

      <ItemDetails
        ref="item_details"
        @after-addtocart="afterAddtocart"
      ></ItemDetails>

      <!-- <AddressRecent
        ref="ref_addressrecent"
        :isLogin="isLogin"
        @set-location="setLocation"
      >
      </AddressRecent> -->
      <component
        :is="AddressRecent"
        ref="ref_addressrecent"
        :isLogin="isLogin"
        @set-location="setLocation"
        @afterChooselocation="afterChooselocation"
      >
      </component>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "stores/CartData";
import { useSettingStore } from "stores/SettingStore";
import { useDataStore } from "stores/DataStore";
import auth from "src/api/auth";

export default {
  name: "HomePage",
  components: {
    CuisineCarousel: defineAsyncComponent(() =>
      import("components/CuisineCarousel.vue")
    ),
    ItemsRow: defineAsyncComponent(() => import("components/ItemsRow.vue")),
    ItemsColumn: defineAsyncComponent(() =>
      import("components/ItemsColumn.vue")
    ),
    BannerCarousel: defineAsyncComponent(() =>
      import("components/BannerCarousel.vue")
    ),
    CustomerReviews: defineAsyncComponent(() =>
      import("components/CustomerReviews.vue")
    ),
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();

    const AddressRecent = defineAsyncComponent(() =>
      SettingStore.search_mode == "location"
        ? import("components/AddressRecentLocation.vue")
        : import("components/AddressRecent.vue")
    );

    return {
      DataStorePersisted,
      CartData,
      SettingStore,
      DataStore,
      AddressRecent,
    };
  },
  data() {
    return {
      best_seller_flag: false,
      recommended_flag: false,
      review_flag: false,
      client_uuid: null,
    };
  },
  mounted() {
    if (auth.authenticated()) {
      const useInfo = auth.getUser();
      this.client_uuid = useInfo.client_uuid;
    }

    if (!this.DataStore.data?.home_data) {
      this.DataStore.fetchHome(this.client_uuid);
    }

    this.DataStore.show_toobar = true;
  },
  computed: {
    isLogin() {
      return auth.authenticated();
    },
  },
  methods: {
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.DataStore.fetchHome(null);
    },
    showAddress() {
      this.$refs.ref_addressrecent.modal = true;
    },
    setLocation(value) {
      this.DataStorePersisted.place_data = value;
      this.DataStorePersisted.coordinates.lat = value?.latitude;
      this.DataStorePersisted.coordinates.lng = value?.longitude;

      if (!value?.address_uuid) {
        this.DataStorePersisted.saveRecentAddress(value);
      }
      this.CartData.getCart(false);
    },
    afterChooselocation(value) {
      console.log("afterChooselocation", value);
      this.CartData.getCart(false);
    },
    afterCategoryselected(value) {
      console.log("afterCategoryselected", value);
      this.$router.push({
        path: "/items/category",
        query: {
          title: value.category_name,
          category_uiid: value.category_uiid,
          cat_id: value.cat_id,
        },
      });
    },
    viewItems(data) {
      this.$refs.item_details.showModal(true, data);
    },
    afterAddtocart(value) {
      console.log("afterAddtocart", value);
    },
    afterSavefav(value, isActive) {
      value.is_favorite = isActive;
    },
    //
  },
};
</script>
