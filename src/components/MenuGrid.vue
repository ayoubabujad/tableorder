<template>
  <div class="ht-menu-grid-wrapper">
    <!-- 🚀 HIGH-TECH MENU GRID -->
    <div class="ht-menu-grid">
      <template v-for="(item, index) in displayedItems" :key="`${item.item_uuid}-${index}`">
        <div
          class="ht-menu-item"
          :class="{ 'ht-menu-item-unavailable': !item.available || item.branch_available === false }"
          @click="onClickItem(item)"
        >
          <!-- Image Container -->
          <div class="ht-menu-item-image">
            <img :src="item.url_image" :alt="item.item_name" loading="lazy" />

            <!-- Discount Badge -->
            <div v-if="item.has_discount && getDiscountBadge(item)" class="ht-menu-item-badge">
              {{ getDiscountBadge(item) }}
            </div>

            <!-- Favorite Button -->
            <div class="ht-menu-item-fav" @click.stop>
              <FavsItems
                ref="favs"
                :item_token="item.item_uuid"
                :cat_id="item.cat_id"
                :active="item.is_favorite"
                :data="item"
                @after-savefav="afterSavefav"
              />
            </div>

            <!-- Add Button -->
            <div
              v-if="findItem(item.item_uuid, item.cat_id)"
              class="ht-menu-item-add added"
              @click.stop="$emit('show-options', findItem(item.item_uuid, item.cat_id))"
            >
              <span class="add-qty">{{ findItemQty(item.item_uuid, item.cat_id) }}</span>
            </div>
            <div
              v-else
              class="ht-menu-item-add"
              :class="{ disabled: !item.category_available || !item.available }"
              @click.stop="onClickItem(item)"
            >
              <q-icon name="add" class="add-icon" />
            </div>

            <!-- Out of Stock Overlay -->
            <div v-if="!item.available || item.branch_available === false" class="ht-menu-item-unavailable-badge">
              {{ $t("Out of Stock") }}
            </div>
          </div>

          <!-- Content -->
          <div class="ht-menu-item-content">
            <div class="ht-menu-item-name">{{ item.item_name }}</div>

            <div class="ht-menu-item-price">
              <span v-if="item.has_discount" class="ht-menu-item-price-old">
                {{ item?.price[0]?.pretty_price }}
              </span>
              <span class="ht-menu-item-price-current">{{ item.lowest_price }}</span>
            </div>

            <!-- Rating -->
            <div v-if="item.total_reviews > 0" class="ht-menu-item-rating">
              <q-icon name="star" class="ht-menu-item-rating-star" size="12px" />
              <span class="ht-menu-item-rating-value">{{ item.average_rating }}</span>
              <span class="ht-menu-item-rating-count">({{ item.total_reviews }})</span>
            </div>

            <!-- Promo Badge -->
            <div v-if="item.promo_data?.message && item.available" class="ht-promo-badge">
              <span :class="isEligible(item) ? 'ht-badge-success' : 'ht-badge-warning'">
                {{ getPromoMessage(item) }}
              </span>
              <span v-if="isEligible(item)" class="ht-free-tag">{{ $t("Free!") }}</span>
            </div>

            <!-- Allergens -->
            <div v-if="item.total_allergens > 0 || item.dish_list?.length" class="ht-menu-item-meta">
              <div
                v-if="item.total_allergens > 0"
                class="ht-allergen-btn"
                @click.stop="$emit('show-allergens', item.item_id)"
              >
                <q-icon name="info_outline" size="14px" />
              </div>
              <div v-for="dish in item.dish_list" :key="dish" class="ht-dish-icon">
                <img :src="dish.url_image" :alt="dish.name" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loadingMore" class="ht-loading">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="scrollSentinel" class="scroll-sentinel"></div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { userCartData } from "stores/CartData";
import APIinterface from "src/api/APIinterface";

