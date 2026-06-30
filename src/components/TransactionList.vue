<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <!-- Header with Filters -->
    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
        📋 本月交易明細流水帳
      </h3>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <select 
          v-model="filterType"
          class="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">所有類型</option>
          <option value="收入">僅收入</option>
          <option value="支出">僅支出</option>
        </select>
        <select 
          v-model="filterGroup"
          class="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">所有類別</option>
          <option v-for="g in uniqueGroups" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
            <th class="p-4">類型</th>
            <th class="p-4">日期</th>
            <th class="p-4">項目/說明</th>
            <th class="p-4">金額</th>
            <th class="p-4">類別</th>
            <th class="p-4">支付管道</th>
            <th class="p-4">備註/補充說明</th>
            <th class="p-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="8" class="p-8 text-center text-slate-400">
              無相符的交易紀錄
            </td>
          </tr>
          <tr 
            v-for="t in filteredTransactions" 
            :key="t.id"
            class="hover:bg-slate-50/50 transition-colors"
          >
            <td class="p-4">
              <span 
                class="px-2.5 py-1 text-xs font-semibold rounded-full"
                :class="t.type === '收入' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
              >
                {{ t.type }}
              </span>
            </td>
            <td class="p-4 text-slate-500 font-mono text-xs">{{ t.date }}</td>
            <td class="p-4 font-semibold text-slate-700">{{ t.title }}</td>
            <td 
              class="p-4 font-mono font-bold"
              :class="t.amount > 0 ? 'text-emerald-600' : 'text-slate-700'"
            >
              {{ t.amount > 0 ? '+' : '' }}{{ t.amount.toLocaleString() }}
            </td>
            <td class="p-4">
              <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200/40">
                {{ t.group }} / {{ t.category }}
              </span>
            </td>
            <td class="p-4 text-slate-500 font-medium text-xs">{{ t.account }}</td>
            <td class="p-4 text-slate-500 text-xs max-w-xs truncate" :title="t.remark">
              {{ t.remark || '—' }}
            </td>
            <td class="p-4 text-right flex justify-end gap-1">
              <button 
                @click="$emit('edit', t)"
                class="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-50 transition"
                title="修改這筆交易"
              >
                ✏️
              </button>
              <button 
                @click="$emit('delete', t.id)"
                class="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                title="刪除這筆交易"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  }
});

defineEmits(['delete', 'edit']);

const filterType = ref('all');
const filterGroup = ref('all');

const uniqueGroups = computed(() => {
  return [...new Set(props.transactions.map(t => t.group))];
});

const filteredTransactions = computed(() => {
  return props.transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(t => {
      const typeMatch = filterType.value === 'all' || t.type === filterType.value;
      const groupMatch = filterGroup.value === 'all' || t.group === filterGroup.value;
      return typeMatch && groupMatch;
    });
});
</script>
