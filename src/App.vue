<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 pb-24">
    <!-- Navbar -->
    <nav class="bg-indigo-600 text-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold tracking-wide flex items-center gap-2">
        🏠 家庭財務透視 Dashboard
      </h1>
      <div class="flex items-center gap-3">
        <button 
          @click="showBudgetSettings = !showBudgetSettings"
          class="bg-indigo-500 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-xl transition font-semibold"
        >
          ⚙️ 預算與帳戶設定
        </button>
        <span class="bg-indigo-700/80 text-[10px] px-2.5 py-1 rounded-full font-mono">
          V2.0 PWA 互動版
        </span>
      </div>
    </nav>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Quick settings section (Toggable) -->
      <div v-if="showBudgetSettings" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 class="font-bold text-slate-800 text-base">⚙️ 設定看板基礎數據</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Adjust Bank Balances -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">銀行活期存款餘額</h4>
            <div v-for="acc in accounts.filter(a => a.type === 'bank')" :key="acc.id" class="flex items-center gap-2">
              <span class="text-xs text-slate-600 w-24">{{ acc.name }}</span>
              <input 
                v-model.number="acc.balance" 
                type="number"
                class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                @change="saveToStorage"
              />
            </div>
          </div>

          <!-- Adjust Budgets -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">各類別預算上限</h4>
            <div v-for="b in budgets" :key="b.group" class="flex items-center gap-2">
              <span class="text-xs text-slate-600 w-24">{{ b.group }}</span>
              <input 
                v-model.number="b.limit" 
                type="number"
                class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                @change="saveToStorage"
              />
            </div>
          </div>

          <!-- Reset Default Data -->
          <div class="flex flex-col justify-end space-y-2">
            <p class="text-xs text-slate-400">
              * 修改資料會即時儲存至瀏覽器的 LocalStorage 中，您可以隨時點選右下角按鈕新增交易。
            </p>
            <button 
              @click="resetToDefault"
              class="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition"
            >
              ⚠️ 重設為範例初始資料
            </button>
          </div>
        </div>
      </div>

      <!-- Top Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
          <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">本月總實收收入</p>
          <p class="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            $ {{ totalIncome.toLocaleString() }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
          <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">本月已登記總支出</p>
          <p class="text-2xl font-bold text-rose-500 mt-2 font-mono">
            $ {{ totalExpense.toLocaleString() }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
          <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">當月淨結餘 (儲蓄)</p>
          <p 
            class="text-2xl font-bold mt-2 font-mono"
            :class="netBalance < 0 ? 'text-rose-600' : 'text-emerald-600'"
          >
            $ {{ netBalance.toLocaleString() }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
          <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">信用卡已消費總卡費</p>
          <p class="text-2xl font-bold text-amber-600 mt-2 font-mono">
            $ {{ totalCCDebt.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Health diagnostic text -->
      <DiagnosticCard 
        :transactions="transactions" 
        :accounts="accounts" 
        :budgets="budgets" 
        @open-budget-modal="showBudgetSettings = true"
      />

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Waterfall chart -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-800 text-base">📊 收支流向瀑布圖 (本月水位遞減)</h3>
            <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Chart.js 浮動條形圖</span>
          </div>
          <div class="relative h-72">
            <canvas ref="waterfallCanvas"></canvas>
          </div>
        </div>

        <!-- Doughnut chart -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-800 text-base">🍕 支出群組比例</h3>
            <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">大類別佔比</span>
          </div>
          <div class="relative h-72 flex justify-center">
            <canvas ref="doughnutCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Bank Savings vs CC liabilities wall -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-slate-800 text-base">💳 4張信用卡「已刷未結」負債牆 (與銀行可用現金對比)</h3>
          <span 
            v-if="totalCCDebt > totalBankSavings" 
            class="bg-rose-50 text-rose-600 text-xs px-2 py-1 rounded-md font-bold animate-pulse"
          >
            ⚠️ 警示：信用卡未結卡費已大於銀行可用現金！
          </span>
          <span 
            v-else
            class="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-md font-bold"
          >
            ✅ 現金流充裕：銀行存款足夠全額繳納卡費
          </span>
        </div>
        <div class="relative h-64">
          <canvas ref="ccCanvas"></canvas>
        </div>
      </div>

      <!-- Account summaries and budget progress bar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <AccountSummary :accounts="accounts" :transactions="transactions" />
        </div>
        <div>
          <BudgetProgress :budgets="budgets" :transactions="transactions" />
        </div>
      </div>

      <!-- Transaction List table -->
      <TransactionList 
        :transactions="transactions" 
        @delete="deleteTransaction" 
      />

    </main>

    <!-- Floating Action Button for quick add -->
    <div class="fixed bottom-6 right-6 z-40">
      <button 
        @click="showAddModal = true"
        class="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white font-bold w-14 h-14 rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center text-2xl transition-all"
        title="一鍵快速記帳"
      >
        ✍️
      </button>
    </div>

    <!-- Quick add modal popup -->
    <AddTransactionModal 
      :is-open="showAddModal" 
      :accounts="accounts"
      @close="showAddModal = false" 
      @add="addTransaction" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

// Import components
import AccountSummary from './components/AccountSummary.vue';
import BudgetProgress from './components/BudgetProgress.vue';
import DiagnosticCard from './components/DiagnosticCard.vue';
import AddTransactionModal from './components/AddTransactionModal.vue';
import TransactionList from './components/TransactionList.vue';

// Import DB operations
import { 
  getTransactions, 
  saveTransactions, 
  getAccounts, 
  saveAccounts, 
  getBudgets, 
  saveBudgets 
} from './utils/db';

// Reactives
const transactions = ref([]);
const accounts = ref([]);
const budgets = ref([]);

const showAddModal = ref(false);
const showBudgetSettings = ref(false);

// Canvas references
const waterfallCanvas = ref(null);
const doughnutCanvas = ref(null);
const ccCanvas = ref(null);

// Chart instances
let waterfallChartInstance = null;
let doughnutChartInstance = null;
let ccChartInstance = null;

// Initialize data
const loadData = () => {
  transactions.value = getTransactions();
  accounts.value = getAccounts();
  budgets.value = getBudgets();
};

const saveToStorage = () => {
  saveTransactions(transactions.value);
  saveAccounts(accounts.value);
  saveBudgets(budgets.value);
};

const resetToDefault = () => {
  if (confirm("確定要重設所有資料為範例資料嗎？這將會清除您新增的所有紀錄。")) {
    localStorage.clear();
    loadData();
    renderAllCharts();
  }
};

// Calculations
const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === '收入')
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === '支出')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
});

