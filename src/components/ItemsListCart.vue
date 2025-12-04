<template>
  <q-list separator>
    <template v-for="items in getItems" :key="items.item_id">
      <q-slide-item @right="(opt) => onRight(opt, index)" right-color="white">
        <template v-slot:right>
          <div class="q-gutter-md">
            <q-btn
              round
              color="grey-2"
              text-color="grey-9"
              icon="close"
              size="sm"
              unelevated
              @click="closeSlide(index)"
            />
            <FavsItems
              ref="favs"
              :item_token="items.item_token"
              :cat_id="items.cat_id"
              :active="items.save_item"
              :data="items"
              @after-savefav="afterSavefav"
            />
            <q-btn
              round
              color="red-2"
              text-color="red-9"
              icon="las la-trash"
              size="sm"
              unelevated
              @click="removeItem(items)"
              :loading="loading_rm"
            />
          </div>
        </template>

        <q-item>
          <q-item-section avatar top>
            <div v-if="layout == 1">
              <div class="relative-position">
                <q-img
                  :src="items.url_image"
                  style="height: 80px; width: 90px"
                  loading="lazy"
                  fit="cover"
                  class="radius8"
                >
                  <template v-slot:loading>
                    <q-skeleton
                      height="80px"
                      width="90px"
                      square
                      class="bg-grey-2"
                    />
                  </template>
                </q-img>

                <div class="absolute-bottom q-pa-xs">
                  <div
                    class="bg-white radius28 border-grey flex items-center justify-between"
                  >
                    <div>
                      <q-btn
                        :icon="items.qty == 1 ? 'delete_outline' : 'remove'"
                        :color="items.qty == 1 ? 'negative' : 'primary'"
                        unelevated
                        dense
                        size="12px"
                        flat
                        :disable="isLoading"
                        @click="
                          lessCartQty(items.qty > 1 ? items.qty-- : 1, items)
                        "
                      />
                    </div>
                    <div class="text-weight-medium text-caption">
                      {{ items.qty }}
                    </div>
                    <div>
                      <q-btn
                        unelevated
                        dense
                        size="12px"
                        icon="add"
                        color="primary"
                        flat
                        :disable="isLoading"
                        @click="addCartQty(items.qty++, items)"
                      />
                    </div>
                  </div>
                </div>
                <!-- button -->
              </div>
            </div>
            <div v-else>
              <q-btn
                outline
                no-caps
                size="12px"
                padding="2px 5px"
                color="grey-2"
              >
                <div class="text-blue-grey-6 text-weight-bold">
                  {{ items.qty }}x
                </div>
              </q-btn>
            </div>
          </q-item-section>
          <q-item-section top>
            <q-item-label class="text-weight-medium">
              <span v-html="items.item_name"></span>

              <div v-if="items.is_free">
                <q-badge
                  outline
                  color="green"
                  rounded
                  class="q-pl-sm q-pr-sm"
                  >{{ $t("Free") }}</q-badge
                >
              </div>
            </q-item-label>
            <q-item-label>
              <q-btn
                :label="$t('Edit')"
                no-caps
                text-color="blue"
                padding="0"
                flat
                align="left"
                @click="editItem(items)"
              ></q-btn>
            </q-item-label>
            <q-item-label caption v-if="items.price.size_name != ''">
              <span v-html="items.price.size_name"></span>
            </q-item-label>
            <q-item-label>
              <span
                v-if="items.price.discount > 0"
                class="text-strike text-red q-mr-xs"
                >{{ items.price.pretty_price }}</span
              >
              <span>{{ items.price.pretty_price_after_discount }}</span>
            </q-item-label>
            <q-item-label v-if="layout == 1">
              <!-- qty -->
              <div class="flex items-center q-col-gutter-x-sm hidden">
                <div class="borderx">
                  <q-btn
                    :icon="items.qty == 1 ? 'delete_outline' : 'remove'"
                    :color="items.qty == 1 ? 'negative' : 'primary'"
                    unelevated
                    size="11px"
                    class="rounded-borders"
                    style="width: 30px"
                    @click="lessCartQty(items.qty > 1 ? items.qty-- : 1, items)"
                    :disable="isLoading"
                  ></q-btn>
                </div>
                <div class="borderx">
                  {{ items.qty }}
                </div>
                <div class="borderx">
                  <q-btn
                    icon="add"
                    color="primary"
                    unelevated
                    size="11px"
                    class="rounded-borders"
                    style="width: 30px"
                    @click="addCartQty(items.qty++, items)"
                    :disable="isLoading"
                  ></q-btn>
                </div>
              </div>
              <!-- qty -->
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
                      }}<template
                        v-if="attributes_index < attributes.length - 1"
                        >,
                      </template>
                    </template>
                  </p>
                </template>
              </template>
              <!-- end items addon and attributes -->
            </q-item-label>
          </q-item-section>
          <q-item-section top side>
            <div class="column justify-end items-end fit">
              <div class="col" v-if="layout == 1">
                <q-btn
                  round
                  :color="$q.dark.mode ? 'grey500' : 'grey-4'"
                  icon="clear"
                  size="xs"
                  unelevated
                  @click="removeItem(items)"
                  :disable="isLoading"
                />
              </div>
              <div
                class="col relative-position"
                :class="{
                  'text-negative text-weight-bold': this.layout == 1,
                }"
              >
                <div class="absolute-bottom-right">
                  <template v-if="items.price.discount <= 0">
                    {{ items.price.pretty_total }}
                  </template>
                  <template v-else>
                    {{ items.price.pretty_total_after_discount }}
                  </template>
                </div>
              </div>
            </div>
          </q-item-section>
        </q-item>

        <!-- ADDONS START HERE -->
        <template v-for="addons in items.addons" :key="addons">
          <q-item dense style="min-height: auto">
            <q-item-section
              :class="{
                width80: this.layout == 1,
              }"
              avatar
            ></q-item-section>
            <q-item-section>
              <q-item-label
                :class="{
                  'text-weight-bold': this.layout == 1,
                }"
                >{{ addons.subcategory_name }}</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item
            dense
            v-for="addons_items in addons.addon_items"
            :key="addons_items"
            style="min-height: auto"
          >
            <q-item-section
              :class="{
                width80: this.layout == 1,
              }"
              avatar
            ></q-item-section>
            <q-item-section top>
              <q-item-label>
                {{ addons_items.qty }} x {{ addons_items.pretty_price }}
                {{ addons_items.sub_item_name }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-item-label
                :class="{
                  'text-negative': this.layout == 1,
                }"
                >{{ addons_items.pretty_addons_total }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </template>
      </q-slide-item>
    </template>

    <q-item clickable v-if="item_count > maxVisible" @click="toggleShowMore">
      <q-item-section>
        <q-item-label caption>
          {{ showMore ? $t("Show Less") : $t("Show More") }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon
          :name="
            showMore ? 'eva-chevron-up-outline' : 'eva-chevron-down-outline'
          "
          class="text-grey-4"
        ></q-icon>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "ItemsListCart",
  props: [
    "layout",
    "cart_loading",
    "cart_uuid",
    "cart_items",
    "cart_subtotal",
    "item_visible",
    "item_count",
  ],
  components: {
    FavsItems: defineAsyncComponent(() =>
      import("src/components/FavsItems.vue")
    ),
  },
  data() {
    return {
      loading: false,
      data_slide: {},
      loading_rm: false,
      qty_options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      maxVisible: this.item_visible,
      showMore: false,
    };
  },
  mounted() {
    this.qty_options = [];
    for (let i = 1; i < 100; i++) {
      this.qty_options.push(i);
    }
  },
  computed: {
    isLoading() {
      if (this.loading) {
        return true;
      } else {
        if (this.cart_loading) {
          return true;
        }
      }
      return false;
    },
    getItems() {
      if (this.cart_items) {
        if (!this.maxVisible) {
          this.cart_items;
        }
        return this.showMore
          ? this.cart_items
          : this.cart_items.slice(0, this.maxVisible);
      }
      return null;
    },
  },
  methods: {
    toggleShowMore() {
      this.showMore = !this.showMore;
    },
    lessCartQty(itemQty, item) {
      itemQty--;
      if (itemQty > 0) {
        this.updateCartQty(itemQty, item);
      } else {
        this.removeCartItem(item.cart_row);
      }
    },
    addCartQty(itemQty, item) {
      itemQty++;
      this.updateCartQty(itemQty, item);
    },
    updateCartQty(itemQty, item) {
      this.loading = true;
      let params =
        "cart_uuid=" +
        this.cart_uuid +
        "&cart_row=" +
        item.cart_row +
        "&item_qty=" +
        itemQty;
      APIinterface.fetchDataPost("updateCartItems", params)
        .then((data) => {
          this.$emit("afterUpdatecart");
        })
        .catch((error) => {
          this.$emit("afterUpdatecart");
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    removeCartItem(cart_row) {
      this.loading_rm = true;
      let params = "cart_uuid=" + this.cart_uuid + "&row=" + cart_row;
      APIinterface.fetchDataPost("removeCartItem", params)
        .then((data) => {
          this.$emit("afterUpdatecart");
        })
        .catch((error) => {
          this.$emit("afterUpdatecart");
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
          this.loading_rm = false;
        });
    },
    onRight(details, index) {
      this.data_slide[index] = details;
    },
    closeSlide(index) {
      console.log(index);
      if (this.data_slide[index]) {
        console.log(this.data_slide[index]);
        this.data_slide[index].reset();
      }
    },
    removeItem(items) {
      this.removeCartItem(items.cart_row);
    },
    afterSavefav(items) {
      console.log("afterSavefav");
      console.log(items);
      this.removeCartItem(items.cart_row);
    },
    editItem(value) {
      const params = {
        cat_id: value.cat_id,
        item_uuid: value.item_token,
        cart_row: value.cart_row,
      };
      this.$emit("showItemdetails", params);
    },
  },
};
</script>
