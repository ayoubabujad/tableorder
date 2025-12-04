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
          $t("About")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="ht-page q-pa-md q-gutter-y-md">
      <div
        v-if="UserStore.loading"
        class="row q-gutter-x-sm justify-center absolute-center text-center full-width"
      >
        <q-circular-progress indeterminate rounded size="sm" color="primary" />
        <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
      </div>

      <template v-if="hasData && !UserStore.loading">
        <div class="ht-card q-pa-md">
          <div class="text-weight-bold text-body1 line-normal ht-text-primary">
            {{ $t("Few words about") }} {{ getData.restaurant_name }}
          </div>
          <div class="text-body2">
            <span
              v-html="getData.short_description"
              :class="{ 'ellipsis-3-lines': read_more }"
            ></span>
            <q-btn
              :label="read_more ? $t('read_more') : $t('read_less')"
              flat
              unelevated
              no-caps
              color="primary"
              style="min-height: auto"
              class="q-pa-none"
              @click="read_more = !read_more"
            />
          </div>
        </div>

        <div class="ht-card q-pl-xs q-pr-xs q-pt-sm q-pb-sm">
          <q-item dense>
            <q-item-section>
              <q-item-label class="text-weight-bold text-body1 ht-text-primary">{{
                $t("Address")
              }}</q-item-label>
              <q-item-label caption class="ht-text-secondary">{{ getData.address }}</q-item-label>
              <q-btn
                unelevated
                :label="$t('Get directions')"
                no-caps
                rounded
                :href="getData.map_direction"
                target="_blank"
                class="q-mt-sm ht-btn-primary"
              />
            </q-item-section>
            <q-item-section side v-if="UserStore.data_info?.data?.static_maps">
              <q-img
                :src="UserStore.data_info?.data?.static_maps"
                style="height: 120px; width: 120px"
                loading="lazy"
                fit="cover"
                class="radius8"
              >
                <template v-slot:loading>
                  <q-skeleton
                    height="120px"
                    width="120px"
                    square
                    class="bg-grey-2"
                  />
                </template>
              </q-img>
            </q-item-section>
          </q-item>
        </div>

        <div class="ht-card q-pa-md">
          <div class="text-weight-bold text-body1 line-normal ht-text-primary">
            {{ $t("Opening hours") }}
          </div>

          <q-list dense>
            <q-expansion-item
              expand-separator
              :label="$t('Today')"
              :caption="openAt"
              class="q-pa-none"
            >
              <q-card class="text-weight-light">
                <q-card-section>
                  <div v-for="items in openHours" :key="items" class="row">
                    <div class="col text-capitalize text-body2">
                      {{ items.day }}
                    </div>
                    <div class="col text-body2">
                      {{ items.start_time }} - {{ items.end_time }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>

        <div class="ht-card q-pa-md">
          <div class="text-weight-bold text-body1 line-normal q-mb-sm ht-text-primary">
            {{ $t("Gallery") }}
          </div>

          <div style="height: 200px">
            <grid-images :items="getGallery" :cells="10" />
          </div>
        </div>
      </template>

      <PageScrollUp></PageScrollUp>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import GiGridImages from "@chinhpd/vue3-grid-images";
import { useDataStore } from "src/stores/DataStore";
import { useUserStore } from "stores/UserStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "AboutPage",
  components: {
    "grid-images": GiGridImages,
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
  },
  setup(props) {
    const UserStore = useUserStore();
    const DataStore = useDataStore();
    return { UserStore, DataStore };
  },
  data() {
    return {
      read_more: true,
    };
  },
  mounted() {
    if (!this.UserStore.data_info) {
      this.getInfo();
    }
  },
  computed: {
    hasData() {
      if (!this.UserStore.data_info) {
        return false;
      }
      if (Object.keys(this.UserStore.data_info).length > 0) {
        return true;
      }
      return false;
    },
    getData() {
      if (!this.UserStore.data_info) {
        return false;
      }
      return this.UserStore.data_info.data;
    },
    openAt() {
      if (!this.UserStore.data_info) {
        return false;
      }
      return this.UserStore.data_info.open_at;
    },
    openHours() {
      if (!this.UserStore.data_info) {
        return false;
      }
      return this.UserStore.data_info.opening_hours;
    },
    getGallery() {
      if (!this.UserStore.data_info) {
        return false;
      }
      let image = [];
      if (Object.keys(this.UserStore.data_info.gallery).length > 0) {
        Object.entries(this.UserStore.data_info.gallery).forEach(
          ([key, items]) => {
            image.push(items.image_url);
          }
        );
      }
      return image;
    },
  },
  methods: {
    getInfo() {
      this.UserStore.getInfo(null);
    },
    refresh(done) {
      this.UserStore.getInfo(done);
    },
  },
};
</script>