const netBalance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

const getCardDebt = (cardName) => {
  return transactions.value
    .filter(t => t.type === '支出' && t.account === cardName)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

const totalCCDebt = computed(() => {
  return accounts.value
    .filter(a => a.type === 'cc')
    .reduce((sum, card) => sum + getCardDebt(card.name), 0);
});

const totalBankSavings = computed(() => {
  return accounts.value
    .filter(a => a.type === 'bank')
    .reduce((sum, acc) => sum + acc.balance, 0);
});

// Mutators
const addTransaction = (t) => {
  transactions.value.unshift(t);
  saveToStorage();
  showAddModal.value = false;
  renderAllCharts();
};

const deleteTransaction = (id) => {
  transactions.value = transactions.value.filter(t => t.id !== id);
  saveToStorage();
  renderAllCharts();
};

// Chart rendering
const renderAllCharts = () => {
  renderWaterfall();
  renderDoughnut();
  renderCCChart();
};

const renderWaterfall = () => {
  if (waterfallChartInstance) waterfallChartInstance.destroy();

  const ctx = waterfallCanvas.value?.getContext('2d');
  if (!ctx) return;

  // Group costs
  const groupExpenses = {};
  transactions.value.forEach(t => {
    if (t.type === '支出') {
      const absVal = Math.abs(t.amount);
      if (!groupExpenses[t.group]) groupExpenses[t.group] = 0;
      groupExpenses[t.group] += absVal;
    }
  });

  const groups = Object.keys(groupExpenses);
  const dataPoints = [];
  const labels = ['總收入'];
  
  // Starting point
  dataPoints.push([0, totalIncome.value]);

  let currentLevel = totalIncome.value;
  groups.forEach(g => {
    labels.push(`扣: ${g}`);
    const cost = groupExpenses[g];
    dataPoints.push([currentLevel - cost, currentLevel]);
    currentLevel -= cost;
  });

  labels.push('月底結餘');
  dataPoints.push([0, netBalance.value]);

  // Generate colors
  const bgColors = [
    'rgba(16, 185, 129, 0.75)', // Green for income
  ];
  for (let i = 0; i < groups.length; i++) {
    bgColors.push('rgba(244, 63, 94, 0.75)'); // Red for expense steps
  }
  bgColors.push(netBalance.value >= 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.9)');

  waterfallChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '資金流向',
        data: dataPoints,
        backgroundColor: bgColors,
        borderWidth: 0,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const val = context.raw;
              if (Array.isArray(val)) {
                const diff = val[1] - val[0];
                return `額度: $ ${diff.toLocaleString()}`;
              }
              return `值: $ ${val.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(0,0,0,0.03)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
};

const renderDoughnut = () => {
  if (doughnutChartInstance) doughnutChartInstance.destroy();

  const ctx = doughnutCanvas.value?.getContext('2d');
  if (!ctx) return;

  const groupExpenses = {};
  transactions.value.forEach(t => {
    if (t.type === '支出') {
      const absVal = Math.abs(t.amount);
      if (!groupExpenses[t.group]) groupExpenses[t.group] = 0;
      groupExpenses[t.group] += absVal;
    }
  });

  const labels = Object.keys(groupExpenses);
  const data = Object.values(groupExpenses);

  if (!labels.length) {
    // Empty state fallback
    labels.push('無支出');
    data.push(1);
  }

  doughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          'rgba(244, 63, 94, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(59, 130, 246, 0.75)',
          'rgba(139, 92, 246, 0.75)',
          'rgba(236, 72, 153, 0.75)'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      },
      cutout: '65%'
    }
  });
};

const renderCCChart = () => {
  if (ccChartInstance) ccChartInstance.destroy();

  const ctx = ccCanvas.value?.getContext('2d');
  if (!ctx) return;

  const ccCards = accounts.value.filter(a => a.type === 'cc');
  const labels = ccCards.map(c => c.name);
  const data = ccCards.map(c => getCardDebt(c.name));

  // Add savings as final comparison
  labels.push('🏦 活存總可用額');
  data.push(totalBankSavings.value);

  const bgColors = ccCards.map(() => 'rgba(245, 158, 11, 0.7)');
  bgColors.push('rgba(16, 185, 129, 0.85)'); // Green for bank savings

  ccChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '金額',
        data,
        backgroundColor: bgColors,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          grid: { color: 'rgba(0,0,0,0.03)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
};

onMounted(() => {
  loadData();
  renderAllCharts();
});
</script>
