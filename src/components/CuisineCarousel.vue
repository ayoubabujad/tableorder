<template>
  <template v-if="loading">
    <div class="row q-gutter-xs">
      <template v-for="items in 2" :key="items">
        <q-skeleton
          height="60px"
          square
          class="col radius20"
          :class="{
            'bg-grey600 ': $q.dark.mode,
            'bg-mygrey ': !$q.dark.mode,
          }"
        />
      </template>
    </div>
  </template>
  <template v-else>
    <q-virtual-scroll :items="data" virtual-scroll-horizontal v-slot="{ item }">
      <div class="radius20 q-mr-md bg-mygrey">
        <q-item clickable @click="this.$emit('afterCategoryselected', item)">
          <q-item-section avatar>
            <q-avatar size="50px">
              <img :src="item.url_image" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="line-height-one text-weight-medium text-body2">
              {{ item.category_name }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-virtual-scroll>
  </template>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "CuisineCarousel",
  props: ["data", "loading", "layout", "category_uuid_selected"],
  data() {
    return {};
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
};
</script>
