<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="tech-page">
      <q-scroll-observer @scroll="onScroll" />

      <!-- TABLE ORDER: No address header needed - customer is at the table -->

      <!-- 🔍 INLINE SEARCH OVERLAY -->
      <transition name="search-slide">
        <div v-if="searchActive" class="search-overlay">
          <div class="search-overlay-header">
            <div class="search-input-wrap">
              <q-icon name="search" size="22px" class="search-input-icon" />
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                class="search-input"
                :placeholder="$t('Search menu items...')"
                @input="onSearchInput"
              />
              <q-icon
                v-if="searchQuery"
                name="close"
                size="20px"
                class="search-clear"
                @click="searchQuery = ''"
              />
            </div>
            <button class="search-cancel" @click="closeSearch">{{ $t("Cancel") }}</button>
          </div>

          <!-- Search Results -->
          <div class="search-results">
            <div v-if="searchQuery && filteredItems.length === 0" class="search-empty">
              <q-icon name="o_search_off" size="48px" />
              <p>{{ $t("No items found") }}</p>
            </div>

            <div v-else-if="searchQuery" class="search-results-grid">
              <div
                v-for="item in filteredItems"
                :key="item.item_uuid"
                class="search-result-item"
                @click="onSearchItemClick(item)"
              >
                <div class="search-item-image">
                  <img :src="item.url_image" :alt="item.item_name" />
                </div>
                <div class="search-item-info">
                  <div class="search-item-name">{{ item.item_name }}</div>
                  <div class="search-item-price">{{ item.lowest_price }}</div>
                </div>
              </div>
            </div>

            <div v-else class="search-suggestions">
              <p class="search-hint">{{ $t("Start typing to search...") }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- TABLE ORDER: No branch selector - table QR determines the branch -->

      <!-- 📌 FLOATING STICKY HEADER - Full Width -->
      <q-page-sticky
        v-if="showStickyNav"
        expand
        position="top"
        class="sticky-header-container"
      >
        <div class="sticky-header-full">
          <!-- Category Selector -->
          <div class="sticky-category-full" @click="this.$refs.ref_categorymodal.modal = true">
            <div class="sticky-cat-icon">
              <q-icon name="o_grid_view" size="18px" />
            </div>
            <div class="sticky-cat-text">
              <span class="sticky-cat-label">{{ $t("Category") }}</span>
              <span class="sticky-cat-name">{{ active_category_name || $t("All") }}</span>
            </div>
            <q-icon name="expand_more" size="20px" class="sticky-cat-chevron" />
          </div>

          <!-- Search Button -->
          <div class="sticky-search-full" @click="openSearch">
            <q-icon name="o_search" size="20px" />
            <span>{{ $t("Search") }}</span>
          </div>
        </div>
      </q-page-sticky>

      <!-- 💀 SKELETON LOADING STATE -->
      <template v-if="loading">
        <div class="skeleton-container">
          <div class="skeleton-header">
            <q-skeleton type="rect" class="skeleton-hero" animation="wave" />
          </div>
          <div class="skeleton-categories">
            <q-skeleton v-for="i in 5" :key="i" type="circle" size="70px" animation="wave" />
          </div>
          <div class="skeleton-grid">
            <q-skeleton v-for="i in 6" :key="i" type="rect" class="skeleton-card" animation="wave" />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="content-wrapper">

          <!-- TABLE ORDER: No banners or booking CTA needed -->

          <!-- 🏆 BEST SELLER - Premium Horizontal Scroll -->
          <section v-if="best_seller" class="menu-section">
            <div class="section-header">
              <div class="section-title-group">
                <div class="section-badge">✦</div>
                <h2 class="section-title">{{ $t("Best Seller") }}</h2>
              </div>
              <div class="section-subtitle">{{ $t("Most loved by customers") }}</div>
            </div>
            <div class="horizontal-scroll-container">
              <ItemsRow
                ref="ref_itemsrow"
                :data="best_seller"
                :loading="loading"
                @view-items="viewItems"
              />
            </div>
          </section>

          <!-- ⭐ RECOMMENDED - Circular Avatars -->
          <section v-if="DataStore.data?.home_data?.recommnded" class="menu-section">
            <div class="section-header">
              <div class="section-title-group">
                <div class="section-badge">◈</div>
                <h2 class="section-title">{{ $t("Recommended") }}</h2>
              </div>
              <q-btn flat dense no-caps class="see-all-btn" to="/items/feature?tag=recommended&title=Recommended">
                {{ $t("See All") }}
                <q-icon name="arrow_forward" size="16px" class="q-ml-xs" />
              </q-btn>
            </div>
            <div class="recommended-scroll">
              <div
                v-for="item in DataStore.data?.home_data?.recommnded"
                :key="item.item_uuid"
                class="recommended-item"
                @click="viewItems({ item_uuid: item.item_uuid, cat_id: item.cat_id })"
              >
                <div class="recommended-avatar">
                  <img :src="item.url_image" :alt="item.item_name" />
                  <div class="avatar-ring"></div>
                </div>
                <span class="recommended-name">{{ item.item_name }}</span>
                <span class="recommended-price">{{ item.lowest_price }}</span>
              </div>
            </div>
          </section>

          <!-- 🏷️ OFFERS - Discount Cards -->
          <section v-if="hasDiscountedItems" class="menu-section offers-section">
            <div class="section-header">
              <div class="section-title-group">
                <div class="section-badge sale">⚡</div>
                <h2 class="section-title">{{ $t("Special Offers") }}</h2>
              </div>
            </div>
            <div class="offers-scroll">
              <div
                v-for="item in discountedItems"
                :key="item.item_uuid"
                class="offer-card"
                @click="viewItems({ item_uuid: item.item_uuid, cat_id: item.cat_id })"
              >
                <div class="offer-badge">{{ getDiscountBadgeForOffer(item) }}</div>
                <div class="offer-image">
                  <img :src="item.url_image" :alt="item.item_name" />
                </div>
                <div class="offer-info">
                  <span class="offer-name">{{ item.item_name }}</span>
                  <span class="offer-price">{{ item.lowest_price }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 🗂️ CATEGORIES - Floating Pills -->
          <section class="menu-section categories-section">
            <div class="section-header">
              <div class="section-title-group">
                <div class="section-badge">◇</div>
                <h2 class="section-title">{{ $t("Categories") }}</h2>
              </div>
            </div>
            <div class="categories-scroll">
              <div
                v-for="cat in data"
                :key="cat.category_uiid"
                class="category-pill"
                :class="{ active: active_category === cat.category_uiid }"
                @click="scrollToCategory(cat.category_uiid)"
              >
                <div class="category-image">
                  <img :src="cat.url_image" :alt="cat.category_name" />
                </div>
                <span class="category-name">{{ cat.category_name }}</span>
              </div>
            </div>
          </section>

          <!-- 🍽️ MENU CATEGORIES - Lazy Loaded -->
          <template v-for="category in visibleCategories" :key="category.category_uiid">
            <section
              class="menu-section category-menu"
              ref="categories"
              :id="category.category_uiid"
              :name="category.category_name"
            >
              <div class="section-header category-header">
                <div class="section-title-group">
                  <div class="category-icon">
                    <img :src="category.url_image" :alt="category.category_name" />
                  </div>
                  <h2 class="section-title">{{ category.category_name }}</h2>
                </div>
                <div class="item-count">{{ category.item_list?.length || 0 }} {{ $t("items") }}</div>
              </div>
              <div class="menu-grid-container">
                <MenuGrid
                  :items="prepareItemsForGrid(category)"
                  :promo-eligibility="promoEligibility"
                  :page-size="20"
                  @click-item="(item) => onClickItemFromGrid(category, item)"
                  @show-options="showOptions"
                  @show-allergens="(item_id) => $refs.ref_allergens.getAllergens(item_id)"
                />
              </div>
            </section>
          </template>

          <!-- ⏳ LOADING MORE CATEGORIES -->
          <div v-if="loadingMoreCategories" class="loading-more">
            <q-spinner-dots color="primary" size="40px" />
            <span>{{ $t("Loading more...") }}</span>
          </div>

          <!-- 📍 SCROLL SENTINEL FOR LAZY LOADING -->
          <div ref="categorySentinel" class="category-sentinel"></div>

          <!-- 🏁 END OF MENU -->
          <div v-if="data && data.length > 0 && allCategoriesLoaded" class="end-of-menu">
            <div class="end-line"></div>
            <span>{{ $t("You've reached the end") }}</span>
            <div class="end-line"></div>
          </div>

        </div>
      </template>

      <q-space class="q-pa-xl"></q-space>

      <!-- ⬆️ FLOATING SCROLL TO TOP -->
      <q-page-scroller position="bottom-right" :scroll-offset="300" :offset="[20, 20]">
        <q-btn fab class="scroll-top-btn" icon="keyboard_arrow_up" />
      </q-page-scroller>

    </q-page>
  </q-pull-to-refresh>

  <ItemDetails
    ref="item_details"
    :money_config="SettingStore.settings_data?.money_config"
    @after-addtocart="afterAddtocart"
  ></ItemDetails>

  <AllergensDetails ref="ref_allergens"></AllergensDetails>

  <CategoryModal
    ref="ref_categorymodal"
    :data="data"
    @after-categoryselect="afterCategoryselect"
  >
  </CategoryModal>

  <ItemInfo
    ref="ref_iteminfo"
    :cart_uuid="DataStorePersisted.cart_uuid"
    :money_config="SettingStore.settings_data?.money_config"
    @show-itemdetails="showItemdetails"
    @after-updateqty="afterAddtocart"
  ></ItemInfo>

  <!-- ADDRESS SELECTOR MODAL -->
  <component
    :is="AddressRecent"
    ref="ref_addressrecent"
    :isLogin="isLogin"
    @set-location="setLocation"
    @afterChooselocation="afterChooselocation"
  >
  </component>

  <!-- BRANCH SELECTOR MODAL -->
  <BranchSelector
    ref="ref_branchselector"
    :branches="branches"
    @branch-selected="onBranchSelected"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { scroll } from "quasar";
import { userCartData } from "stores/CartData";
import { useSettingStore } from "stores/SettingStore";
import { useUserStore } from "stores/UserStore";
import { useDataStore } from "src/stores/DataStore";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

const { getScrollTarget, setVerticalScrollPosition } = scroll;

export default {
  name: "MenuPage",
  data() {
    return {
      data: null,
      best_seller: null,
      loading: false,
      category_seleted: "",
      itemRefs: [],
      category_position: [],
      trans_type: "",
      scroll_down: false,
      allergens_item_id: "",
      category_uuid_selected: "",
      active_category: null,
      active_category_name: null,
      promoEligibility: {},
      client_uuid: null,
      // Branch support
      branches: [],
      has_branches: false,
      // Lazy Loading
      visibleCategoryCount: 2,
      loadingMoreCategories: false,
      categoryObserver: null,
      // Inline Search
      searchActive: false,
      searchQuery: "",
      // Sticky nav trigger
      categoriesSectionTop: 0,
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const CartData = userCartData();
    const SettingStore = useSettingStore();
    const UserStore = useUserStore();
    const DataStore = useDataStore();

    const AddressRecent = defineAsyncComponent(() =>
      SettingStore.search_mode == "location"
        ? import("components/AddressRecentLocation.vue")
        : import("components/AddressRecent.vue")
    );

    return { DataStorePersisted, CartData, SettingStore, UserStore, DataStore, AddressRecent };
  },
  components: {
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    AllergensDetails: defineAsyncComponent(() =>
      import("components/AllergensDetails.vue")
    ),
    CategoryModal: defineAsyncComponent(() =>
      import("components/CategoryModal.vue")
    ),
    ItemsRow: defineAsyncComponent(() => import("components/ItemsRow.vue")),
    ItemInfo: defineAsyncComponent(() => import("components/ItemInfo.vue")),
    MenuGrid: defineAsyncComponent(() => import("components/MenuGrid.vue")),
    BannerCarousel: defineAsyncComponent(() =>
      import("components/BannerCarousel.vue")
    ),
    BranchSelector: defineAsyncComponent(() =>
      import("components/BranchSelector.vue")
    ),
  },
  mounted() {
    // Check for table parameter from QR code (backend format: ?table=UUID)
    const tableUuid = this.$route.query.table;
    if (tableUuid && !this.DataStorePersisted.isTableOrderMode()) {
      // Set table order mode
      this.DataStorePersisted.setTableOrder(tableUuid, null, tableUuid);
    }

    if (auth.authenticated()) {
      const useInfo = auth.getUser();
      this.client_uuid = useInfo.client_uuid;
    }

    this.DataStore.show_toobar = true;
    this.DataStore.data.page_title = this.$t("Menu");

    // Fetch merchant info (includes branch data)
    this.fetchMerchantInfo();

    if (this.DataStore.data?.menu) {
      this.loading = false;
      this.data = this.DataStore.data?.menu?.menu;
      this.best_seller = this.DataStore.data?.menu?.best_seller;
      //this.promoEligibility = this.DataStore.data?.menu?.promoEligibility;
      this.initializeActiveCategory();
      this.promoCheck();
      this.initObserver();
      this.setupCategoryObserver();
      this.updateCategoriesSectionTop();
    } else {
      this.fetchMenu();
    }

    // Fetch home data for carousel, banners, etc.
    if (!this.DataStore.data?.home_data) {
      this.DataStore.fetchHome(this.client_uuid);
    }
  },
  beforeUnmount() {
    this.DataStore.data.menu = {
      menu: this.data,
      best_seller: this.best_seller,
      //promoEligibility: this.promoEligibility,
    };
    // Cleanup observers
    if (this.categoryObserver) {
      this.categoryObserver.disconnect();
    }
  },
  computed: {
    isLogin() {
      return auth.authenticated();
    },
    discountedItems() {
      // Get all items with discounts from all categories
      const allDiscountedItems = [];
      if (this.data && Array.isArray(this.data)) {
        this.data.forEach(category => {
          if (category.item_list && Array.isArray(category.item_list)) {
            category.item_list.forEach(item => {
              // Check if item has discount AND can generate a discount badge
              const hasValidDiscount = item.has_discount &&
                                       item.price &&
                                       item.price[0] &&
                                       item.price[0].discount;

              if (hasValidDiscount) {
                allDiscountedItems.push({
                  ...item,
                  cat_id: category.cat_id
                });
              }
            });
          }
        });
      }
      return allDiscountedItems;
    },
    hasDiscountedItems() {
      return this.discountedItems && this.discountedItems.length > 0;
    },
    // Lazy Loading - Only show visible categories
    visibleCategories() {
      if (!this.data || !Array.isArray(this.data)) return [];
      return this.data.slice(0, this.visibleCategoryCount);
    },
    allCategoriesLoaded() {
      if (!this.data) return false;
      return this.visibleCategoryCount >= this.data.length;
    },
    showStickyNav() {
      return this.scroll_down && this.categoriesSectionTop > 0;
    },
    // Search - Filter all items across categories
    filteredItems() {
      if (!this.searchQuery || !this.data) return [];
      const query = this.searchQuery.toLowerCase().trim();
      const results = [];

      this.data.forEach(category => {
        if (category.item_list && Array.isArray(category.item_list)) {
          category.item_list.forEach(item => {
            const nameMatch = item.item_name?.toLowerCase().includes(query);
            const descMatch = item.item_description?.toLowerCase().includes(query);
            if (nameMatch || descMatch) {
              results.push({ ...item, cat_id: category.cat_id });
            }
          });
        }
      });

      return results.slice(0, 20); // Limit to 20 results
    },
  },
  methods: {
    // ===== INLINE SEARCH METHODS =====
    openSearch() {
      this.searchActive = true;
      this.searchQuery = "";
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
    },
    closeSearch() {
      this.searchActive = false;
      this.searchQuery = "";
    },
    onSearchInput() {
      // Debounce is handled by Vue's reactivity
    },
    onSearchItemClick(item) {
      this.closeSearch();
      this.viewItems({ item_uuid: item.item_uuid, cat_id: item.cat_id });
    },

    // ===== LAZY LOADING METHODS =====
    setupCategoryObserver() {
      if (this.categoryObserver) {
        this.categoryObserver.disconnect();
      }

      this.$nextTick(() => {
        const sentinel = this.$refs.categorySentinel;
        if (!sentinel) return;

        this.categoryObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !this.allCategoriesLoaded && !this.loadingMoreCategories) {
                this.loadMoreCategories();
              }
            });
          },
          { root: null, rootMargin: "300px", threshold: 0 }
        );

        this.categoryObserver.observe(sentinel);
      });
    },
    loadMoreCategories() {
      if (this.allCategoriesLoaded || this.loadingMoreCategories) return;

      this.loadingMoreCategories = true;

      // Simulate network delay for smooth UX
      setTimeout(() => {
        this.visibleCategoryCount += 2;
        this.loadingMoreCategories = false;
      }, 300);
    },

    afterSavefav(value, isActive) {
      value.is_favorite = isActive;
    },

    showOptions(value) {
      console.log("showOptions", value);
      this.$refs.ref_iteminfo.data = value;
      this.$refs.ref_iteminfo.modal = true;
    },

    showItemdetails(cat_id, item_uuid, cart_row) {
      console.log("showItemdetails", {
        cat_id: cat_id,
        item_uuid: item_uuid,
        cart_row: cart_row,
      });
      const params = { cat_id: cat_id, item_uuid: item_uuid };
      if (cart_row) {
        params.cart_row = cart_row;
      }
      console.log("params", params);
      this.viewItems(params);
    },

    prepareItemsForGrid(category) {
      // Add category availability to each item for the grid component
      return category.item_list.map((item) => ({
        ...item,
        cat_id: category.cat_id,
        category_available: category.available,
      }));
    },

    onClickItemFromGrid(category, item) {
      // Handle click from the new grid component
      this.onClickItem(category, item);
    },

    onClickItem(category, items) {
      const isEligibleItem = this.isEligibleItem(items);
      console.log("isEligibleItem", isEligibleItem);

      if (!isEligibleItem) {
        const message = this.getPromoMessage(items);
        APIinterface.notify("negative", message, "error_outline", this.$q);
        return;
      }

      if (!category.available || !items.available) {
        APIinterface.notify(
          "negative",
          items?.item_unavailable,
          "error_outline",
          this.$q
        );
        return;
      }

      const find_item = this.findItem(items.item_uuid, category.cat_id);

      if (find_item) {
        this.$refs.ref_iteminfo.data = find_item;
        this.$refs.ref_iteminfo.modal = true;
      } else {
        this.viewItems({
          item_uuid: items.item_uuid,
          cat_id: category.cat_id,
        });
      }
    },

    isEligible(item) {
      return this.promoEligibility[item.item_id]?.is_eligible;
    },

    isEligibleItem(item) {
      if (!item.is_promo_free_item) {
        return true;
      }
      return this.promoEligibility[item.item_id]?.is_eligible || false;
    },
    getPromoMessage(item) {
      return (
        this.promoEligibility[item.item_id]?.message ||
        item?.promo_data?.message
      );
    },
    getDiscountBadgeForOffer(item) {
      if (!item.has_discount || !item.price || !item.price[0]) {
        return '';
      }

      const priceData = item.price[0];
      const discount = priceData.discount;
      const discountType = priceData.discount_type;
      // Use backend currency when present, fall back to AED so offers always show a currency
      const currency = priceData.currency || 'AED';

      if (!discount) {
        return '';
      }

      // If discount type is percentage
      if (discountType === 'percentage' || discountType === 'percent') {
        return `-${discount}%`;
      }

      // If discount type is fixed amount
      if (discountType === 'fixed' || discountType === 'amount') {
        return `-${discount} ${currency}`;
      }

      // Default: show as percentage
      return `-${discount}%`;
    },
    findItem(value, cat_id) {
      const items = this.CartData.getItems;
      if (!items || items.length === 0) {
        return false;
      }
      const foundItem = items.filter(
        (item) => item.item_token === value && item.cat_id == cat_id
      );
      return foundItem.length > 0 ? foundItem : false;
    },
    findItemQty(value, cat_id) {
      const items = this.CartData.getItems;
      if (!items || items.length === 0) {
        return false;
      }
      const summedQty = items
        .filter((item) => item.item_token === value && item.cat_id == cat_id)
        .reduce((acc, item) => acc + item.qty, 0);

      return summedQty;
    },
    async afterAddtocart() {
      console.log("afterAddtocart");
      try {
        await this.CartData.getCart(true, null);
      } catch (error) {
      } finally {
        this.promoCheck();
      }
    },

    async fetchMenu() {
      try {
        this.loading = true;
        const paramsObj = {
          currency_code: this.DataStorePersisted.getUseCurrency(),
          client_uuid: this.client_uuid ? this.client_uuid : "",
        };
        // Add branch_id if a branch is selected
        const selectedBranchId = this.DataStorePersisted.getSelectedBranchId();
        if (selectedBranchId) {
          paramsObj.branch_id = selectedBranchId;
        }
        const params = new URLSearchParams(paramsObj).toString();
        console.log("params", params);
        const response = await APIinterface.fetchDataPost(
          "geStoreMenu",
          params
        );
        this.data = response.details.data.category;
        this.best_seller = response.details.data.best_seller;
        this.visibleCategoryCount = 2; // Reset lazy loading
        this.initializeActiveCategory();
        this.initObserver();
        this.setupCategoryObserver();
        this.updateCategoriesSectionTop();
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
        this.data = null;
        this.best_seller = null;
      } finally {
        this.loading = false;
      }

      this.promoCheck();
    },
    onBranchSelected(branch) {
      console.log("Branch selected:", branch);
      // Refresh menu with new branch
      this.fetchMenu();
    },
    showBranchSelector() {
      if (this.has_branches && this.branches.length > 1) {
        this.$refs.ref_branchselector.show();
      }
    },
    async fetchMerchantInfo() {
      try {
        const response = await APIinterface.fetchDataPost("getInfo");
        if (response.details) {
          this.has_branches = response.details.has_branches === true;
          this.branches = response.details.branches || [];

          // If merchant has branches and none selected, show selector or auto-select main
          if (this.has_branches && this.branches.length > 1) {
            if (!this.DataStorePersisted.selected_branch) {
              // Auto-select main branch
              const mainBranch = this.branches.find(b => b.is_main_branch);
              if (mainBranch) {
                this.DataStorePersisted.selectBranch(mainBranch);
              }
            }
          }
        }
      } catch (error) {
        console.log("Error fetching merchant info:", error);
      }
    },
    initializeActiveCategory() {
      // Initialize with first category name
      if (this.data && this.data.length > 0) {
        this.active_category = this.data[0].category_uiid;
        this.active_category_name = this.data[0].category_name;
      }
    },
    afterCategoryselect(value) {
      console.log("afterCategoryselect", value.category_uiid);
      this.$refs.ref_categorymodal.modal = false;
      this.scrollToElement(value.category_uiid);
    },
    initObserver() {
      setTimeout(() => {
        this.startObserver();
      }, 500);
    },
    startObserver() {
      if (this.data) {
        const observer = new IntersectionObserver(this.handleIntersect, {
          root: null,
          rootMargin: "0px",
          threshold: 0.5,
        });

        this.$nextTick(() => {
          if (this.$refs.categories) {
            this.$refs.categories.forEach((category) =>
              observer.observe(category)
            );
          }
        });
      }
    },
    handleIntersect(entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.active_category = entry.target.id;
          this.active_category_name = entry.target.getAttribute("name");
        }
      }
    },
    onScroll(info) {
      // Show sticky nav when scrolled past categories section
      this.scroll_down = info.position.top >= this.categoriesSectionTop;
    },
    updateCategoriesSectionTop() {
      this.$nextTick(() => {
        const categoriesSection = document.querySelector('.categories-section');
        if (categoriesSection) {
          this.categoriesSectionTop = categoriesSection.offsetTop - 60;
        }
      });
    },
    scrollToCategory(category_uuid) {
      this.scrollToElement(category_uuid);
    },
    scrollToElement(id) {
      const ele = document.getElementById(id);
      if (!ele) {
        return;
      }
      const target = getScrollTarget(ele);
      const offset = ele.offsetTop;
      const duration = 500;
      setVerticalScrollPosition(target, offset - 50, duration);
    },
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.fetchMenu();
      this.DataStore.fetchHome(this.client_uuid);
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
    showAllergens(item_id) {
      this.allergens_item_id = item_id;
      this.$refs.allergens.dialog = true;
    },
    async promoCheck() {
      try {
        const params = new URLSearchParams({
          cart_uuid: this.DataStorePersisted.cart_uuid ?? "",
        }).toString();
        const response = await APIinterface.fetchDataGet("PromoCheck", params);
        this.promoEligibility = response.details.data;
      } catch (error) {
        console.log("error", error);
        this.promoEligibility = {};
      }
    },
  },
};
</script>

