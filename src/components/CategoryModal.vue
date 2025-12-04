<template>
  <q-dialog v-model="modal" position="bottom">
    <div class="category-modal">
      <!-- Header -->
      <div class="category-modal-header">
        <div class="category-modal-icon">
          <q-icon name="o_grid_view" size="24px" />
        </div>
        <div class="category-modal-title">
          <h3>{{ $t("Categories") }}</h3>
          <p>{{ $t("Browse all categories") }}</p>
        </div>
        <button class="category-modal-close" @click="modal = false">
          <q-icon name="close" size="20px" />
        </button>
      </div>

      <!-- Category List -->
      <div class="category-list">
        <div
          v-for="items in data"
          :key="items"
          class="category-item"
          :class="{ selected: active_category == items.category_uiid }"
          @click="this.$emit('afterCategoryselect', items)"
        >
          <div class="category-item-avatar">
            <img :src="items.url_image" />
          </div>
          <span class="category-item-name">{{ items.category_name }}</span>
          <q-icon
            v-if="active_category == items.category_uiid"
            name="check_circle"
            size="22px"
            class="category-item-check"
          />
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script>
export default {
  name: "CategoryModal",
  props: ["data", "active_category"],
  data() {
    return {
      modal: false,
    };
  },
  setup() {
    return {};
  },
};
</script>

<style scoped>
/* 📂 AURORA CATEGORY MODAL */
.category-modal {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.category-modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #d946ef 100%);
}

.category-modal-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.category-modal-title {
  flex: 1;
}

.category-modal-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.category-modal-title p {
  margin: 2px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.category-modal-close {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}

/* Category List */
.category-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.category-item:active {
  transform: scale(0.98);
}

.category-item.selected {
  background: linear-gradient(135deg, #ede9fe 0%, #e9d5ff 100%);
  border-color: #3b82f6;
}

.category-item-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-item-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-item.selected .category-item-avatar {
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
  border: 2px solid #3b82f6;
}

.category-item-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #1e1b4b;
}

.category-item-check {
  color: #3b82f6;
}

/* Dark Mode */
body.body--dark .category-modal {
  background: #0f172a;
}

body.body--dark .category-item {
  background: #1e293b;
}

body.body--dark .category-item.selected {
  background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%);
}

body.body--dark .category-item-name {
  color: #f1f5f9;
}

body.body--dark .category-item-avatar {
  background: #334155;
}
</style>
