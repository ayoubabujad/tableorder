<template>
  <div class="row q-gutter-x-md justify-center">
    <q-input
      v-for="i in length"
      v-model="fieldValues[i - 1]"
      v-bind="$attrs"
      @keyup="onKeyUp($event, i - 1)"
      @update:model-value="onUpdate($event, i - 1)"
      :key="i"
      :ref="(el) => updateFieldRef(el, i - 1)"
      maxlength="1"
      input-class="text-center"
      style="width: 6ch"
    >
    </q-input>
  </div>
</template>

<script>
import {
  defineAsyncComponent,
  computed,
  onBeforeUpdate,
  ref,
  watch,
  watchEffect,
} from "vue";

export default {
  name: "OtpInput",
  emits: ["update:modelValue"],
  props: {
    inputLength: {
      type: Number,
      default: 6,
    },
  },
  setup(props, { emit }) {
    const length = computed(() => props.inputLength);
    const fields = ref([]);
    const fieldValues = ref([]);

    const composite = computed(() => {
      const nonNullFields = fieldValues.value.filter((value) => value);
      if (length.value !== nonNullFields.length) {
        return "";
      }
      return nonNullFields.join("");
    });

    watch(composite, () => {
      if (composite.value) {
        // You should emit this value, e.g.
        emit("update:modelValue", composite.value);
        console.log(composite.value);
      }
    });

    onBeforeUpdate(() => {
      fields.value = [];
    });

    const updateFieldRef = (element, index) => {
      if (element) {
        fields.value[index] = element;
      }
    };

    const focus = (index) => {
      if (index >= 0) {
        if (index < length.value) {
          fields.value[index].select();
        } else {
          if (composite.value) {
            fields.value[index - 1].blur();
          }
        }
      }
    };

    const onUpdate = (value, index) => {
      if (value) {
        focus(index + 1);
      }
    };

    const onKeyUp = (evnt, index) => {
      const key = evnt.key;

      if (["Tab", "Shift", "Meta", "Control", "Alt"].includes(key)) {
        return;
      }

      if (["Delete"].includes(key)) {
        return;
      }

      if (key === "ArrowLeft" || key === "Backspace") {
        focus(index - 1);
      } else if (key === "ArrowRight") {
        focus(index + 1);
      }
    };

    return {
      composite,
      fields,
      fieldValues,
      focus,
      length,
      onKeyUp,
      onUpdate,
      updateFieldRef,
    };

    //
  },
};
</script>
