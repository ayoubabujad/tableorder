<template>
  <div :class="class_name">
    <span v-html="isExpanded ? description : truncatedDescription"></span>
    <q-btn
      v-if="showMoreButton"
      :label="!isExpanded ? $t('read_more') : $t('read_less')"
      flat
      unelevated
      no-caps
      color="primary"
      style="min-height: auto"
      class="q-pa-none"
      @click="toggleReadMore"
    />
  </div>
</template>

<script>
export default {
  name: "TextComponents",
  props: ["description", "max_lenght", "label", "class_name"],
  data() {
    return {
      isExpanded: false,
    };
  },
  computed: {
    showMoreButton() {
      if (!this.description) {
        return false;
      }
      return this.description.length <= this.max_lenght ? false : true;
    },
    truncatedDescription() {
      if (!this.description) {
        return;
      }
      return this.description.length > this.max_lenght
        ? this.description.slice(0, this.max_lenght) + "..."
        : this.description;
    },
    showReadMore() {
      if (!this.description) {
        return;
      }
      return this.description.length > this.max_lenght;
    },
  },
  methods: {
    toggleReadMore() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>
