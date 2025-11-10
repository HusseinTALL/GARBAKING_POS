<!--
  MetricCard Component
  Displays a metric with value, label, change percentage, and trend indicator
  Used on the Dashboard for key business metrics (Revenue, Orders, Customers)
-->
<template>
  <div class="metric-card">
    <div class="metric-header">
      <div class="metric-content">
        <p class="metric-label">{{ label }}</p>
        <p class="metric-value">{{ formattedValue }}</p>
        <div class="metric-change" :class="`change-${trend}`">
          <component :is="trendIcon" class="w-4 h-4" />
          <span>{{ change > 0 ? '+' : '' }}{{ change }}%</span>
        </div>
      </div>
      <div class="metric-icon" :class="`icon-${iconColor}`">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-vue-next'

interface Props {
  label: string
  value: number
  change: number
  icon?: any
  iconColor?: 'orange' | 'green' | 'blue' | 'purple'
  formatAs?: 'currency' | 'number'
}

const props = withDefaults(defineProps<Props>(), {
  icon: DollarSign,
  iconColor: 'orange',
  formatAs: 'number'
})

const trend = computed(() => props.change >= 0 ? 'up' : 'down')
const trendIcon = computed(() => props.change >= 0 ? ArrowUp : ArrowDown)

const formattedValue = computed(() => {
  if (props.formatAs === 'currency') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF', // West African CFA franc
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(props.value)
  }
  return new Intl.NumberFormat('fr-FR').format(props.value)
})
</script>

<style scoped>
.metric-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 24px;
  border: 1px solid var(--border);
  transition: all 0.3s;
  min-width: 220px;
}

.metric-card:hover {
  border-color: rgba(255, 107, 53, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.metric-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: var(--font-size-hero);
  font-weight: 700;
  color: var(--text-primary);
  margin: 12px 0;
  line-height: 1;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-small);
  font-weight: 600;
  margin-top: 8px;
}

.change-up {
  color: var(--accent-green);
}

.change-down {
  color: var(--accent-red);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-orange {
  background: rgba(255, 107, 53, 0.15);
  color: var(--accent-orange);
}

.icon-green {
  background: rgba(76, 175, 80, 0.15);
  color: var(--accent-green);
}

.icon-blue {
  background: rgba(33, 150, 243, 0.15);
  color: var(--accent-blue);
}

.icon-purple {
  background: rgba(156, 39, 176, 0.15);
  color: var(--accent-purple);
}

/* Responsive */
@media (max-width: 768px) {
  .metric-card {
    padding: 16px;
  }

  .metric-value {
    font-size: 24px;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
