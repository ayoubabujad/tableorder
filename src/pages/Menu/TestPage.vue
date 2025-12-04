<template>
  <q-page padding>
    =>{{ isModal }}
    <q-btn
      label="show"
      unelevated
      color="primary"
      @click="isModal = !isModal"
    ></q-btn>
    <swipe-modal
      v-model="isModal"
      contents-height="50vh"
      border-top-radius="16px"
      contents-color="#f6f6f6"
    >
      <q-card class="no-shadow">
        <q-card-section
          class="no-wrap q-pa-none bg-mygrey"
          style="
            border-bottom-right-radius: 25px;
            border-bottom-left-radius: 25px;
          "
        >
          <q-img
            src="https://demo.bastisapp.com/upload/3/68c79292-80ae-11ec-859e-99479722e411.png"
            style="height: 150px"
            fit="contain"
            spinner-color="primary"
            spinner-size="xs"
          ></q-img>
        </q-card-section>
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <div class="col">
              <div class="text-weight-medium font17 line-normal ellipsis">
                McFlurry w/ Oreo
              </div>
            </div>
            <div class="text-right col-4 q-gutter-sm">
              <q-btn
                color="primary"
                icon="favorite_border"
                size="sm"
                outline
                round
              />
            </div>
          </div>
          <p class="ellipsis-2-lines text-grey font12">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
            malesuada, diam sed consequat consectetur, nunc eros congue lacus,
            vitae tincidunt libero orci convallis urna. Pellentesque et sapien
            scelerisque, accumsan mauris eget, maximus risus. Integer tristique,
            mauris eget scelerisque rutrum, justo mauris hendrerit diam, eu
            rutrum tortor urna vitae urna. Aliquam facilisis efficitur massa, ut
            molestie arcu maximus rutrum. Suspendisse odio odio, vulputate ac
            quam a, faucibus vestibulum mauris. Aliquam viverra vehicula nunc
            facilisis tincidunt. Pellentesque ornare at purus in tempor. Ut
            feugiat massa eu pharetra placerat. Pellentesque habitant morbi
            tristique senectus et netus et malesuada fames ac turpis egestas.
            Vestibulum lobortis diam et ipsum elementum, sodales fermentum nisi
            facilisis. Nunc at hendrerit arcu. Suspendisse potenti. Duis iaculis
            fringilla tellus, at sagittis justo pretium feugiat. Nulla facilisi.
          </p>

          <div class="bg-mygrey q-pa-sm radius10 q-mb-md">
            <div class="text-weight-medium font15 line-normal">
              Customize your Order
            </div>
            <q-list dense class="q-list-small">
              <q-item tag="label" class="q-pa-none">
                <q-item-section avatar>
                  <q-radio
                    v-model="size"
                    val="1"
                    size="xs"
                    checked-icon="fiber_manual_record"
                    unchecked-icon="fiber_manual_record"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Small 1.00$</q-item-label>
                </q-item-section>
              </q-item>
              <q-item tag="label" class="q-pa-none">
                <q-item-section avatar>
                  <q-radio
                    v-model="size"
                    val="2"
                    size="xs"
                    checked-icon="fiber_manual_record"
                    unchecked-icon="fiber_manual_record"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Small 1.00$</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- RADIO -->
          <div class="bg-mygrey q-pa-sm radius10 q-mb-md">
            <div class="flex justify-between">
              <div class="text-weight-medium font15 line-normal">
                Include Add-ons
              </div>
              <div class="text-grey font12">(Optional)</div>
            </div>
            <q-list dense class="q-list-small">
              <q-item tag="label" class="q-pa-none">
                <q-item-section avatar>
                  <q-radio
                    v-model="size"
                    val="1"
                    size="xs"
                    checked-icon="fiber_manual_record"
                    unchecked-icon="fiber_manual_record"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>McCafé Premium Roast Coffee</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>+$2.00</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <!-- RADIO -->

          <!-- CHECKBOX -->
          <div class="bg-mygrey q-pa-sm radius10 q-mb-md">
            <div class="flex justify-between">
              <div>
                <div class="text-weight-medium font15 line-normal">
                  Ingredients
                </div>
                <div class="font11">Choose up to 2</div>
              </div>
              <div class="text-grey font12">(Optional)</div>
            </div>
            <q-list dense class="q-list-small">
              <q-item tag="label" class="q-pa-none">
                <q-item-section avatar>
                  <q-checkbox
                    v-model="ingredients"
                    size="xs"
                    checked-icon="check_box"
                    unchecked-icon="square"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>McCafé Premium Roast Coffee</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>+$2.00</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <!-- CHECKBOX -->

          <!-- WITH QTY -->
          <div class="bg-mygrey q-pa-sm radius10 q-mb-md">
            <div class="flex justify-between">
              <div>
                <div class="text-weight-medium font15 line-normal">
                  Include Add-ons
                </div>
                <!-- <div class="font11">Choose up to 2</div> -->
              </div>
              <div class="text-grey font12">(Optional)</div>
            </div>
            <q-list dense class="q-list-small">
              <q-item class="q-pa-none">
                <q-item-section>
                  <q-btn
                    v-morph:add:mygroup:500.resize="morphGroupModel"
                    round
                    color="primary"
                    icon="o_add"
                    unelevated
                    size="xs"
                    style="height: 20px; width: 20px"
                    @click="morphGroupModel = 'qty'"
                  />

                  <div
                    class="input-center qty-small"
                    v-morph:qty:mygroup:200.resize="morphGroupModel"
                  >
                    <q-input
                      v-model="qty"
                      outlined
                      color="darkgreen"
                      bg-color="darkgreen"
                      maxlength="14"
                      dense
                      class="input-to-white radius20"
                      style="overflow: hidden"
                      readonly
                    >
                      <template v-slot:prepend>
                        <q-btn
                          color="lightgreen"
                          text-color="white"
                          icon="remove"
                          unelevated
                          dense
                          size="xs"
                          @click="qty > 1 ? qty-- : 1"
                        />
                      </template>
                      <template v-slot:append>
                        <q-btn
                          color="lightgreen"
                          text-color="white"
                          icon="add"
                          unelevated
                          dense
                          size="xs"
                          @click="qty++"
                        />
                      </template>
                    </q-input>
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label>McCafé Premium Roast Coffee</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>+$2.00</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <!-- WITH QTY -->
          <!-- <q-space class="q-pa-xl"></q-space> -->
        </q-card-section>
      </q-card>
    </swipe-modal>
  </q-page>
</template>

<script>
import swipeModal from "@takuma-ru/vue-swipe-modal";

export default {
  name: "TestPage",
  data() {
    return {
      isModal: false,
    };
  },
  components: { swipeModal },
};
</script>
