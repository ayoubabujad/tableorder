<template>
  <q-page-scroller
    position="bottom-right"
    :scroll-offset="150"
    :offset="[18, 18]"
  >
    <q-btn
      fab
      icon="keyboard_arrow_up"
      :color="$q.dark.mode ? 'grey' : 'grey-2'"
      :text-color="$q.dark.mode ? 'grey-9' : 'grey'"
      padding="xs"
    />
  </q-page-scroller>
</template>

<script>
export default {
  name: "PageScrollUp",
  setup() {
    return {};
  },
};
</script>