<style scoped>
/* ============================================
   🚀 HIGH-TECH DESIGN SYSTEM
   Inspired by Apple, Uber Eats, Stripe
   ============================================ */

/* 🎨 CSS Variables */
:root {
  --tech-primary: #f1c646;
  --tech-primary-dark: #d4a82d;
  --tech-accent: #6366f1;
  --tech-success: #10b981;
  --tech-danger: #ef4444;
  --tech-bg: #f8fafc;
  --tech-card: #ffffff;
  --tech-text: #0f172a;
  --tech-text-secondary: #64748b;
  --tech-border: rgba(15, 23, 42, 0.08);
  --tech-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  --tech-shadow-hover: 0 8px 30px rgba(15, 23, 42, 0.12);
  --tech-radius: 16px;
  --tech-radius-lg: 24px;
  --tech-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 📱 Base Page - Aurora Theme */
.tech-page {
  background: linear-gradient(180deg, #3b82f6 0%, #ede9fe 12%, #f8fafc 25%);
  min-height: 100vh;
  padding-bottom: 100px;
}

/* ✨ Hero Header */
.hero-header {
  position: relative;
  padding: 60px 20px 30px;
  overflow: hidden;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 40%, #d946ef 100%);
  opacity: 0.95;
}

.hero-content {
  position: relative;
  z-index: 1;
}

/* 📍 DELIVER TO CARD - Input Style */
.deliver-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.deliver-card:active {
  transform: scale(0.98);
}

.deliver-card-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f1f5f9;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.deliver-icon-wrap {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.deliver-content {
  flex: 1;
  min-width: 0;
}

.deliver-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.deliver-address {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deliver-chevron {
  color: #94a3b8;
}

/* 🏪 BRANCH CARD - Premium Design */
.branch-card-container {
  padding: 0 20px;
  margin-top: -10px;
  margin-bottom: 24px;
}

.branch-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: white;
  border-radius: var(--tech-radius);
  box-shadow: var(--tech-shadow);
  cursor: pointer;
  transition: var(--tech-transition);
}

.branch-card:active {
  transform: scale(0.98);
}

.branch-card-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.branch-card-icon svg {
  width: 22px;
  height: 22px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.branch-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.branch-card-label {
  font-size: 11px;
  color: var(--tech-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
}

.branch-card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--tech-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.branch-card-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #ede9fe 0%, #e9d5ff 100%);
  border-radius: 10px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 700;
}

/* 📌 STICKY HEADER - Full Width Edge-to-Edge */
.sticky-header-container {
  z-index: 100 !important;
  left: 0 !important;
  right: 0 !important;
  padding: 0 !important;
}

/* Staff App Style - Dark Sticky Header */
.sticky-header-full {
  display: flex;
  align-items: stretch;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sticky-category-full {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sticky-category-full:active {
  background: rgba(255, 255, 255, 0.1);
}

.sticky-cat-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.sticky-cat-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sticky-cat-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sticky-cat-name {
  font-size: 14px;
  font-weight: 700;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticky-cat-chevron {
  color: rgba(255, 255, 255, 0.8);
}

.sticky-search-full {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 14px;
  font-weight: 600;
}

.sticky-search-full:active {
  background: rgba(255, 255, 255, 0.1);
}

/* 💀 Skeleton Loading */
.skeleton-container {
  padding: 20px;
}

.skeleton-header {
  margin-bottom: 24px;
}

.skeleton-hero {
  height: 180px;
  border-radius: var(--tech-radius-lg) !important;
}

.skeleton-categories {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 0;
  margin-bottom: 24px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.skeleton-card {
  height: 200px;
  border-radius: var(--tech-radius) !important;
}

/* 📦 Content Wrapper */
.content-wrapper {
  padding: 16px 20px 0;
  margin-top: 0;
}

/* 🎠 Banner Section */
.banner-section {
  margin-bottom: 24px;
  border-radius: var(--tech-radius-lg);
  overflow: hidden;
  box-shadow: var(--tech-shadow);
}

.banner-section :deep(.q-carousel) {
  border-radius: var(--tech-radius-lg);
}

.banner-section :deep(.q-carousel__slide) {
  padding: 0;
}

.banner-section :deep(.q-img) {
  border-radius: var(--tech-radius-lg);
}

/* 📅 Booking CTA */
.booking-cta {
  position: relative;
  margin-bottom: 28px;
  padding: 24px;
  border-radius: var(--tech-radius-lg);
  overflow: hidden;
}

.booking-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.booking-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.booking-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.booking-text {
  flex: 1;
}

.booking-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.booking-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.booking-btn {
  background: white !important;
  color: #059669 !important;
  font-weight: 700 !important;
  padding: 10px 20px !important;
  border-radius: 12px !important;
}

/* 📑 Menu Section */
.menu-section {
  margin-bottom: 28px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.section-badge.sale {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  font-weight: 800;
  font-size: 14px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--tech-text);
  letter-spacing: -0.3px;
}

.section-subtitle {
  font-size: 13px;
  color: var(--tech-text-secondary);
}

.see-all-btn {
  color: #3b82f6 !important;
  font-weight: 600 !important;
}

/* ⭐ Recommended Scroll */
.recommended-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.recommended-scroll::-webkit-scrollbar {
  display: none;
}

.recommended-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  cursor: pointer;
  transition: var(--tech-transition);
}

.recommended-item:active {
  transform: scale(0.95);
}

.recommended-avatar {
  position: relative;
  width: 70px;
  height: 70px;
}

.recommended-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-ring {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  opacity: 0;
  transition: var(--tech-transition);
}

.recommended-item:hover .avatar-ring {
  opacity: 1;
}

.recommended-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--tech-text);
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommended-price {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
}

/* 🏷️ Offers Scroll */
.offers-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.offers-scroll::-webkit-scrollbar {
  display: none;
}

.offer-card {
  position: relative;
  min-width: 140px;
  background: white;
  border-radius: var(--tech-radius);
  overflow: hidden;
  box-shadow: var(--tech-shadow);
  cursor: pointer;
  transition: var(--tech-transition);
}

.offer-card:active {
  transform: scale(0.97);
}

.offer-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 4px 10px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 11px;
  font-weight: 800;
  border-radius: 8px;
}

.offer-image {
  height: 100px;
  overflow: hidden;
}

.offer-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-info {
  padding: 12px;
}

.offer-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-text);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.offer-price {
  font-size: 14px;
  font-weight: 800;
  color: #059669;
}

/* 🗂️ Categories Scroll */
.categories-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 10px 10px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  cursor: pointer;
  transition: var(--tech-transition);
  white-space: nowrap;
}

.category-pill:active {
  transform: scale(0.97);
}

.category-pill.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.category-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--tech-text);
}

/* 🍽️ Category Menu */
.category-menu {
  background: white;
  border-radius: var(--tech-radius-lg);
  padding: 20px;
  box-shadow: var(--tech-shadow);
}

.category-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--tech-border);
  margin-bottom: 16px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
}

