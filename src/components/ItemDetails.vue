<template>
  <q-dialog
    v-model="dialog"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="300"
    @before-show="beforeShow"
    @before-hide="beforeHide"
    position="bottom"
    :maximized="false"
  >
    <!-- Loading State -->
    <template v-if="loading">
      <q-card class="item-modal-card">
        <q-skeleton height="220px" class="full-width" />
        <q-card-section class="q-pa-lg">
          <q-skeleton type="text" width="70%" class="text-h6" />
          <q-skeleton type="text" width="40%" class="q-mt-sm" />
          <q-skeleton type="text" width="100%" class="q-mt-md" />
          <q-skeleton height="50px" class="q-mt-lg" />
        </q-card-section>
      </q-card>
    </template>

    <!-- Main Content -->
    <template v-else>
      <q-card class="item-modal-card" v-scroll="onScroll">
        <!-- Compact Header with Image -->
        <template v-if="hasData">
          <!-- Hero Image Section -->
          <div class="item-image-section">
            <q-img
              :src="image_featured ? image_featured : items.url_image"
              placeholder-src="placeholder.png"
              fit="cover"
              class="hero-image"
              spinner-color="white"
            />

            <!-- Overlay Gradient -->
            <div class="image-overlay"></div>

            <!-- Close Button -->
            <q-btn
              icon="close"
              round
              flat
              class="close-btn"
              v-close-popup
            />

            <!-- Image Counter Badge -->
            <div v-if="hasGallery" class="image-counter">
              <q-icon name="collections" size="14px" />
              {{ getCurrentImageIndex + 1 }}/{{ item_gallery.length + 1 }}
            </div>
          </div>

          <!-- Item Info Section -->
          <div class="item-content">
            <!-- Gallery Thumbnails -->
            <div v-if="hasGallery" class="gallery-strip">
              <ItemGallery
                :item_gallery="item_gallery"
                @after-selectimage="afterSelectimage"
              />
            </div>

            <!-- Title & Rating -->
            <div class="item-header-info">
              <h2 class="item-title" v-html="items.item_name"></h2>

              <div class="item-meta">
                <div v-if="items.total_reviews > 0" class="rating-badge">
                  <q-icon name="star" color="amber-5" size="16px" />
                  <span class="rating-value">{{ items.average_rating }}</span>
                  <span class="rating-count">({{ items.total_reviews }} {{ $t('reviews') }})</span>
                </div>

                <div v-if="size_datas[item_size_id]?.earning_points > 0" class="points-badge">
                  <q-icon name="stars" size="14px" />
                  {{ size_datas[item_size_id]?.earning_points_label }}
                </div>
              </div>

              <div class="item-description">
                <TextComponents
                  :description="items.item_description"
                  max_lenght="120"
                  class_name="description-text"
                  :label="{
                    read_less: $t('Show less'),
                    read_more: $t('Read more'),
                  }"
                />
              </div>
            </div>

            <!-- Scrollable Options -->
            <div class="item-options">
              <!-- Size Selection - only show if more than 1 size -->
              <div v-if="size_data && size_data.length > 1" class="option-section">
                <div class="option-label">{{ $t("Size") }}</div>
                <div class="size-chips">
                  <q-chip
                    v-for="size in size_data"
                    :key="size.value"
                    :selected="item_size_id === size.value"
                    clickable
                    @click="item_size_id = size.value"
                    class="size-chip"
                    :class="{ 'size-chip-active': item_size_id === size.value }"
                  >
                    <span v-if="size.discount > 0" class="discount-price">{{ size.original_price }}</span>
                    {{ size.label }}
                  </q-chip>
                </div>
              </div>

            <!-- Cooking Reference -->
            <div v-if="cooking_data.length > 0" class="option-section">
              <div class="option-header">
                <span class="option-label">{{ $t("Cooking") }}</span>
                <span v-if="items.cooking_ref_required" class="required-badge">{{ $t("Required") }}</span>
                <span v-else class="optional-badge">{{ $t("Optional") }}</span>
              </div>
              <div class="size-chips">
                <q-chip
                  v-for="cook in cooking_data"
                  :key="cook.value"
                  :selected="cooking_ref === cook.value"
                  clickable
                  @click="cooking_ref = cook.value"
                  class="size-chip"
                  :class="{ 'size-chip-active': cooking_ref === cook.value }"
                >
                  {{ cook.label }}
                </q-chip>
              </div>
            </div>

            <!-- Ingredients -->
            <div v-if="ingredients_data.length > 0" class="option-section">
              <div class="option-label">{{ $t("Ingredients") }}</div>
              <div class="size-chips">
                <q-chip
                  v-for="ing in ingredients_data"
                  :key="ing.value"
                  :selected="ingredients.includes(ing.value)"
                  clickable
                  @click="toggleIngredient(ing.value)"
                  class="size-chip"
                  :class="{ 'size-chip-active': ingredients.includes(ing.value) }"
                  icon="check"
                >
                  {{ ing.label }}
                </q-chip>
              </div>
            </div>

            <!-- Addons - Compact -->
            <template v-if="addons[item_size_id]">
              <div
                v-for="addon in addons[item_size_id]"
                :key="addon.subcat_id"
                class="option-section"
              >
                <div class="option-header">
                  <span class="option-label">{{ addon.subcategory_name }}</span>
                  <span v-if="addon.require_addon == 1" class="required-badge">{{ $t("Required") }}</span>
                  <span v-else class="optional-badge">
                    <template v-if="addon.multi_option === 'one'">{{ $t("Select 1") }}</template>
                    <template v-else>{{ $t("Up to") }} {{ addon.multi_option_value }}</template>
                  </span>
                </div>

                <div class="addon-list">
                  <div
                    v-for="sub in addon.sub_items"
                    :key="sub.sub_item_id"
                    class="addon-item"
                    :class="{ 'addon-selected': sub.checked }"
                    @click="toggleAddon(addon, sub)"
                  >
                    <q-img
                      v-if="sub.url_image"
                      :src="sub.url_image"
                      class="addon-image"
                      fit="cover"
                    />
                    <div class="addon-info">
                      <span class="addon-name">{{ sub.sub_item_name }}</span>
                      <span v-if="sub.price > 0" class="addon-price">+{{ sub.pretty_price }}</span>
                    </div>
                    <div v-if="addon.multi_option !== 'one' && sub.checked" class="addon-qty">
                      <q-btn icon="remove" round flat dense size="xs" @click.stop="sub.qty > 1 ? sub.qty-- : sub.checked = false" />
                      <span>{{ sub.qty }}</span>
                      <q-btn icon="add" round flat dense size="xs" @click.stop="sub.qty++" :disable="sub.disabled" />
                    </div>
                    <q-icon v-else-if="sub.checked" name="check_circle" color="primary" size="20px" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Special Instructions -->
            <div class="option-section">
              <div class="option-label">{{ $t("Notes") }}</div>
              <q-input
                v-model="special_instructions"
                dense
                outlined
                :placeholder="$t('Special instructions...')"
                class="notes-input"
              />
            </div>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div class="item-footer">
            <div class="qty-control">
              <q-btn
                icon="remove"
                round
                flat
                dense
                :disable="item_qty <= 1"
                @click="item_qty > 1 ? item_qty-- : null"
                class="qty-btn"
              />
              <span class="qty-value">{{ item_qty }}</span>
              <q-btn
                icon="add"
                round
                flat
                dense
                @click="item_qty++"
                class="qty-btn"
              />
            </div>
            <q-btn
              unelevated
              no-caps
              class="add-btn"
              :class="{ 'add-btn-disabled': disabled_cart }"
              :disable="disabled_cart"
              :loading="loading_add"
              @click="AddToCart()"
            >
              <template v-if="items.not_for_sale">
                {{ $t("Not for sale") }}
              </template>
              <template v-else>
                <span class="add-label">{{ cart_row ? $t("Update") : $t("Add to cart") }}</span>
                <span class="add-separator">•</span>
                <span class="add-price">
                  <NumberFormat :amount="item_total" :money_config="money_config" />
                </span>
              </template>
            </q-btn>
          </div>
        </template>

        <!-- No Data State -->
        <template v-else>
          <div class="no-data-state">
            <q-icon name="inventory_2" size="48px" color="grey-5" />
            <p>{{ $t("No available data") }}</p>
            <q-btn
              unelevated
              no-caps
              :label="$t('Close')"
              color="primary"
              rounded
              v-close-popup
            />
          </div>
        </template>
      </q-card>
    </template>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { userCartData } from "stores/CartData";

