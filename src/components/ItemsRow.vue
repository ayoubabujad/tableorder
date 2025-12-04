<template>
  <!-- 🚀 HIGH-TECH ITEMS ROW (Best Sellers) -->

  <!-- Loading State -->
  <div v-if="loading" class="ht-items-loading">
    <div v-for="i in 3" :key="i" class="ht-item-skeleton">
      <q-skeleton type="rect" class="ht-skeleton-image" animation="wave" />
      <q-skeleton type="text" width="80%" class="q-mt-sm" animation="wave" />
      <q-skeleton type="text" width="50%" animation="wave" />
    </div>
  </div>

  <!-- Items Scroll -->
  <div v-else class="ht-items-scroll">
    <div
      v-for="item in data"
      :key="item.item_uuid"
      class="ht-item-card"
      @click="$emit('viewItems', { item_uuid: item.item_uuid, cat_id: item.cat_id })"
    >
      <!-- Image -->
      <div class="ht-item-image">
        <img :src="item.url_image" :alt="item.item_name" loading="lazy" />

        <!-- Discount Badge -->
        <div v-if="item.has_discount" class="ht-item-discount">
          {{ item.discount_label || 'SALE' }}
        </div>

        <!-- TABLE ORDER: No favorite button -->

        <!-- Add Button -->
        <div
          class="ht-item-add"
          @click.stop="$emit('viewItems', { item_uuid: item.item_uuid, cat_id: item.cat_id })"
        >
          <q-icon name="add" size="18px" />
        </div>
      </div>

      <!-- Content -->
      <div class="ht-item-content">
        <div class="ht-item-name">{{ item.item_name }}</div>

        <div class="ht-item-price-row">
          <div class="ht-item-prices">
            <span v-if="item.has_discount" class="ht-item-price-old">
              {{ item.lowest_price_discount }}
            </span>
            <span class="ht-item-price">{{ item.lowest_price }}</span>
          </div>

          <div v-if="item.total_reviews > 0" class="ht-item-rating">
            <q-icon name="star" size="12px" color="amber-6" />
            <span class="ht-rating-value">{{ item.average_rating }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ItemsRow",
  props: ["data", "loading"],
  // TABLE ORDER: No favorites functionality
};
</script>

<style scoped>
/* 🚀 HIGH-TECH ITEMS ROW STYLES */
.ht-items-loading {
  display: flex;
  gap: var(--ht-space-md, 16px);
  padding: var(--ht-space-sm, 8px) 0;
}

.ht-item-skeleton {
  min-width: 150px;
}

.ht-skeleton-image {
  height: 130px;
  border-radius: var(--ht-radius-lg, 18px) !important;
}

.ht-items-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 6px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.ht-items-scroll::-webkit-scrollbar {
  display: none;
}

.ht-item-card {
  min-width: 140px;
  max-width: 140px;
  background: var(--ht-surface, #ffffff);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  border: 1px solid var(--ht-border, rgba(15, 23, 42, 0.08));
  cursor: pointer;
  transition: var(--ht-transition-base, 250ms ease);
  flex-shrink: 0;
}

.ht-item-card:active {
  transform: scale(0.97);
}

.ht-item-image {
  position: relative;
  height: 100px;
  background: var(--ht-bg, #f8fafc);
  overflow: hidden;
}

.ht-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--ht-transition-slow, 350ms ease);
}

.ht-item-card:hover .ht-item-image img {
  transform: scale(1.05);
}

.ht-item-discount {
  position: absolute;
  top: var(--ht-space-sm, 8px);
  left: var(--ht-space-sm, 8px);
  padding: 3px 8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: var(--ht-radius-xs, 6px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ht-item-fav {
  position: absolute;
  top: var(--ht-space-sm, 8px);
  right: var(--ht-space-sm, 8px);
  z-index: 2;
}

.ht-item-add {
  position: absolute;
  bottom: var(--ht-space-sm, 8px);
  right: var(--ht-space-sm, 8px);
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: var(--ht-radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--ht-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.15));
  transition: var(--ht-transition-bounce, 500ms cubic-bezier(0.34, 1.56, 0.64, 1));
}

.ht-item-add:active {
  transform: scale(0.85);
}

.ht-item-content {
  padding: 8px;
}

.ht-item-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--ht-text, #0f172a);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.ht-item-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ht-item-prices {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ht-item-price {
  font-size: 13px;
  font-weight: 700;
  color: #3b82f6;
}

.ht-item-price-old {
  font-size: 11px;
  color: var(--ht-text-tertiary, #94a3b8);
  text-decoration: line-through;
}

.ht-item-rating {
  display: flex;
  align-items: center;
  gap: 3px;
}

.ht-rating-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--ht-text, #0f172a);
}

/* Dark Mode */
body.body--dark .ht-item-card {
  background: var(--ht-bg-elevated, #1e293b);
}

body.body--dark .ht-item-name,
body.body--dark .ht-rating-value {
  color: var(--ht-text, #f1f5f9);
}
</style>