export default {
  name: "MenuGrid",
  props: {
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
    promoEligibility: {
      type: Object,
      default: () => ({}),
    },
    pageSize: {
      type: Number,
      default: 20,
    },
  },
  components: {
    FavsItems: defineAsyncComponent(() => import("components/FavsItems.vue")),
  },
  data() {
    return {
      displayedItems: [],
      currentPage: 0,
      loadingMore: false,
      hasLoadedAll: false,
      observer: null,
    };
  },
  setup() {
    const CartData = userCartData();
    return { CartData };
  },
  watch: {
    items: {
      handler(newItems) {
        // Reset when items change (e.g., category filter, search)
        this.resetPagination();
        this.loadInitialItems();
      },
      immediate: true,
    },
  },
  mounted() {
    this.setupInfiniteScroll();
  },
  beforeUnmount() {
    this.cleanupInfiniteScroll();
  },
  methods: {
    resetPagination() {
      this.currentPage = 0;
      this.displayedItems = [];
      this.hasLoadedAll = false;
      this.loadingMore = false;
    },

    loadInitialItems() {
      // Load first page
      const firstPageItems = this.items.slice(0, this.pageSize);
      this.displayedItems = firstPageItems;
      this.currentPage = 1;
      this.hasLoadedAll = this.displayedItems.length >= this.items.length;
    },

    loadMoreItems() {
      if (this.loadingMore || this.hasLoadedAll) {
        return;
      }

      this.loadingMore = true;

      // Simulate async loading with a small delay for better UX
      setTimeout(() => {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const nextPageItems = this.items.slice(startIndex, endIndex);

        if (nextPageItems.length > 0) {
          this.displayedItems = [...this.displayedItems, ...nextPageItems];
          this.currentPage++;
        }

        // Check if we've loaded all items
        this.hasLoadedAll = this.displayedItems.length >= this.items.length;
        this.loadingMore = false;
      }, 300);
    },

    setupInfiniteScroll() {
      this.$nextTick(() => {
        if (!this.$refs.scrollSentinel) return;

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !this.hasLoadedAll && !this.loadingMore) {
                this.loadMoreItems();
              }
            });
          },
          {
            root: null,
            rootMargin: "200px",
            threshold: 0,
          }
        );

        this.observer.observe(this.$refs.scrollSentinel);
      });
    },

    cleanupInfiniteScroll() {
      if (this.observer && this.$refs.scrollSentinel) {
        this.observer.unobserve(this.$refs.scrollSentinel);
        this.observer.disconnect();
      }
    },

    onClickItem(item) {
      this.$emit("click-item", item);
    },

    afterSavefav(value, isActive) {
      value.is_favorite = isActive;
    },

    isEligible(item) {
      return this.promoEligibility[item.item_id]?.is_eligible;
    },

    getPromoMessage(item) {
      return (
        this.promoEligibility[item.item_id]?.message ||
        item?.promo_data?.message
      );
    },

    getDiscountBadge(item) {
      if (!item.has_discount || !item.price || !item.price[0]) {
        return null;
      }

      const priceData = item.price[0];
      const discount = priceData.discount;
      const discountType = priceData.discount_type;
      const currency = priceData.currency || 'AED';

      if (!discount) {
        return null;
      }

      // If discount type is percentage
      if (discountType === 'percentage' || discountType === 'percent') {
        return `-${discount}%`;
      }

      // If discount type is fixed amount
      if (discountType === 'fixed' || discountType === 'amount') {
        return currency ? `-${discount} ${currency}` : `-${discount}`;
      }

      // Default: show as percentage if discount type is not specified
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
  },
};
</script>

<style scoped>
/* 🚀 HIGH-TECH MENU GRID STYLES */
.ht-menu-grid-wrapper {
  width: 100%;
}

.ht-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.ht-menu-item {
  background: var(--ht-surface, #ffffff);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  border: 1px solid var(--ht-border, rgba(15, 23, 42, 0.08));
  cursor: pointer;
  transition: var(--ht-transition-base, 250ms ease);
}

.ht-menu-item:active {
  transform: scale(0.97);
}

/* Image Container */
.ht-menu-item-image {
  position: relative;
  aspect-ratio: 4/3;
  background: var(--ht-bg, #f8fafc);
  overflow: hidden;
}

.ht-menu-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--ht-transition-slow, 350ms ease);
}

.ht-menu-item:hover .ht-menu-item-image img {
  transform: scale(1.05);
}

