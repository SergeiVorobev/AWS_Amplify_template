<script setup lang="ts">
import { ref, computed } from "vue";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Button from "primevue/button";
import Card from "primevue/card";

const client = generateClient<Schema>();
const toast = useToast();

const branch = ref("");
const location = ref("");
const productName = ref("");
const category = ref("");
const price = ref<number>(0);
const quantity = ref<number>(1);
const loading = ref(false);

const categories = [
  { label: "Dairy", value: "dairy" },
  { label: "Bakery", value: "bakery" },
  { label: "Meat", value: "meat" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Beverages", value: "beverages" },
];

// Calculate total amount in real time
const totalAmount = computed(() => {
  return parseFloat((price.value * quantity.value).toFixed(2));
});

const resetForm = () => {
  branch.value = "";
  location.value = "";
  productName.value = "";
  category.value = "";
  price.value = 0;
  quantity.value = 1;
};

const submitTransaction = async () => {
  if (!branch.value || !location.value || !productName.value || !category.value || price.value <= 0) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Please fill in all fields", life: 3000 });
    return;
  }

  loading.value = true;
  try {
    await client.models.Transaction.create({
      branch: branch.value,
      location: location.value,
      productName: productName.value,
      category: category.value,
      price: price.value,
      quantity: quantity.value,
      totalAmount: totalAmount.value,
    });

    toast.add({ severity: "success", summary: "Success", detail: "Transaction saved successfully", life: 3000 });
    resetForm();
  } catch (error) {
    toast.add({ severity: "error", summary: "Error", detail: "Failed to save transaction", life: 3000 });
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Toast />
  <div class="form-wrapper">
    <Card class="form-card">
      <template #title>Add Transaction</template>
      <template #content>
        <div class="form-grid">
          <div class="field">
            <label>Branch</label>
            <InputText v-model="branch" placeholder="e.g. A1" />
          </div>

          <div class="field">
            <label>Location</label>
            <InputText v-model="location" placeholder="e.g. Berlin" />
          </div>

          <div class="field">
            <label>Product Name</label>
            <InputText v-model="productName" placeholder="e.g. Milk" />
          </div>

          <div class="field">
            <label>Category</label>
            <Select
              v-model="category"
              :options="categories"
              optionLabel="label"
              optionValue="value"
              placeholder="Select category"
            />
          </div>

          <div class="field">
            <label>Price (€)</label>
            <InputNumber v-model="price" :minFractionDigits="2" :maxFractionDigits="2" :min="0" />
          </div>

          <div class="field">
            <label>Quantity</label>
            <InputNumber v-model="quantity" :min="1" />
          </div>

          <div class="field total-field">
            <label>Total Amount (€)</label>
            <div class="total-value">{{ totalAmount.toFixed(2) }}</div>
          </div>
        </div>

        <Button
          label="Save Transaction"
          icon="pi pi-check"
          :loading="loading"
          @click="submitTransaction"
          class="submit-btn"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.form-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.form-card {
  width: 100%;
  max-width: 600px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  font-size: 0.9rem;
}

.total-field {
  grid-column: span 2;
}

.total-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2E75B6;
  padding: 0.5rem 0;
}

.submit-btn {
  width: 100%;
}
</style>