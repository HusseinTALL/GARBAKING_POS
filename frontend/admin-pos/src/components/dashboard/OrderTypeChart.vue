<!--
  OrderTypeChart Component
  Displays order distribution by type (Dine In, To Go, Delivery) as a donut chart
  Uses Chart.js for visualization
-->
<template>
  <div class="order-type-chart">
    <div class="chart-header">
      <h3 class="chart-title">Order Type Distribution</h3>
    </div>

    <div class="chart-container">
      <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>

    <!-- Legend -->
    <div class="chart-legend">
      <div v-for="item in orderTypes" :key="item.type" class="legend-item">
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <div class="legend-details">
          <p class="legend-label">{{ item.type }}</p>
          <p class="legend-value">{{ item.count }} ({{ item.percentage }}%)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface OrderType {
  type: string
  count: number
  percentage: number
  color: string
}

interface Props {
  orderTypes: OrderType[]
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.orderTypes.map(d => d.type),
  datasets: [{
    data: props.orderTypes.map(d => d.count),
    backgroundColor: props.orderTypes.map(d => d.color),
    borderWidth: 0,
    borderRadius: 4,
    spacing: 2
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '70%',
  plugins: {
    legend: {
      display: false // We'll use custom legend
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(26, 26, 46, 0.95)',
      titleColor: '#FFFFFF',
      bodyColor: '#9E9E9E',
      borderColor: '#2A2A3E',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  }
}
</script>

<style scoped>
.order-type-chart {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  padding: 24px;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  max-width: 250px;
  margin: 0 auto 24px;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-details {
  flex: 1;
}

.legend-label {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 2px;
}

.legend-value {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .order-type-chart {
    padding: 16px;
  }

  .chart-container {
    max-width: 200px;
  }
}
</style>