/* Discount Badge */
.ht-menu-item-badge {
  position: absolute;
  top: var(--ht-space-sm, 8px);
  left: var(--ht-space-sm, 8px);
  padding: 4px 10px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: var(--ht-radius-sm, 8px);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* Favorite Button */
.ht-menu-item-fav {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  background: var(--ht-surface, #ffffff);
  border-radius: var(--ht-radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--ht-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
  z-index: 2;
  transition: var(--ht-transition-fast, 150ms ease);
}

.ht-menu-item-fav:active {
  transform: scale(0.9);
}

/* Add Button - Staff App Style */
.ht-menu-item-add {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  z-index: 2;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ht-menu-item-add:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.ht-menu-item-add:active {
  transform: scale(0.95);
}

.ht-menu-item-add.added {
  background: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.ht-menu-item-add .add-icon {
  font-size: 20px;
  color: white;
}

.ht-menu-item-add.added .add-icon,
.ht-menu-item-add.added .add-qty {
  color: white;
}

.ht-menu-item-add .add-qty {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.ht-menu-item-add.disabled {
  background: #e2e8f0;
  box-shadow: none;
  cursor: not-allowed;
}

.ht-menu-item-add.disabled .add-icon {
  color: #94a3b8;
}

/* Out of Stock */
.ht-menu-item-unavailable .ht-menu-item-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.ht-menu-item-unavailable-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(239, 68, 68, 0.95);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: var(--ht-radius-sm, 8px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Content */
.ht-menu-item-content {
  padding: 8px;
}

.ht-menu-item-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--ht-text, #0f172a);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 3px;
}

.ht-menu-item-price {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

/* Staff App Style - Green Price */
.ht-menu-item-price-current {
  font-size: 15px;
  font-weight: 700;
  color: #059669;
}

.ht-menu-item-price-old {
  font-size: 12px;
  color: var(--ht-text-tertiary, #94a3b8);
  text-decoration: line-through;
}

.ht-menu-item-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.ht-menu-item-rating-star {
  color: #fbbf24;
}

.ht-menu-item-rating-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--ht-text, #0f172a);
}

.ht-menu-item-rating-count {
  font-size: 11px;
  color: var(--ht-text-tertiary, #94a3b8);
}

/* Promo Badge */
.ht-promo-badge {
  margin-bottom: 4px;
}

.ht-badge-success {
  display: inline-block;
  padding: 3px 8px;
  background: var(--ht-success-light, #d1fae5);
  color: #059669;
  font-size: 10px;
  font-weight: 600;
  border-radius: var(--ht-radius-xs, 6px);
}

.ht-badge-warning {
  display: inline-block;
  padding: 3px 8px;
  background: #fef3c7;
  color: #d97706;
  font-size: 10px;
  font-weight: 600;
  border-radius: var(--ht-radius-xs, 6px);
}

.ht-free-tag {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
}

/* Meta (Allergens, Dishes) */
.ht-menu-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ht-allergen-btn {
  width: 24px;
  height: 24px;
  background: var(--ht-bg, #f8fafc);
  border-radius: var(--ht-radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ht-text-secondary, #64748b);
  cursor: pointer;
}

.ht-dish-icon {
  width: 20px;
  height: 20px;
  border-radius: var(--ht-radius-full, 9999px);
  overflow: hidden;
}

.ht-dish-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Loading */
.ht-loading {
  display: flex;
  justify-content: center;
  padding: var(--ht-space-lg, 24px);
}

.scroll-sentinel {
  height: 1px;
  width: 100%;
}

/* Responsive */
@media (max-width: 380px) {
  .ht-menu-grid {
    gap: 8px;
  }

  .ht-menu-item-content {
    padding: 8px;
  }

  .ht-menu-item-name {
    font-size: 12px;
  }
}

@media (min-width: 768px) {
  .ht-menu-grid {
    gap: 12px;
  }

  .ht-menu-item-name {
    font-size: 14px;
  }
}

/* Dark Mode */
body.body--dark .ht-menu-item {
  background: var(--ht-bg-elevated, #1e293b);
}

body.body--dark .ht-menu-item-name {
  color: var(--ht-text, #f1f5f9);
}

body.body--dark .ht-menu-item-fav,
body.body--dark .ht-menu-item-add {
  background: var(--ht-bg-elevated, #1e293b);
}
</style>
