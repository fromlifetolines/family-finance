<template>
  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <h3 class="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
      🎯 預算執行進度條
    </h3>
    <div class="space-y-4">
      <div v-for="b in budgetStatus" :key="b.group" class="space-y-1.5">
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium text-slate-700">{{ b.group }}</span>
          <span class="font-mono text-slate-500">
            $ {{ b.actual.toLocaleString() }} / $ {{ b.limit.toLocaleString() }}
            <span class="ml-1 text-xs font-bold" :class="b.statusClass">
              ({{ b.percent }}%)
            </span>
          </span>
        </div>
        <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50">
          <div 
            class="h-full transition-all duration-500 rounded-full" 
            :class="b.barColor"
            :style="{ width: `${Math.min(100, b.percent)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  budgets: {
    type: Array,
    required: true
  },
  transactions: {
    type: Array,
    required: true
  }
});

const budgetStatus = computed(() => {
  return props.budgets.map(b => {
    const actual = props.transactions
      .filter(t => t.type === '支出' && t.group === b.group)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const percent = b.limit > 0 ? Math.round((actual / b.limit) * 100) : 0;
    
    let barColor = 'bg-emerald-500';
    let statusClass = 'text-emerald-600';
    
    if (percent >= 100) {
      barColor = 'bg-rose-500 animate-pulse';
      statusClass = 'text-rose-600';
    } else if (percent >= 80) {
      barColor = 'bg-amber-500';
      statusClass = 'text-amber-600';
    }

    return {
      group: b.group,
      limit: b.limit,
      actual,
      percent,
      barColor,
      statusClass
    };
  });
});
</script>
