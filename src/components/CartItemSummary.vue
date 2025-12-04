<template>
  <q-list bordered dense class="radius10 q-pt-xs q-pb-xs">
    <q-item>
      <q-item-section avatar class="item-column-less">
        <q-avatar
          color="primary"
          text-color="white"
          icon="description"
          size="md"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("Order summary") }}</q-item-label>
      </q-item-section>
    </q-item>
    <template v-for="items in cart_items" :key="items">
      <q-item>
        <q-item-section top>
          <q-item-label class="text-caption">
            <span v-html="items.item_name"></span>
          </q-item-label>
          <q-item-label caption v-if="items.price.size_name != ''">
            <span v-html="items.price.size_name"></span>
          </q-item-label>
          <q-item-label caption>
            <template v-if="items.special_instructions != ''">
              <div>{{ items.special_instructions }}</div>
            </template>

            <template v-if="items.attributes != ''">
              <template
                v-for="attributes in items.attributes"
                :key="attributes"
              >
                <p class="no-margin">
                  <template
                    v-for="(attributes_data, attributes_index) in attributes"
                  >
                    {{ attributes_data
                    }}<template v-if="attributes_index < attributes.length - 1"
                      >,
                    </template>
                  </template>
                </p>
              </template>
            </template>

            <!-- addons -->
            <div v-for="addons in items.addons" :key="addons">
              <template
                v-for="addon_items in addons.addon_items"
                :key="addon_items"
              >
                {{ addon_items.sub_item_name }}
              </template>
            </div>
            <!-- addons -->
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label class="text-caption">
            <template v-if="items.price.discount <= 0">
              {{ items.price.pretty_total }}
            </template>
            <template v-else>
              {{ items.price.pretty_total_after_discount }}
            </template>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <q-separator class="q-mb-sm"></q-separator>
    <template v-for="items in cart_summary" :key="items">
      <q-item v-if="items.type != 'total'" class="item-normal-height">
        <q-item-section>
          <q-item-label class="text-caption">{{ items.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label class="text-caption">{{ items.value }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script>
export default {
  name: "CartItemSummary",
  props: ["cart_loading", "cart_uuid", "cart_items", "cart_summary"],
  setup() {
    return {};
  },
};
</script>