.category-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-count {
  font-size: 13px;
  color: var(--tech-text-secondary);
  font-weight: 500;
}

.menu-grid-container {
  min-height: 100px;
}

/* 🏁 End of Menu */
.end-of-menu {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
  color: var(--tech-text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.end-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--tech-border), transparent);
}

/* ⬆️ Scroll Top Button */
.scroll-top-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #3b82f6 100%) !important;
  color: white !important;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5) !important;
}

/* 🌙 Dark Mode */
body.body--dark .tech-page {
  background: linear-gradient(180deg, #2e1065 0%, #0f172a 15%, #020617 30%);
}

body.body--dark .location-bar {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(148, 163, 184, 0.2);
}

body.body--dark .search-bar,
body.body--dark .branch-pill,
body.body--dark .category-pill,
body.body--dark .offer-card,
body.body--dark .category-menu {
  background: #1e293b;
}

body.body--dark .section-title,
body.body--dark .category-name,
body.body--dark .recommended-name,
body.body--dark .offer-name,
body.body--dark .branch-card-name {
  color: #f1f5f9;
}

body.body--dark .deliver-card-inner {
  background: #1e293b;
  border-color: #334155;
}

body.body--dark .deliver-icon-wrap {
  background: #334155;
  color: #94a3b8;
}

body.body--dark .deliver-address {
  color: #f1f5f9;
}

body.body--dark .branch-card {
  background: #1e293b;
}

body.body--dark .branch-card-action {
  background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%);
  color: #a78bfa;
}