const empty = function (data) {
  if (
    typeof data === "undefined" ||
    data === null ||
    data === "" ||
    data === "null" ||
    data === "undefined"
  ) {
    return true;
  }
  return false;
};

export default {
  name: "ItemDetails",
  props: ["money_config"],
  components: {
    NumberFormat: defineAsyncComponent(() =>
      import("components/NumberFormat.vue")
    ),
    // TABLE ORDER: FavsItems removed - no favorites in table ordering
    ItemGallery: defineAsyncComponent(() =>
      import("src/components/ItemGallery.vue")
    ),
    TextComponents: defineAsyncComponent(() =>
      import("src/components/TextComponents.vue")
    ),
  },
  data() {
    return {
      dialog: false,
      size: "",
      with_qty: false,
      qty: 1,
      item_qty: 1,
      morphGroupModel: "add",
      item_data: [],

      cat_id: 0,
      item_uuid: "",
      loading: false,
      loading_add: false,
      items: [],
      item_size_id: 0,
      size_data: [],
      size_datas: [],
      cooking_ref: 0,
      cooking_data: [],
      ingredients: [],
      ingredients_data: [],
      addons: {},
      special_instructions: "",
      transaction_type: "",
      item_total: 0,
      disabled_cart: true,
      slide_items: 0,
      favorites: [],
      number_config: [],
      meta: [],
      items_not_available: [],
      category_not_available: [],
      deep_link: "",
      show_nav: false,
      item_gallery: [],
      image_featured: "",
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    return { DataStorePersisted, CartData };
  },
  created() {
    this.deep_link = config.api_base_url;
  },
  watch: {
    addons: {
      handler(newValue, oldValue) {
        this.ItemSummary();
      },
      deep: true,
    },
    item_size_id() {
      this.ItemSummary();
    },
    cooking_ref() {
      this.ItemSummary();
    },
    ingredients() {
      this.ItemSummary();
    },
    item_qty() {
      this.ItemSummary();
    },
  },
  computed: {
    hasGallery() {
      if (this.item_gallery.length > 0) {
        return true;
      }
      return false;
    },
    hasData() {
      if (Object.keys(this.items).length > 0) {
        return true;
      }
      return false;
    },
    getCurrentImageIndex() {
      if (!this.image_featured) {
        return 0;
      }
      const index = this.item_gallery.indexOf(this.image_featured);
      return index >= 0 ? index + 1 : 0;
    },
  },
  methods: {
    beforeShow() {
      this.resetData();
    },
    onScroll(position) {
      position = parseInt(position);
      if (position >= 158) {
        this.show_nav = true;
      } else {
        this.show_nav = false;
      }
    },
    showModal(show, data) {
      if (this.loading) {
        return;
      }
      this.dialog = true;
      this.item_data = data;
      this.getMenuItem();
    },
    itemAvailable(item_id, cat_id) {
      if (this.items_not_available.includes(parseInt(item_id)) === false) {
        if (this.category_not_available.includes(parseInt(cat_id)) === false) {
          return true;
        }
      }
      return false;
    },
    resetData() {
      this.item_qty = 1;
      this.items = [];
      this.item_size_id = 0;
      this.size_data = [];
      this.size_datas = [];
      this.cooking_ref = 0;
      this.cooking_data = [];
      this.ingredients = [];
      this.ingredients_data = [];
      this.addons = {};
      this.special_instructions = "";
      this.transaction_type = "";
      this.if_sold_out = "";
      this.sold_out_options = [];
      this.item_total = 0;
      this.disabled_cart = true;
      this.slide_items = 0;
    },
    getMenuItem() {
      this.CartData.home_view_items = true;
      this.loading = true;
      let params = "";
      params =
        "cat_id=" +
        this.item_data.cat_id +
        "&item_uuid=" +
        this.item_data.item_uuid +
        "&currency_code=" +
        this.DataStorePersisted.getUseCurrency();

      if (this.item_data?.cart_row) {
        params += "&cart_row=" + this.item_data?.cart_row;
      }

      // Add branch_id for branch-specific pricing
      const branchId = this.DataStorePersisted.getSelectedBranchId();
      if (branchId) {
        params += "&branch_id=" + branchId;
      }

      APIinterface.getMenuItem(params)
        .then((data) => {
          this.number_config = data.details.config;
          this.items = data.details.data.items;
          this.meta = data.details.data.meta;
          this.size_datas = data.details.data.items.price;
          const soldOutData = data.details.sold_out_options;

          this.if_sold_out = data.details.default_sold_out_options;

          this.items_not_available = data.details.data.items_not_available;
          this.category_not_available =
            data.details.data.category_not_available;

          const prices = data.details.data.items.price;
          const metaCookingRef = data.details.data.meta
            ? data.details.data.meta.cooking_ref
            : {};
          const metaCookingRefDetails = data.details.data.meta
            ? data.details.data.meta_details.cooking_ref
            : {};

          const metaIngredients = data.details.data.meta
            ? data.details.data.meta.ingredients
            : {};
          const metaIngredientsDetails = data.details.data.meta
            ? data.details.data.meta_details.ingredients
            : {};

          const addons = data.details.data ? data.details.data.addons : {};
          const addonItems = data.details.data
            ? data.details.data.addon_items
            : {};

          if (Object.keys(soldOutData).length > 0) {
            Object.entries(soldOutData).forEach(
              ([itemSoldKey, itemsSoldData]) => {
                this.sold_out_options.push({
                  label: itemsSoldData,
                  value: itemSoldKey,
                });
              }
            );
          }

          if (Object.keys(prices).length > 0) {
            Object.entries(prices).forEach(([key, items]) => {
              if (items.discount <= 0) {
                this.size_data.push({
                  label: items.size_name + " " + items.pretty_price,
                  value: parseInt(items.item_size_id),
                  original_price: items.pretty_price,
                  discount: items.discount,
                });
              } else {
                this.size_data.push({
                  label:
                    items.size_name + " " + items.pretty_price_after_discount,
                  value: parseInt(items.item_size_id),
                  original_price: items.pretty_price,
                  discount: items.discount,
                });
              }
            });
            this.item_size_id = parseInt(Object.keys(prices)[0]);
          }

          if (
            typeof metaCookingRef !== "undefined" &&
            metaCookingRef !== null
          ) {
            if (metaCookingRef.length > 0) {
              Object.entries(metaCookingRef).forEach(([key, value]) => {
                this.cooking_data.push({
                  label: metaCookingRefDetails[value].meta_name,
                  value: String(metaCookingRefDetails[value].meta_id),
                });
              });
            }
          }

          if (
            typeof metaIngredients !== "undefined" &&
            metaIngredients !== null
          ) {
            if (metaIngredients.length > 0) {
              Object.entries(metaIngredients).forEach(([key, value]) => {
                if (metaIngredientsDetails[value]) {
                  this.ingredients_data.push({
                    label: metaIngredientsDetails[value].meta_name,
                    value: String(metaIngredientsDetails[value].meta_id),
                  });
                }
                if (this.items.ingredients_preselected) {
                  if (metaIngredientsDetails[value]) {
                    this.ingredients.push(
                      String(metaIngredientsDetails[value].meta_id)
                    );
                  }
                }
              });
            }
          }

          this.item_gallery = data.details.data.meta
            ? data.details.data.meta.item_gallery
            : [];

          if (APIinterface.empty(this.item_gallery)) {
            this.item_gallery = [];
          }

          const cart_details = data.details.cart_details;
          console.log("cart_details", cart_details);
          let cart_addons = null;
          if (cart_details) {
            this.item_qty = cart_details.cart.qty;
            cart_addons = cart_details.addons;
            this.cart_row = cart_details.cart_row;
            this.item_size_id = parseInt(cart_details.cart.item_size_id);
            this.cooking_ref =
              String(cart_details.attributes.cooking_ref) ?? null;
            const Ingredients = cart_details.attributes.ingredients ?? [];
            this.ingredients = Ingredients.map(String);

            this.special_instructions = cart_details.cart?.special_instructions;
            this.if_sold_out = cart_details.cart?.if_sold_out;
          }

          // addons
          if (Object.keys(this.items.item_addons).length > 0) {
            Object.entries(this.items.item_addons).forEach(
              ([sizeId, SubcatID]) => {
                const addOnsAdded = [];
                let sub_items_checked = "";
                let filteredAddons = null;

                Object.entries(SubcatID).forEach(([key, child]) => {
                  if (!APIinterface.empty(addons[sizeId])) {
                    if (!APIinterface.empty(addons[sizeId][child])) {
                      const addonDetails = addons[sizeId][child];

                      filteredAddons = null;
                      if (cart_details) {
                        if (addonDetails.multi_option == "one") {
                          filteredAddons = cart_addons.find(
                            (addon) =>
                              addon.subcat_id === addonDetails.subcat_id
                          );
                          if (filteredAddons) {
                            sub_items_checked = filteredAddons.sub_item_id;
                          }
                        } else if (addonDetails.multi_option == "custom") {
                          filteredAddons = cart_addons.filter(
                            (addon) =>
                              addon.subcat_id === addonDetails.subcat_id
                          );
                        } else if (addonDetails.multi_option == "multiple") {
                          filteredAddons = cart_addons.filter(
                            (addon) =>
                              addon.subcat_id === addonDetails.subcat_id
                          );
                        }
                      }

                      const subItems = [];
                      Object.entries(addonDetails.sub_items).forEach(
                        ([key2, subItemsID]) => {
                          if (addonItems[subItemsID]) {
                            const subItemsAdd = addonItems[subItemsID];

                            let hasSubcat = false;
                            let addonQty = 1;
                            if (filteredAddons) {
                              if (addonDetails.multi_option == "custom") {
                                const addonFound = filteredAddons.find(
                                  (addon) =>
                                    addon.subcat_id ===
                                      addonDetails.subcat_id &&
                                    String(addon.sub_item_id) ===
                                      String(subItemsAdd.sub_item_id)
                                );
                                hasSubcat = addonFound ? true : false;
                              } else if (
                                addonDetails.multi_option == "multiple"
                              ) {
                                const addonFound = filteredAddons.find(
                                  (addon) =>
                                    addon.subcat_id ===
                                      addonDetails.subcat_id &&
                                    String(addon.sub_item_id) ===
                                      String(subItemsAdd.sub_item_id)
                                );
                                if (addonFound) {
                                  addonQty = addonFound.qty;
                                }
                                hasSubcat = addonFound ? true : false;
                              }
                            }
                            addonItems[subItemsID].checked = hasSubcat;
                            addonItems[subItemsID].disabled = false;
                            addonItems[subItemsID].qty = addonQty;
                            subItems.push(subItemsAdd);
                          }
                        }
                      );

                      const subdata = {
                        subcat_id: addonDetails.subcat_id,
                        subcategory_name: addonDetails.subcategory_name,
                        subcategory_description:
                          addonDetails.subcategory_description,
                        multi_option: addonDetails.multi_option,
                        multi_option_min: addonDetails.multi_option_min,
                        multi_option_value: addonDetails.multi_option_value,
                        require_addon: addonDetails.require_addon,
                        pre_selected: addonDetails.pre_selected,
                        sub_items_checked: sub_items_checked,
                        sub_items: subItems,
                      };
                      addOnsAdded.push(subdata);
                    }
                  }
                });
                this.addons[sizeId] = addOnsAdded;
              }
            );
          }
          // addons
        })
        .catch((error) => {
          console.debug(error);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    beforeHide() {
      this.cart_row = null;
      this.CartData.home_view_items = false;
      this.show_nav = false;
      this.qty = 1;
      this.image_featured = "";
      this.$emit("itemHide");
    },
    ItemSummary() {
      let $itemTotal = 0;
      const $requiredAddon = [];
      const $requiredAddonAdded = [];
      let $min_addon = [];
      let $min_addon_added = [];

      if (!empty(this.size_datas[this.item_size_id])) {
        const item = this.size_datas[this.item_size_id];
        if (item.discount > 0) {
          $itemTotal += this.item_qty * parseFloat(item.price_after_discount);
        } else $itemTotal += this.item_qty * parseFloat(item.price);
      }

      if (!empty(this.addons[this.item_size_id])) {
        this.addons[this.item_size_id].forEach((item, index) => {
          if (item.require_addon === "1" || item.require_addon === 1) {
            $requiredAddon.push(item.subcat_id);
          }

          if (item.multi_option === "custom") {
            let totalCheck = 0;
            const multiOptionValue = item.multi_option_value;
            let multi_option_min = item.multi_option_min;

            if (multiOptionValue > 0) {
              $min_addon.push({
                subcat_id: item.subcat_id,
                min: multi_option_min,
                max: multiOptionValue,
              });
            }

            const itemIndex = [];
            const itemIndex2 = [];
            item.sub_items.forEach((item2, index2) => {
              if (item2.checked === true) {
                totalCheck++;
                $itemTotal += this.item_qty * parseFloat(item2.price);
                $requiredAddonAdded.push(item.subcat_id);
              } else itemIndex.push(index2);

              if (item2.disabled === true) {
                itemIndex2.push(index2);
              }
            });

            $min_addon_added[item.subcat_id] = {
              total: totalCheck,
            };

            if (totalCheck >= multiOptionValue) {
              itemIndex.forEach((item3, index3) => {
                item.sub_items[item3].disabled = true;
              });
            } else {
              itemIndex2.forEach((item3, index3) => {
                item.sub_items[item3].disabled = false;
              });
            }
          } else if (item.multi_option === "one") {
            item.sub_items.forEach((item2, index2) => {
              if (item2.sub_item_id === item.sub_items_checked) {
                $itemTotal += this.item_qty * parseFloat(item2.price);
                $requiredAddonAdded.push(item.subcat_id);
              }
            });
          } else if (item.multi_option === "multiple") {
            var item_index = [];
            let multi_option_min = item.multi_option_min;
            var multi_option_value = item.multi_option_value;
            var limit = 0;

            if (multi_option_value > 0) {
              $min_addon.push({
                subcat_id: item.subcat_id,
                min: multi_option_min,
                max: multi_option_value,
              });
            }

            item.sub_items.forEach((item2, index2) => {
              if (item2.checked === true) {
                $itemTotal += item2.qty * parseFloat(item2.price);
                $requiredAddonAdded.push(item.subcat_id);
                limit += item2.qty;
              }
              item_index.push(index2);
            });

            $min_addon_added[item.subcat_id] = {
              total: limit,
            };

            this.addons[this.item_size_id][index].qty_selected = limit;
            if (
              this.addons[this.item_size_id][index].qty_selected >=
              multi_option_value
            ) {
              item_index.forEach((item3, index2) => {
                this.addons[this.item_size_id][index].sub_items[
                  item3
                ].disabled = true;
              });
            } else {
              item_index.forEach((item3, index2) => {
                this.addons[this.item_size_id][index].sub_items[
                  item3
                ].disabled = false;
              });
            }
          } /* endif custom */
        });
        // end loop addons
      }

      if ($itemTotal > 0) {
        this.item_total = $itemTotal;
      }

      let $requiredMeet = true;
      if ($requiredAddon.length > 0) {
        $requiredAddon.forEach((requiedItem, requiredIndex) => {
          if ($requiredAddonAdded.includes(requiedItem) === false) {
            $requiredMeet = false;
            return false;
          }
        });
      }

      // CHECK COOKING REF
      if (this.items.cooking_ref_required && $requiredMeet) {
        let $cooking_ref_check = false;
        if (this.cooking_ref > 0) {
          $cooking_ref_check = true;
        }
        if (!$cooking_ref_check) {
          $requiredMeet = false;
        }
      }

      // CHECK ADDON MINIMUM AND MAXIMUM
      if (Object.keys($min_addon).length > 0) {
        let min_value, min_selected;
        Object.entries($min_addon).forEach(
          ([key_min_addon, items_min_addon]) => {
            min_value = parseInt(items_min_addon.min);
            if ($min_addon_added[items_min_addon.subcat_id]) {
              min_selected = parseInt(
                $min_addon_added[items_min_addon.subcat_id].total
              );
            }
            if (min_selected > 0) {
              if (min_value > min_selected) {
                $requiredMeet = false;
              }
            }
          }
        );
      }

      if ($requiredMeet) {
        this.disabled_cart = false;
      } else this.disabled_cart = true;
      //
    },
    AddToCart() {
      const $ingredients = [];
      if (this.ingredients.length > 0) {
        this.ingredients.forEach((ingredientsId, index) => {
          $ingredients.push({
            meta_id: ingredientsId,
            checked: true,
            meta_name: "",
          });
        });
      }

      const $meta = {
        cooking_ref: [
          {
            meta_id: this.cooking_ref,
            checked: this.cooking_ref,
            meta_name: "",
          },
        ],
        ingredients: $ingredients,
      };
      const $cartUuid = this.DataStorePersisted.cart_uuid ?? "";
      const $branchId = this.DataStorePersisted.getSelectedBranchId();
      const $data = {
        cart_uuid: $cartUuid,
        cat_id: this.item_data.cat_id,
        item_size_id: this.item_size_id,
        item_token: this.item_data.item_uuid,
        item_qty: this.item_qty,
        special_instructions: this.special_instructions,
        if_sold_out: this.if_sold_out.value,
        transaction_type: "delivery",
        meta: $meta,
        item_addons: !empty(this.addons[this.item_size_id])
          ? this.addons[this.item_size_id]
          : [],
        branch_id: $branchId,
      };
      if (this.cart_row) {
        $data.cart_row = this.cart_row;
      }

      this.loading_add = true;
      APIinterface.fetchDataPost("addCartItems", $data)
        .then((data) => {
          if (empty($cartUuid)) {
            this.DataStorePersisted.cart_uuid = data.details.cart_uuid;
          }
          this.dialog = false;
          this.$emit("afterAddtocart");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_add = false;
        });
    },
    afterSavefav(item) {
      item.save_item = !item.save_item;
    },
    afterSelectimage(data) {
      this.image_featured = data;
    },
    toggleIngredient(value) {
      const index = this.ingredients.indexOf(value);
      if (index > -1) {
        this.ingredients.splice(index, 1);
      } else {
        this.ingredients.push(value);
      }
    },
    toggleAddon(addon, sub) {
      if (addon.multi_option === 'one') {
        // Radio behavior - uncheck others
        addon.sub_items.forEach(item => {
          item.checked = item.sub_item_id === sub.sub_item_id;
        });
      } else {
        // Toggle checkbox
        sub.checked = !sub.checked;
        if (sub.checked && !sub.qty) {
          sub.qty = 1;
        }
      }
    },
    //
  },
};
</script>

<style lang="scss" scoped>
/* High-Tech Item Modal - Larger & More Visual */
.item-modal-card {
  width: 100%;
  max-width: 500px;
  max-height: 92vh;
  border-radius: 28px 28px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--ht-surface, #fff);
}

/* Hero Image Section */
.item-image-section {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  pointer-events: none;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95) !important;
  color: #333 !important;
  width: 36px;
  height: 36px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

.image-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(8px);
}

/* Content Section */
.item-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.gallery-strip {
  padding: 12px 20px 0;
}

.item-header-info {
  padding: 20px;
  padding-bottom: 12px;
}

.item-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--ht-text, #0f172a);
  margin: 0 0 10px;
  line-height: 1.3;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fffbeb;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.rating-value {
  font-weight: 700;
  color: #b45309;
}

.rating-count {
  color: #92400e;
  font-size: 12px;
}

.points-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.item-description {
  margin-top: 4px;
}

.description-text {
  font-size: 14px;
  color: var(--ht-text-secondary, #64748b);
  line-height: 1.5;
}

/* Options Section */
.item-options {
  padding: 0 16px 100px;
  background: var(--ht-bg, #f8fafc);
}

.option-section {
  background: var(--ht-surface, #fff);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.option-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--ht-text, #0f172a);
  margin-bottom: 10px;
}

.required-badge {
  font-size: 11px;
  font-weight: 600;
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 8px;
}

.optional-badge {
  font-size: 10px;
  color: var(--ht-text-secondary, #64748b);
}

/* Size Chips */
.size-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.size-chip {
  background: var(--ht-bg, #f1f5f9) !important;
  color: var(--ht-text, #0f172a);
  font-weight: 600;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 12px !important;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.size-chip-active {
  background: #3b82f6 !important;
  color: white !important;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

/* Discount price - visible on both light and dark chips */
.discount-price {
  text-decoration: line-through;
  opacity: 0.7;
  margin-right: 6px;
  font-size: 12px;
}

.size-chip-active .discount-price {
  color: rgba(255, 255, 255, 0.85);
}

/* Addon List */
.addon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.addon-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--ht-bg, #f8fafc);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.addon-item:hover {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.2);
}

.addon-selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.addon-image {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
}

.addon-info {
  flex: 1;
  min-width: 0;
}

.addon-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ht-text, #0f172a);
  display: block;
  margin-bottom: 2px;
}

.addon-price {
  font-size: 13px;
  color: #059669;
  font-weight: 700;
}

.addon-qty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  color: var(--ht-text, #0f172a);
}

/* Notes Input */
.notes-input {
  .q-field__control {
    border-radius: 12px !important;
  }
}

/* Sticky Footer - Fixed at bottom */
.item-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  background: var(--ht-surface, #fff);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--ht-bg, #f1f5f9);
  padding: 8px 12px;
  border-radius: 14px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  background: var(--ht-surface, #fff) !important;
  color: #3b82f6 !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.qty-value {
  font-size: 18px;
  font-weight: 700;
  min-width: 32px;
  text-align: center;
  color: var(--ht-text, #0f172a);
}

.add-btn {
  flex: 1;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  font-weight: 700;
  font-size: 16px;
  padding: 16px 24px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.add-btn-disabled {
  background: #e2e8f0 !important;
  color: #94a3b8 !important;
  box-shadow: none !important;
}

.add-label {
  font-weight: 600;
}

.add-separator {
  opacity: 0.5;
  margin: 0 8px;
}

.add-price {
  font-weight: 800;
  font-size: 17px;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

/* No Data State */
.no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;

  p {
    color: var(--ht-text-secondary, #64748b);
    margin: 20px 0;
    font-size: 15px;
  }
}

/* Responsive */
@media (max-width: 400px) {
  .item-image-section {
    height: 200px;
  }

  .item-title {
    font-size: 20px;
  }

  .add-btn {
    padding: 14px 18px;
    font-size: 15px;
  }
}
</style>
