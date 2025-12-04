<template>
  <q-item>
    <q-item-section side top>
      <q-img
        :src="data.photo"
        style="width: 60px; height: 60px"
        fit="cover"
        spinner-color="primary"
        spinner-size="xs"
        class="rounded-borders"
      ></q-img>
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-weight-bold">{{ data.item_name }}</q-item-label>
      <q-item-label caption>
        <div class="ellipsis" v-if="data.description">
          {{ data.description }}
        </div>
        <div class="text-grey q-mt-xs font11">
          <template v-if="data.discount > 0">
            {{ data.qty }} x
            <span class="text-strike q-pr-sm"
              ><NumberFormat :amount="data.price"></NumberFormat
            ></span>
            <NumberFormat :amount="data.price_after_discount"></NumberFormat>
          </template>
          <template v-else>
            {{ data.qty }} x <NumberFormat :amount="data.price"></NumberFormat>
          </template>
        </div>
        <div
          class="text-darkx q-mt-xs"
          :class="{
            'text-grey300': $q.dark.mode,
            'text-dark': !$q.dark.mode,
          }"
        >
          <NumberFormat :amount="data.qty * data.price"></NumberFormat>
        </div>

        <div v-if="data.special_instructions">
          {{ data.special_instructions }}
        </div>

        <!-- START ADDON -->
        <template v-if="hasAddon">
          <q-space class="q-pa-xs"></q-space>
          <template v-for="addon in data.addons" :key="addon">
            <div class="q-mb-xs">
              <div class="text-weight-bold">{{ addon.subcategory_name }}</div>
              <template
                v-for="addon_items in addon.addon_items"
                :key="addon_items"
              >
                <div class="row items-start font11">
                  <div class="col">
                    {{ addon_items.qty }} x {{ addon_items.pretty_price }}
                    {{ addon_items.sub_item_name }}
                  </div>
                  <div class="col-4 text-right">
                    {{ addon_items.pretty_addons_total }}
                  </div>
                </div>
              </template>
            </div>
          </template>
        </template>
        <!-- END ADDON -->
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "ItemListComponents",
  props: ["data"],
  components: {
    NumberFormat: defineAsyncComponent(() =>
      import("components/NumberFormat.vue")
    ),
  },
  computed: {
    hasAddon() {
      if (Object.keys(this.data.addons).length > 0) {
        return true;
      }
      return false;
    },
  },
};
</script>