/* 🔍 INLINE SEARCH OVERLAY */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.search-overlay-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ede9fe 0%, #e9d5ff 100%);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.search-input-icon {
  color: #3b82f6;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #1e1b4b;
  outline: none;
}

.search-input::placeholder {
  color: #a78bfa;
}

.search-clear {
  color: #3b82f6;
  cursor: pointer;
  padding: 4px;
}

.search-cancel {
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: #3b82f6;
  cursor: pointer;
  padding: 8px 12px;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #a78bfa;
  gap: 12px;
}

.search-empty p {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.search-suggestions {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.search-hint {
  font-size: 14px;
  color: #a78bfa;
  margin: 0;
}

.search-results-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:active {
  transform: scale(0.98);
  background: #ede9fe;
}

.search-item-image {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.search-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-item-info {
  flex: 1;
  min-width: 0;
}

.search-item-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e1b4b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-item-price {
  font-size: 14px;
  font-weight: 700;
  color: #3b82f6;
}

/* Search Transition */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-slide-enter-from,
.search-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ⏳ LOADING MORE */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
}

.category-sentinel {
  height: 1px;
  width: 100%;
}

/* 📱 Responsive */
@media (max-width: 380px) {
  .hero-header {
    padding: 50px 16px 24px;
  }

  .content-wrapper {
    padding: 0 16px;
  }

  .section-title {
    font-size: 18px;
  }
}

/* Dark Mode for Search */
body.body--dark .search-overlay {
  background: rgba(15, 23, 42, 0.98);
}

body.body--dark .search-input-wrap {
  background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%);
  border-color: rgba(59, 130, 246, 0.3);
}

body.body--dark .search-input {
  color: #f1f5f9;
}

body.body--dark .search-result-item {
  background: #1e293b;
  border-color: rgba(59, 130, 246, 0.2);
}

body.body--dark .search-item-name {
  color: #f1f5f9;
}
</style>
