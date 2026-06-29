<template>
  <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
    <div class="flex items-center space-x-2">
      <span class="text-xl">💡</span>
      <h3 class="text-lg font-bold text-amber-900">家庭財務健康診斷書（自動分析結果）</h3>
    </div>
    <div class="text-amber-950 text-sm leading-relaxed space-y-3" v-if="analysis">
      <div>
        <strong>1. 收支平衡狀態：</strong> 本月總固定實收新台幣 
        <span class="text-emerald-700 font-bold">$ {{ analysis.totalIncome.toLocaleString() }}</span>，
        但總開銷衝到了 
        <span class="text-rose-600 font-bold">$ {{ analysis.totalExpense.toLocaleString() }}</span>。
        財務淨結餘為 
        <span :class="analysis.netBalance < 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'">
          $ {{ analysis.netBalance.toLocaleString() }}
        </span>，
        呈現<strong class="text-rose-800">{{ analysis.netBalance < 0 ? '透支赤字' : '儲蓄盈餘' }}</strong>狀態。
      </div>

      <div>
        <strong>2. 揪出透支或固定開銷主因：</strong> 
        單筆固定開銷「{{ analysis.fixedCostName }} $ {{ analysis.fixedCostAmount.toLocaleString() }}」直接吃掉了總收入的 
        <strong>{{ analysis.fixedCostPercent }}%</strong>！
        這意味著家庭的可支配流動現金天生就{{ analysis.fixedCostPercent > 40 ? '極度緊繃' : '有一定裕度' }}，
        只要信用卡多刷幾筆大開銷，當月就{{ analysis.fixedCostPercent > 40 ? '必然會爆表透支' : '可能面臨超支' }}。
      </div>

      <div>
        <strong>3. 信用卡魔鬼細節分析：</strong> 
        4張信用卡本月共刷了 <span class="text-amber-700 font-bold">$ {{ analysis.totalCCExpense.toLocaleString() }}</span>。
        其中以 <strong>「{{ analysis.highestCardName }}」</strong> 刷卡額最高（$ {{ analysis.highestCardAmount.toLocaleString() }}）。
        累積了如 {{ analysis.entertainmentViolations }} 等娛樂或日常支出，
        導致【{{ analysis.highestGroup }}】群組累積金額達 
        <span class="text-rose-600 font-bold">$ {{ analysis.highestGroupAmount.toLocaleString() }}</span>，
        成為壓垮當月現金流的關鍵。
      </div>

      <div class="pt-2 border-t border-amber-200/60 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <span>
          <strong>🛠️ 改善共識點：</strong> 
          建議下個月為 <span class="underline font-semibold">{{ analysis.highestCardName }}</span> 鎖定一個最高預算上限，只要累積刷卡達 $5,000 即啟動預警！
        </span>
        <button 
          v-if="analysis.netBalance < 0" 
          class="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-amber-700 transition"
          @click="$emit('open-budget-modal')"
        >
          調整預算設定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  accounts: {
    type: Array,
    required: true
  },
  budgets: {
    type: Array,
    required: true
  }
});

const analysis = computed(() => {
  if (!props.transactions.length) return null;

  let totalIncome = 0;
  let totalExpense = 0;
  let ccExpenses = {};
  let groupExpenses = {};
  
  // Initialize cc list
  props.accounts.forEach(a => {
    if (a.type === 'cc') {
      ccExpenses[a.name] = 0;
    }
  });

  props.transactions.forEach(t => {
    if (t.type === '收入') {
      totalIncome += t.amount;
    } else if (t.type === '支出') {
      const absVal = Math.abs(t.amount);
      totalExpense += absVal;
      
      if (ccExpenses[t.account] !== undefined) {
        ccExpenses[t.account] += absVal;
      }
      
      if (!groupExpenses[t.group]) groupExpenses[t.group] = 0;
      groupExpenses[t.group] += absVal;
    }
  });

  const netBalance = totalIncome - totalExpense;
  const totalCCExpense = Object.values(ccExpenses).reduce((a, b) => a + b, 0);

  // Find fixed cost (typically "房租" or group "固定支出")
  const fixedCostAmount = groupExpenses["固定支出"] || 0;
  const fixedCostName = "固定支出(房租等)";
  const fixedCostPercent = totalIncome > 0 ? Math.round((fixedCostAmount / totalIncome) * 100) : 0;

  // Find highest cc card spending
  let highestCardName = '無';
  let highestCardAmount = 0;
  Object.entries(ccExpenses).forEach(([name, amt]) => {
    if (amt > highestCardAmount) {
      highestCardAmount = amt;
      highestCardName = name;
    }
  });

  // Find highest spending group (excluding Fixed Expenses if possible, or just the absolute highest)
  let highestGroup = '無';
  let highestGroupAmount = 0;
  Object.entries(groupExpenses).forEach(([name, amt]) => {
    if (amt > highestGroupAmount) {
      highestGroupAmount = amt;
      highestGroup = name;
    }
  });

  // Highlight specific items
  const entTx = props.transactions
    .filter(t => t.type === '支出' && t.group === '娛樂')
    .slice(0, 2)
    .map(t => `「${t.title} ($${Math.abs(t.amount)})」`)
    .join('、');

  const entertainmentViolations = entTx || "各類常態花費";

  return {
    totalIncome,
    totalExpense,
    netBalance,
    fixedCostName,
    fixedCostAmount,
    fixedCostPercent,
    totalCCExpense,
    highestCardName,
    highestCardAmount,
    highestGroup,
    highestGroupAmount,
    entertainmentViolations
  };
});
</script>
