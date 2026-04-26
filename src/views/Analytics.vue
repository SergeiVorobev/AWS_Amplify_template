<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import Select from "primevue/select";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

const client = generateClient<Schema>();

const aggregates = ref<any[]>([]);
const selectedCategory = ref("");
const selectedBranch = ref("");
const selectedYear = ref("2026");

const categories = [
  { label: "All", value: "" },
  { label: "Dairy", value: "dairy" },
  { label: "Bakery", value: "bakery" },
  { label: "Meat", value: "meat" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Beverages", value: "beverages" },
];

const years = [
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
];

// Load all aggregates from AppSync
const loadData = async () => {
  const result = await client.models.AggregateSale.list();
  aggregates.value = result.data ?? [];
};

// Filter aggregates by selected year and category
const filteredAggregates = computed(() => {
  return aggregates.value.filter(item => {
    const matchYear = item.aggregateKey.includes(`#${selectedYear.value}-`);
    const matchCategory = selectedCategory.value
      ? item.aggregateKey.startsWith(selectedCategory.value)
      : true;
    const matchBranch = selectedBranch.value
      ? item.branch === selectedBranch.value
      : true;
    return matchYear && matchCategory && matchBranch;
  });
});

// Get unique branches for filter dropdown
const branches = computed(() => {
  const unique = [...new Set(aggregates.value.map(i => i.branch))];
  return [{ label: "All", value: "" }, ...unique.map(b => ({ label: b, value: b }))];
});

// Chart 1: Revenue by month (BarChart)
const revenueByMonthChart = computed(() => {
  const byMonth: Record<string, number> = {};
  filteredAggregates.value.forEach(item => {
    const month = item.aggregateKey.split("#")[1];
    byMonth[month] = (byMonth[month] ?? 0) + item.totalRevenue;
  });
  const months = Object.keys(byMonth).sort();
  return {
    title: { text: "Revenue by Month", left: "center", textStyle: { fontSize: 13 } },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: months },
    yAxis: { type: "value", name: "€" },
    series: [{ type: "bar", data: months.map(m => parseFloat(byMonth[m].toFixed(2))), color: "#2E75B6" }],
  };
});

// Chart 2: Revenue by category (PieChart)
const byCategoryChart = computed(() => {
  const byCategory: Record<string, number> = {};
  filteredAggregates.value.forEach(item => {
    const category = item.aggregateKey.split("#")[0];
    byCategory[category] = (byCategory[category] ?? 0) + item.totalRevenue;
  });
  return {
    title: { text: "Revenue by Category", left: "center", textStyle: { fontSize: 13 } },
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [{
      type: "pie",
      radius: "55%",
      data: Object.entries(byCategory).map(([name, value]) => ({
        name, value: parseFloat(value.toFixed(2))
      })),
    }],
  };
});

// Chart 3: Top branches by revenue (horizontal BarChart)
const byBranchChart = computed(() => {
  const byBranch: Record<string, number> = {};
  filteredAggregates.value.forEach(item => {
    byBranch[item.branch] = (byBranch[item.branch] ?? 0) + item.totalRevenue;
  });
  const sorted = Object.entries(byBranch).sort((a, b) => b[1] - a[1]);
  return {
    title: { text: "Top Branches by Revenue", left: "center", textStyle: { fontSize: 13 } },
    tooltip: { trigger: "axis" },
    xAxis: { type: "value", name: "€" },
    yAxis: { type: "category", data: sorted.map(([b]) => b) },
    series: [{ type: "bar", data: sorted.map(([, v]) => parseFloat(v.toFixed(2))), color: "#2A9D8F" }],
  };
});

onMounted(loadData);
</script>

<template>
  <div class="analytics-wrapper">
    <h1 class="page-title">Sales Analytics</h1>

    <!-- Filters -->
    <Card class="filters-card">
      <template #content>
        <div class="filters-row">
          <div class="filter-field">
            <label>Year</label>
            <Select v-model="selectedYear" :options="years" optionLabel="label" optionValue="value" />
          </div>
          <div class="filter-field">
            <label>Category</label>
            <Select v-model="selectedCategory" :options="categories" optionLabel="label" optionValue="value" />
          </div>
          <div class="filter-field">
            <label>Branch</label>
            <Select v-model="selectedBranch" :options="branches" optionLabel="label" optionValue="value" />
          </div>
        </div>
      </template>
    </Card>

    <!-- Charts -->
    <div class="charts-grid">
      <Card>
        <template #content>
          <VChart :option="revenueByMonthChart" style="height: 220px" autoresize />
        </template>
      </Card>
      <Card>
        <template #content>
          <VChart :option="byCategoryChart" style="height: 220px" autoresize />
        </template>
      </Card>
      <Card class="full-width">
        <template #content>
          <VChart :option="byBranchChart" style="height: 160px" autoresize />
        </template>
      </Card>
    </div>

    <!-- Table -->
    <Card class="table-card">
      <template #title>Aggregated Data</template>
      <template #content>
        <DataTable :value="filteredAggregates" sortMode="multiple" paginator :rows="10">
          <Column field="aggregateKey" header="Key" sortable />
          <Column field="branch" header="Branch" sortable />
          <Column field="totalRevenue" header="Revenue (€)" sortable />
          <Column field="totalQuantity" header="Quantity" sortable />
          <Column field="avgPrice" header="Avg Price (€)" sortable />
          <Column field="transactionCount" header="Transactions" sortable />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.analytics-wrapper {
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  color: #1A3A5C;
}

.filters-card .filters-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-field label {
  font-weight: 600;
  font-size: 0.9rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.full-width {
  grid-column: span 2;
}

.table-card {
  width: 100%;
}
</style>