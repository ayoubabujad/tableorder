<template>
  <q-dialog v-model="modal" position="bottom">
    <div class="branch-modal">
      <!-- Header -->
      <div class="branch-modal-header">
        <div class="branch-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21h18"/>
            <path d="M5 21V7l7-4 7 4v14"/>
            <path d="M9 21v-6h6v6"/>
          </svg>
        </div>
        <div class="branch-modal-title">
          <h3>{{ $t("Select Branch") }}</h3>
          <p>{{ $t("Choose a location to order from") }}</p>
        </div>
        <button class="branch-modal-close" @click="modal = false">
          <q-icon name="close" size="20px" />
        </button>
      </div>

      <!-- Branch List -->
      <div class="branch-list">
        <div
          v-for="branch in branches"
          :key="branch.branch_id"
          class="branch-item"
          :class="{
            selected: isSelected(branch),
            closed: branch.close_store
          }"
          @click="selectBranch(branch)"
        >
          <div class="branch-item-radio">
            <div class="radio-outer">
              <div class="radio-inner"></div>
            </div>
          </div>
          <div class="branch-item-content">
            <div class="branch-item-name">
              {{ branch.branch_name }}
              <span v-if="branch.is_main_branch" class="branch-badge main">{{ $t("Main") }}</span>
              <span v-if="branch.close_store" class="branch-badge closed">{{ $t("Closed") }}</span>
            </div>
            <div class="branch-item-address">{{ branch.address }}</div>
            <div v-if="branch.contact_phone" class="branch-item-phone">
              <q-icon name="o_phone" size="14px" />
              <span>{{ branch.contact_phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Button -->
      <div class="branch-modal-footer" v-if="selectedBranch">
        <button
          class="branch-confirm-btn"
          :class="{ disabled: !selectedBranch || selectedBranch.close_store }"
          @click="confirmSelection"
          :disabled="!selectedBranch || selectedBranch.close_store"
        >
          <span>{{ $t("Confirm Selection") }}</span>
          <q-icon name="chevron_right" size="20px" />
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";

export default defineComponent({
  name: "BranchSelector",
  props: {
    branches: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["branch-selected"],
  setup(props, { emit }) {
    const DataStorePersisted = useDataStorePersisted();
    const modal = ref(false);
    const selectedBranch = ref(null);

    // Initialize with persisted selection or main branch
    const initSelection = () => {
      if (DataStorePersisted.selected_branch) {
        selectedBranch.value = DataStorePersisted.selected_branch;
      } else if (props.branches.length > 0) {
        // Default to main branch or first available
        const mainBranch = props.branches.find((b) => b.is_main_branch);
        selectedBranch.value = mainBranch || props.branches[0];
      }
    };

    const isSelected = (branch) => {
      return selectedBranch.value?.branch_id === branch.branch_id;
    };

    const selectBranch = (branch) => {
      if (!branch.close_store) {
        selectedBranch.value = branch;
      }
    };

    const confirmSelection = () => {
      if (selectedBranch.value) {
        DataStorePersisted.selectBranch(selectedBranch.value);
        emit("branch-selected", selectedBranch.value);
        modal.value = false;
      }
    };

    const show = () => {
      initSelection();
      modal.value = true;
    };

    return {
      modal,
      selectedBranch,
      isSelected,
      selectBranch,
      confirmSelection,
      show,
    };
  },
});
</script>

<style scoped>
/* 🏪 AURORA BRANCH MODAL */
.branch-modal {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.branch-modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #d946ef 100%);
}

.branch-modal-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.branch-modal-icon svg {
  width: 26px;
  height: 26px;
  stroke: white;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.branch-modal-title {
  flex: 1;
}

.branch-modal-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.branch-modal-title p {
  margin: 2px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.branch-modal-close {
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

/* Branch List */
.branch-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.branch-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.branch-item:active {
  transform: scale(0.98);
}

.branch-item.selected {
  background: linear-gradient(135deg, #ede9fe 0%, #e9d5ff 100%);
  border-color: #3b82f6;
}

.branch-item.closed {
  opacity: 0.5;
  cursor: not-allowed;
}

.branch-item-radio {
  padding-top: 2px;
}

.radio-outer {
  width: 22px;
  height: 22px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.branch-item.selected .radio-outer {
  border-color: #3b82f6;
  background: #3b82f6;
}

.radio-inner {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all 0.25s ease;
}

.branch-item.selected .radio-inner {
  opacity: 1;
  transform: scale(1);
}

.branch-item-content {
  flex: 1;
  min-width: 0;
}

.branch-item-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e1b4b;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.branch-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.branch-badge.main {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
}

.branch-badge.closed {
  background: #fecaca;
  color: #dc2626;
}

.branch-item-address {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.branch-item-phone {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #3b82f6;
}

/* Footer */
.branch-modal-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid #f1f5f9;
}

.branch-confirm-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #d946ef 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.branch-confirm-btn:active {
  transform: scale(0.98);
}

.branch-confirm-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dark Mode */
body.body--dark .branch-modal {
  background: #0f172a;
}

body.body--dark .branch-item {
  background: #1e293b;
}

body.body--dark .branch-item.selected {
  background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%);
}

body.body--dark .branch-item-name {
  color: #f1f5f9;
}

body.body--dark .branch-item-address {
  color: #94a3b8;
}

body.body--dark .branch-modal-footer {
  border-top-color: #1e293b;
}

body.body--dark .radio-outer {
  border-color: #475569;
}
</style>
