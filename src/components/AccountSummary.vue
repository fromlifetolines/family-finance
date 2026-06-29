<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Bank Accounts -->
    <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
          🏦 銀行可用餘額
        </h3>
        <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold">
          總活存: NT$ {{ totalBankSavings.toLocaleString() }}
        </span>
      </div>
      <div class="space-y-3">
        <div 
          v-for="acc in bankAccounts" 
          :key="acc.id"
          class="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
        >
          <div>
            <p class="font-medium text-slate-700">{{ acc.name }}</p>
            <p class="text-xs text-slate-400">活期存款</p>
          </div>
          <span class="font-mono font-bold text-emerald-600">
            $ {{ acc.balance.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Credit Cards -->
    <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
          💳 信用卡未結款項
        </h3>
        <span class="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold">
          總卡費: NT$ {{ totalCCDebt.toLocaleString() }}
        </span>
      </div>
      <div class="space-y-3">
        <div 
          v-for="card in creditCards" 
          :key="card.id"
          class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
        >
          <div class="flex justify-between items-center mb-1">
            <div>
              <span class="font-medium text-slate-700">{{ card.name }}</span>
              <span v-if="card.initialDebt" class="text-[9px] text-slate-400 block">
                (含期初未結 $ {{ card.initialDebt.toLocaleString() }})
              </span>
            </div>
            <span class="font-mono text-sm font-semibold text-amber-600">
              $ {{ getCardDebt(card.name).toLocaleString() }}
            </span>
          </div>
          <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              class="h-full bg-amber-500 transition-all duration-500" 
              :style="{ width: `${Math.min(100, (getCardDebt(card.name) / card.limit) * 100)}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>額度 $ {{ card.limit.toLocaleString() }}</span>
            <span>可用 $ {{ (card.limit - getCardDebt(card.name)).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  accounts: {
    type: Array,
    required: true
  },
  transactions: {
    type: Array,
    required: true
  }
});

const bankAccounts = computed(() => props.accounts.filter(a => a.type === 'bank'));
const creditCards = computed(() => props.accounts.filter(a => a.type === 'cc'));

const totalBankSavings = computed(() => {
  return bankAccounts.value.reduce((sum, acc) => sum + acc.balance, 0);
});

const getCardDebt = (cardName) => {
  const card = creditCards.value.find(c => c.name === cardName);
  const initial = card ? (card.initialDebt || 0) : 0;
  
  const currentMonthTx = props.transactions
    .filter(t => t.type === '支出' && t.account === cardName)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  return initial + currentMonthTx;
};

const totalCCDebt = computed(() => {
  return creditCards.value.reduce((sum, card) => sum + getCardDebt(card.name), 0);
});
</script>
