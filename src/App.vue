<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 pb-24">
    <!-- Navbar -->
    <nav class="bg-indigo-700 text-white shadow-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🏠</span>
        <h1 class="text-xl font-bold tracking-wide">家庭財務多月份交叉比對分析系統</h1>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="showBudgetSettings = !showBudgetSettings"
          class="bg-indigo-600 hover:bg-indigo-800 text-white text-xs px-3.5 py-2 rounded-xl transition font-semibold"
        >
          ⚙️ 預算、帳戶與 CSV 匯入
        </button>
        <span class="bg-indigo-900 text-[10px] px-2.5 py-1 rounded-full font-mono">
          V3.3 精確記帳版
        </span>
      </div>
    </nav>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Settings Panel (Toggable) -->
      <div v-if="showBudgetSettings" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 class="font-bold text-slate-800 text-base">⚙️ 系統設定面板</h3>
          <button @click="showBudgetSettings = false" class="text-slate-400 hover:text-slate-600 text-sm">✕ 關閉</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Adjust Bank & CC Balances -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">🏦 調整活存餘額 & 信用卡期初負債</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
              <div v-for="acc in accounts.filter(a => a.type === 'bank')" :key="acc.id" class="flex items-center gap-2">
                <span class="text-xs text-slate-600 w-24">{{ acc.name }} 存款</span>
                <input 
                  v-model.number="acc.balance" 
                  type="number"
                  class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  @change="saveToStorage"
                />
              </div>
              <div class="border-t border-slate-100 my-2 pt-2"></div>
              <div v-for="card in accounts.filter(a => a.type === 'cc')" :key="card.id" class="bg-slate-50 p-2 rounded-xl border border-slate-100/50 space-y-1">
                <div class="text-[10px] font-bold text-slate-700">{{ card.name }} 設定</div>
                <div class="grid grid-cols-3 gap-1">
                  <div>
                    <span class="text-[8px] text-slate-450 block">信用額度</span>
                    <input 
                      v-model.number="card.limit" 
                      type="number"
                      class="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-semibold"
                      @change="saveToStorage"
                    />
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-450 block">未結餘額</span>
                    <input 
                      v-model.number="card.initialDebt" 
                      type="number"
                      class="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-semibold"
                      @change="saveToStorage"
                    />
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-450 block">本期帳單</span>
                    <input 
                      v-model.number="card.statementBill" 
                      type="number"
                      placeholder="手動輸入"
                      class="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-semibold focus:border-indigo-500"
                      @change="saveToStorage"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Adjust Budgets & Categories -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">🎯 類別群組與預算上限</h4>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div v-for="(b, idx) in budgets" :key="b.group" class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <span class="text-xs text-slate-700 font-bold w-20 truncate" :title="b.group">{{ b.group }}</span>
                <input 
                  v-model.number="b.limit" 
                  type="number"
                  placeholder="限額"
                  class="flex-1 px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  @change="saveToStorage"
                />
                <button 
                  @click="deleteCategoryGroup(idx)"
                  class="text-rose-500 hover:text-rose-700 text-xs px-1"
                  title="刪除此群組"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <!-- Add New Group Form -->
            <div class="border-t border-slate-100 pt-3 space-y-2">
              <div class="text-[10px] font-bold text-slate-400">➕ 新增自訂類別群組</div>
              <div class="flex gap-1.5">
                <input 
                  v-model="newGroupName"
                  type="text"
                  placeholder="群組名 (例: 機車)"
                  class="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
                <button 
                  @click="addCategoryGroup"
                  class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                >
                  新增
                </button>
              </div>
            </div>
          </div>

          <!-- CSV Paste Box & Clean Slate -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">📋 匯入 CSV 歷史數據</h4>
            <textarea 
              v-model="rawCSVInput"
              rows="2" 
              placeholder='"類型","日期","標題","金額","類別群組名稱","類別","帳戶"...'
              class="w-full p-2 border border-slate-200 rounded-xl text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
            <div class="flex gap-2">
              <button 
                @click="importCSV"
                class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
              >
                📥 覆蓋匯入 CSV
              </button>
              <button 
                @click="resetToDefault"
                class="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition"
              >
                載入預設範例
              </button>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <button 
                @click="clearAllData"
                class="w-full py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
              >
                🗑️ 清空所有數據 (全新登記)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Core Formula Overview (解決數目混亂的痛點) -->
      <div class="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">💰</span>
            <h3 class="font-bold text-slate-100 text-base">
              家庭真實資金對帳公式 <span class="text-xs text-indigo-300 font-normal">({{ monthA || '未選月份' }} 基準)</span>
            </h3>
          </div>
          <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">數據已鎖定當月</span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">🏦 銀行與錢包活存總計 (手上現有現金)</span>
            <span class="text-xl font-bold font-mono text-emerald-400">NT$ {{ totalBankSavings.toLocaleString() }}</span>
          </div>
          
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">💳 信用卡未結總負債 (您借來的卡債)</span>
            <span class="text-xl font-bold font-mono text-amber-400">NT$ -{{ totalCCDebt.toLocaleString() }}</span>
          </div>

          <div class="bg-indigo-650 p-4 rounded-xl border border-indigo-500">
            <span class="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block">💎 目前家庭真實淨可用資產 (活存減卡債)</span>
            <span 
              class="text-xl font-bold font-mono"
              :class="(totalBankSavings - totalCCDebt) < 0 ? 'text-rose-400' : 'text-white'"
            >
              NT$ {{ (totalBankSavings - totalCCDebt).toLocaleString() }}
            </span>
          </div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          💡 <strong>為什麼數字覺得混亂？</strong> 因為刷信用卡是「向未來借錢」，雖然銀行帳戶還有存款，但其實有很多早已預扣給信用卡。
          上方公式將<strong>「實體存款」扣除「當月已累積卡債」</strong>，算出您<strong>「目前真正可以花用的資產」</strong>。如果這項淨資產呈現負數，表示存款不夠支付卡費，家庭已經處於透支警報中！
        </p>
      </div>

      <!-- Tab Selection -->
      <div class="flex border-b border-slate-200">
        <button 
          @click="activeTab = 'compare'"
          class="px-6 py-3 font-bold text-sm border-b-2 transition-all"
          :class="activeTab === 'compare' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'"
        >
          ⚖️ 歷史與雙月交叉比對
        </button>
        <button 
          @click="activeTab = 'monthly'"
          class="px-6 py-3 font-bold text-sm border-b-2 transition-all"
          :class="activeTab === 'monthly' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'"
        >
          📅 單月收支明細與預算
        </button>
      </div>

      <!-- TAB 1: Monthly Detail & Budget -->
      <div v-if="activeTab === 'monthly'" class="space-y-8">
        
        <!-- Month Selector for Monthly View -->
        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <span class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            📅 當前正在檢視與記帳的月份：
            <span class="text-indigo-600 text-base font-black">[{{ monthA || '未選' }}]</span>
          </span>
          <select 
            v-model="monthA" 
            class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-indigo-700 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-48 cursor-pointer"
          >
            <option v-for="m in uniqueMonths" :key="m" :value="m">{{ m }}</option>
            <option v-if="!uniqueMonths.length" value="">尚未建立資料</option>
          </select>
        </div>

        <!-- Top Monthly Metrics Grid (資料已鎖定為當月) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">{{ monthA }} 實收收入</p>
            <p class="text-2xl font-bold text-emerald-600 mt-2 font-mono">$ {{ totalIncome.toLocaleString() }}</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">{{ monthA }} 已記支出</p>
            <p class="text-2xl font-bold text-rose-500 mt-2 font-mono">$ {{ totalExpense.toLocaleString() }}</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">{{ monthA }} 淨結餘 (儲蓄)</p>
            <p class="text-2xl font-bold mt-2 font-mono" :class="netBalance < 0 ? 'text-rose-600' : 'text-emerald-600'">
              $ {{ netBalance.toLocaleString() }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">{{ monthA }} 累積卡費</p>
            <p class="text-2xl font-bold text-amber-600 mt-2 font-mono">$ {{ totalCCDebt.toLocaleString() }}</p>
          </div>
        </div>

        <DiagnosticCard 
          :transactions="transactionsForActiveMonth" 
          :accounts="accounts" 
          :budgets="budgets" 
          @open-budget-modal="showBudgetSettings = true"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <AccountSummary :accounts="accounts" :transactions="transactions" :active-month="monthA" />
          </div>
          <div>
            <BudgetProgress :budgets="budgets" :transactions="transactionsForActiveMonth" />
          </div>
        </div>

        <!-- Transaction List table (已鎖定為當月明細) -->
        <TransactionList 
          :transactions="transactionsForActiveMonth" 
          @delete="deleteTransaction" 
          @edit="openEditModal"
        />
      </div>

      <!-- TAB 2: Cross-Month Comparison -->
      <div v-else-if="activeTab === 'compare'" class="space-y-8">
        <!-- Select Month Row -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📊 選擇分析主月份 (A 月)</label>
            <select v-model="monthA" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500">
              <option v-for="m in uniqueMonths" :key="m" :value="m">{{ m }}</option>
              <option v-if="!uniqueMonths.length" value="">尚未建立資料</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">🔍 選擇對比基準月 (B 月)</label>
            <select v-model="monthB" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500">
              <option v-for="m in uniqueMonths" :key="m" :value="m">{{ m }}</option>
              <option v-if="!uniqueMonths.length" value="">尚未建立資料</option>
            </select>
          </div>
          <div class="pt-6">
            <button @click="renderAllCharts" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm px-5 py-3 transition shadow-md shadow-indigo-100">
              🔄 重新渲染交叉比對圖表
            </button>
          </div>
        </div>

        <!-- Cross Comparison Indicators -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Income compare card -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">總收入對比 (A月 vs B月)</p>
            <p class="text-2xl font-bold text-emerald-600 mt-2 font-mono">
              $ {{ compA.income.toLocaleString() }}
              <span class="text-xs text-slate-400 font-normal">vs $ {{ compB.income.toLocaleString() }}</span>
            </p>
            <div class="text-xs mt-1.5 font-semibold" :class="incomeDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'">
              {{ incomeDiff >= 0 ? '📈 比對基準月增加' : '📉 比對基準月減少' }} $ {{ Math.abs(incomeDiff).toLocaleString() }}
            </div>
          </div>

          <!-- Expense compare card -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">總支出對比 (A月 vs B月)</p>
            <p class="text-2xl font-bold text-rose-500 mt-2 font-mono">
              $ {{ compA.expense.toLocaleString() }}
              <span class="text-xs text-slate-400 font-normal">vs $ {{ compB.expense.toLocaleString() }}</span>
            </p>
            <div class="text-xs mt-1.5 font-semibold" :class="expenseDiff <= 0 ? 'text-emerald-600' : 'text-rose-500'">
              {{ expenseDiff >= 0 ? '📈 比對基準月增加' : '📉 比對基準月減少' }} $ {{ Math.abs(expenseDiff).toLocaleString() }}
            </div>
          </div>

          <!-- Savings compare card -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">淨結餘增減 (赤字抓漏)</p>
            <p class="text-2xl font-bold mt-2 font-mono" :class="compA.balance < 0 ? 'text-rose-600' : 'text-emerald-600'">
              $ {{ compA.balance.toLocaleString() }}
              <span class="text-xs text-slate-400 font-normal">vs $ {{ compB.balance.toLocaleString() }}</span>
            </p>
            <div class="text-xs mt-1.5 font-semibold" :class="balanceDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'">
              {{ balanceDiff >= 0 ? '📈 比對基準月增加' : '📉 比對基準月減少' }} $ {{ Math.abs(balanceDiff).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Cross Comparison Diagnostics -->
        <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🕵️‍♂️</span>
            <h3 class="text-lg font-bold text-blue-900">兩月份透支因子交叉比對報告</h3>
          </div>
          <div class="text-blue-950 text-sm leading-relaxed space-y-2">
            <p><strong>1. 跨月同步對比現況：</strong> 您正在拿主分析月 <span class="font-bold text-indigo-700">[{{ monthA || '未選' }}]</span> 與基準歷史月 <span class="font-bold text-slate-600">[{{ monthB || '未選' }}]</span> 進行深度交叉診斷。</p>
            <p>
              <strong>2. 儲蓄能力與赤字擴大因子：</strong> 
              [{{ monthA || '未選' }}] 的結餘為 <span class="font-bold" :class="compA.balance >= 0 ? 'text-emerald-700' : 'text-rose-600'">$ {{ compA.balance.toLocaleString() }}</span>，
              而 [{{ monthB || '未選' }}] 為 <span class="font-bold" :class="compB.balance >= 0 ? 'text-emerald-700' : 'text-rose-600'">$ {{ compB.balance.toLocaleString() }}</span>。
              兩者相較，您的家庭淨儲蓄水位產生了 
              <span class="font-bold" :class="balanceDiff >= 0 ? 'text-emerald-700' : 'text-rose-600'">$ {{ balanceDiff.toLocaleString() }}</span> 的變動。
            </p>
            <p>
              <strong>3. 揪出變動的核心魔鬼：</strong> 檢視大類別可以發現，[{{ monthA || '未選' }}] 月份的 <strong>【娛樂】</strong> 群組開銷為 $ {{ (compA.groups["娛樂"] || 0).toLocaleString() }}，
              而在 [{{ monthB || '未選' }}] 月份則為 $ {{ (compB.groups["娛樂"] || 0).toLocaleString() }}。
              娛樂消費{{ (compA.groups["娛樂"] || 0) - (compB.groups["娛樂"] || 0) >= 0 ? '增加了' : '減少了' }} 
              <span class="font-bold" :class="(compA.groups['娛樂'] || 0) - (compB.groups['娛樂'] || 0) >= 0 ? 'text-rose-600' : 'text-emerald-600'">
                $ {{ Math.abs((compA.groups["娛樂"] || 0) - (compB.groups["娛樂"] || 0)).toLocaleString() }}
              </span>！
              這非常具體地向老婆說明了：扣除固定支出後，當月花過頭甚至透支，正是因為這些非剛性的娛樂/卡費開銷在不同月份之間的波動造成的。
            </p>
          </div>
        </div>

        <!-- Charts Grid for Comparison -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Side-by-side bar chart -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-slate-800 text-base mb-4">⚖️ 兩月份消費大類並排對比 (大項抓漏)</h3>
            <div class="relative h-80">
              <canvas ref="compareBarCanvas"></canvas>
            </div>
          </div>

          <!-- Month A Waterfall Chart -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-slate-800 text-base mb-4">📊 當前主分析月 ({{ monthA || '未選' }}月) 資金流向瀑布圖</h3>
            <div class="relative h-80">
              <canvas ref="waterfallCanvasA"></canvas>
            </div>
          </div>
        </div>

        <!-- Month A credit cards share -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="font-bold text-slate-800 text-base mb-4">💳 4張信用卡與支付工具在 {{ monthA || '未選' }} 月的使用權重對比</h3>
          <div class="relative h-64">
            <canvas ref="ccCanvasA"></canvas>
          </div>
        </div>
      </div>

    </main>

    <!-- Floating Action Button for quick add -->
    <div class="fixed bottom-6 right-6 z-40" v-if="activeTab === 'monthly'">
      <button 
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white font-bold w-14 h-14 rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center text-2xl transition-all"
        title="一鍵快速記帳"
      >
        ✍️
      </button>
    </div>

    <!-- Quick add/edit modal popup -->
    <AddTransactionModal 
      :is-open="showAddModal" 
      :accounts="accounts"
      :budgets="budgets"
      :all-transactions="transactions"
      :editing-transaction="selectedTransactionForEdit"
      @close="closeAddModal" 
      @add="addTransaction" 
      @add-multiple="addMultipleTransactions"
      @update="updateTransaction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

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

const activeTab = ref('compare');
const showAddModal = ref(false);
const showBudgetSettings = ref(false);

const selectedTransactionForEdit = ref(null);
const rawCSVInput = ref('');
const newGroupName = ref('');

const addCategoryGroup = () => {
  const name = newGroupName.value.trim();
  if (!name) return;
  if (budgets.value.some(b => b.group === name)) {
    alert("該類別群組已存在！");
    return;
  }
  budgets.value.push({ group: name, limit: 10000 });
  saveToStorage();
  newGroupName.value = '';
};

const deleteCategoryGroup = (index) => {
  if (confirm(`確定要刪除「${budgets.value[index].group}」類別群組嗎？(此群組的舊交易仍會被保留，但不會再列入預算上限統計)`)) {
    budgets.value.splice(index, 1);
    saveToStorage();
  }
};

// Month selector values
const monthA = ref('');
const monthB = ref('');

// Canvas references
const compareBarCanvas = ref(null);
const waterfallCanvasA = ref(null);
const ccCanvasA = ref(null);

// Chart instances
let compareBarChartInstance = null;
let waterfallChartInstanceA = null;
let ccChartInstanceA = null;

// Initialize data
const loadData = () => {
  transactions.value = getTransactions();
  
  const loadedAccounts = getAccounts();
  const DEFAULT_ACCOUNTS = [
    { id: 'c1', name: "國泰CUBE", type: "cc", limit: 150000, initialDebt: 68658, statementBill: 47736, billingDay: 21, dueDay: 5, dueNextMonth: true },
    { id: 'c2', name: "台新銀行", type: "cc", limit: 120000, initialDebt: 8580, statementBill: 7151, billingDay: 7, dueDay: 22, dueNextMonth: false },
    { id: 'c3', name: "聯邦銀行", type: "cc", limit: 100000, initialDebt: 1908, statementBill: 4251, billingDay: 9, dueDay: 24, dueNextMonth: false },
    { id: 'c4', name: "星展銀行", type: "cc", limit: 80000, initialDebt: 2544, statementBill: 2844, billingDay: 14, dueDay: 2, dueNextMonth: true }
  ];
  
  accounts.value = loadedAccounts.map(la => {
    if (la.type === 'bank') return la;
    const def = DEFAULT_ACCOUNTS.find(da => da.name === la.name);
    if (def) {
      return {
        ...def,
        balance: la.balance !== undefined ? la.balance : def.balance,
        limit: la.limit !== undefined ? la.limit : def.limit,
        initialDebt: la.initialDebt !== undefined ? la.initialDebt : (def.initialDebt || 0),
        statementBill: la.statementBill !== undefined ? la.statementBill : (def.statementBill || 0)
      };
    }
    return la;
  });

  budgets.value = getBudgets();

  // Make sure each credit card has initialDebt property
  accounts.value.forEach(a => {
    if (a.type === 'cc' && a.initialDebt === undefined) {
      a.initialDebt = 0;
    }
  });

  // Populate month selectors
  const months = uniqueMonths.value;
  if (months.length > 0) {
    monthA.value = months[0];
    if (months.length > 1) {
      monthB.value = months[1];
    } else {
      monthB.value = months[0];
    }
  }
};

const saveToStorage = () => {
  saveTransactions(transactions.value);
  saveAccounts(accounts.value);
  saveBudgets(budgets.value);
};

const resetToDefault = () => {
  if (confirm("確定要重設所有資料為範例資料嗎？這將會清除您匯入的所有紀錄。")) {
    localStorage.clear();
    loadData();
    renderAllCharts();
  }
};

const clearAllData = () => {
  if (confirm("⚠️ 注意！這會將所有記帳交易明細清空，並重設帳戶活存與卡費。確定要全新登記嗎？")) {
    transactions.value = [];
    accounts.value = [
      { id: 'a1', name: "彰化銀行", type: "bank", balance: 0 },
      { id: 'a2', name: "國泰Bank", type: "bank", balance: 0 },
      { id: 'a3', name: "中國信託", type: "bank", balance: 0 },
      { id: 'a4', name: "錢包", type: "bank", balance: 0 },
      { id: 'c1', name: "國泰CUBE", type: "cc", limit: 150000, initialDebt: 0, statementBill: 0, billingDay: 21, dueDay: 5, dueNextMonth: true },
      { id: 'c2', name: "台新銀行", type: "cc", limit: 120000, initialDebt: 0, statementBill: 0, billingDay: 7, dueDay: 22, dueNextMonth: false },
      { id: 'c3', name: "聯邦銀行", type: "cc", limit: 100000, initialDebt: 0, statementBill: 0, billingDay: 9, dueDay: 24, dueNextMonth: false },
      { id: 'c4', name: "星展銀行", type: "cc", limit: 80000, initialDebt: 0, statementBill: 0, billingDay: 14, dueDay: 2, dueNextMonth: true }
    ];
    budgets.value = [
      { group: "固定支出", limit: 30000 },
      { group: "家庭", limit: 10000 },
      { group: "娛樂", limit: 5000 }
    ];
    monthA.value = '';
    monthB.value = '';
    saveToStorage();
    renderAllCharts();
    alert("已清空數據，您可以點選右下角 ✍️ 開始全新登記，或到設定中輸入期初餘額與負債。");
  }
};

// CSV parsing & import logic
const importCSV = () => {
  const text = rawCSVInput.value.trim();
  if (!text) {
    alert("請先將 CSV 內容貼到輸入框中！");
    return;
  }

  Papa.parse(text, {
    header: true,
    skipEmptyLines: 'greedy',
    complete: (results) => {
      if (!results.data || results.data.length === 0) {
        alert("匯入失敗：偵測不到任何資料列！請確保您貼上的內容除了第一列標題之外，還包含了下方的交易資料。");
        return;
      }

      // Normalize keys by removing quotes, BOM and trimming
      const normalizeKey = (key) => key.replace(/['"\ufeff]+/g, '').trim();
      const firstRow = results.data[0];
      const normalizedKeys = Object.keys(firstRow).map(normalizeKey);
      
      const requiredKeys = ['類型', '日期', '金額'];
      const missingKeys = requiredKeys.filter(k => !normalizedKeys.includes(k));
      
      if (missingKeys.length > 0) {
        alert(`匯入失敗：找不到必要的欄位：${missingKeys.join('、')}。\n\n目前偵測到的欄位有：${normalizedKeys.join(', ')}\n\n請確保您複製貼上時，第一列為欄位標題，且包含「類型」、「日期」、「金額」等欄位。`);
        return;
      }

      const parsed = results.data.map((row, idx) => {
        // Clean up row keys and values
        const cleanRow = {};
        Object.entries(row).forEach(([k, v]) => {
          cleanRow[normalizeKey(k)] = v ? String(v).replace(/['"]+/g, '').trim() : '';
        });

        const title = cleanRow['標題'] || '未命名';
        // Skip card credit limit setup or initial adjustment rows exported by app
        if (
          title.includes('額度') || 
          title.includes('信用') || 
          title.includes('授信') || 
          title.includes('期初') || 
          title.includes('開戶') || 
          title.includes('調整') || 
          title.includes('原始金額')
        ) {
          return null;
        }

        let type = cleanRow['類型'] || '支出';
        const rawDate = cleanRow['日期'] || new Date().toISOString().substring(0, 10);
        
        // Convert "115/6/29" or "2026/6/29" to "2026-06-29"
        let date = rawDate.split(' ')[0].replace(/\//g, '-');
        const parts = date.split('-');
        if (parts.length === 3) {
          let y = parseInt(parts[0]);
          if (y < 1000) {
            y = y + 1911;
          }
          const m = parts[1].padStart(2, '0');
          const d = parts[2].padStart(2, '0');
          date = `${y}-${m}-${d}`;
        }
        
        let amount = parseFloat(cleanRow['金額'] || 0);

        // CRITICAL FIX: Standardize types and signs to prevent CSV inconsistencies from creating "+7,408" expenses
        if (amount < 0) {
          // If the CSV explicitly records a negative number, it must be an expense outflow (支出)
          type = '支出';
          amount = -Math.abs(amount);
        } else {
          // If it is positive, align it with the declared type
          if (type === '支出') {
            amount = -Math.abs(amount);
          } else {
            type = '收入';
            amount = Math.abs(amount);
          }
        }
        const group = cleanRow['類別群組名稱'] || '未分類';
        const category = cleanRow['類別'] || '其他';
        const account = cleanRow['帳戶'] || '現金';
        const remark = cleanRow['備註'] || '';

        return {
          id: `csv-${Date.now()}-${idx}`,
          type,
          date,
          title,
          amount,
          group,
          category,
          account,
          remark
        };
      }).filter(item => item !== null && (item.title !== '未命名' || item.amount !== 0));

      if (parsed.length > 0) {
        transactions.value = parsed;
        saveToStorage();
        alert(`成功匯入 ${parsed.length} 筆歷史交易紀錄！`);
        
        const months = uniqueMonths.value;
        if (months.length > 0) {
          monthA.value = months[0];
          monthB.value = months[1] || months[0];
        }

        renderAllCharts();
        rawCSVInput.value = '';
        showBudgetSettings.value = false;
      } else {
        alert('匯入失敗：沒有解析出有效的交易資料。');
      }
    }
  });
};

// Calculations
const uniqueMonths = computed(() => {
  const months = transactions.value.map(t => t.date.substring(0, 7));
  return [...new Set(months)].sort().reverse();
});

// Scope main monthly numbers to monthA (Active Month)
const totalIncome = computed(() => {
  if (!monthA.value) return 0;
  return transactions.value
    .filter(t => t.type === '收入' && t.date.startsWith(monthA.value))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
});

const totalExpense = computed(() => {
  if (!monthA.value) return 0;
  return transactions.value
    .filter(t => t.type === '支出' && t.date.startsWith(monthA.value))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
});

const netBalance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

const getBankAccountBalance = (accName) => {
  const acc = accounts.value.find(a => a.name === accName);
  return acc ? (acc.balance || 0) : 0;
};

const getCardDebt = (cardName) => {
  const card = accounts.value.find(c => c.name === cardName);
  return card ? Math.abs(card.initialDebt || 0) : 0;
};

const totalCCDebt = computed(() => {
  return accounts.value
    .filter(a => a.type === 'cc')
    .reduce((sum, card) => sum + getCardDebt(card.name), 0);
});

const totalBankSavings = computed(() => {
  return accounts.value
    .filter(a => a.type === 'bank')
    .reduce((sum, acc) => sum + getBankAccountBalance(acc.name), 0);
});

// Reactive Month-scoped list of transactions
const transactionsForActiveMonth = computed(() => {
  if (!monthA.value) return [];
  return transactions.value.filter(t => t.date.startsWith(monthA.value));
});

// Compare Calculations (A vs B)
const compA = computed(() => getMonthlyMetrics(monthA.value));
const compB = computed(() => getMonthlyMetrics(monthB.value));

const incomeDiff = computed(() => compA.value.income - compB.value.income);
const expenseDiff = computed(() => compA.value.expense - compB.value.expense);
const balanceDiff = computed(() => compA.value.balance - compB.value.balance);

const getMonthlyMetrics = (month) => {
  const defaultMetrics = { income: 0, expense: 0, balance: 0, groups: {}, accounts: {} };
  if (!month) return defaultMetrics;

  const filtered = transactions.value.filter(t => t.date.startsWith(month));
  const metrics = { income: 0, expense: 0, balance: 0, groups: {}, accounts: {} };

  filtered.forEach(t => {
    if (t.type === '收入') {
      metrics.income += Math.abs(t.amount);
    } else {
      const absVal = Math.abs(t.amount);
      metrics.expense += absVal;

      if (!metrics.groups[t.group]) metrics.groups[t.group] = 0;
      metrics.groups[t.group] += absVal;

      if (!metrics.accounts[t.account]) metrics.accounts[t.account] = 0;
      metrics.accounts[t.account] += absVal;
    }
  });

  // Include credit card initial debts in comparison Month metrics for accounts
  accounts.value.forEach(a => {
    if (a.type === 'cc') {
      const initial = a.initialDebt || 0;
      if (initial > 0) {
        if (!metrics.accounts[a.name]) metrics.accounts[a.name] = 0;
        metrics.accounts[a.name] += initial;
      }
    }
  });

  metrics.balance = metrics.income - metrics.expense;
  return metrics;
};

// Mutators
const openAddModal = () => {
  selectedTransactionForEdit.value = null;
  showAddModal.value = true;
};

const openEditModal = (tx) => {
  selectedTransactionForEdit.value = tx;
  showAddModal.value = true;
};

const closeAddModal = () => {
  selectedTransactionForEdit.value = null;
  showAddModal.value = false;
};

const ensureBudgetGroupExists = (group, type) => {
  if (type === '支出' && group && !budgets.value.some(b => b.group === group)) {
    budgets.value.push({ group, limit: 10000 });
  }
};

const addTransaction = (t) => {
  ensureBudgetGroupExists(t.group, t.type);
  transactions.value.unshift(t);
  saveToStorage();
  closeAddModal();
  renderAllCharts();
};

const addMultipleTransactions = (list) => {
  list.forEach(t => ensureBudgetGroupExists(t.group, t.type));
  transactions.value = [...list, ...transactions.value];
  saveToStorage();
  closeAddModal();
  renderAllCharts();
};

const updateTransaction = (updatedTx) => {
  ensureBudgetGroupExists(updatedTx.group, updatedTx.type);
  const idx = transactions.value.findIndex(t => t.id === updatedTx.id);
  if (idx !== -1) {
    transactions.value[idx] = updatedTx;
    saveToStorage();
  }
  closeAddModal();
  renderAllCharts();
};

const deleteTransaction = (id) => {
  transactions.value = transactions.value.filter(t => t.id !== id);
  saveToStorage();
  renderAllCharts();
};

// Re-render charts when month selectors change
watch([monthA, monthB, activeTab], () => {
  if (activeTab.value === 'compare') {
    renderAllCharts();
  }
});

// Chart renders
const renderAllCharts = () => {
  if (activeTab.value === 'compare') {
    setTimeout(() => {
      renderCompareBarChart();
      renderWaterfallChartA();
      renderCCChartA();
    }, 50);
  }
};

const renderCompareBarChart = () => {
  if (compareBarChartInstance) compareBarChartInstance.destroy();
  const ctx = compareBarCanvas.value?.getContext('2d');
  if (!ctx) return;

  const dA = compA.value;
  const dB = compB.value;

  const allGroups = Array.from(new Set([...Object.keys(dA.groups), ...Object.keys(dB.groups)]));
  const valsA = allGroups.map(g => dA.groups[g] || 0);
  const valsB = allGroups.map(g => dB.groups[g] || 0);

  compareBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: allGroups.length ? allGroups : ['尚未建立分類'],
      datasets: [
        { label: `${monthA.value || '主分析月'} (A)`, data: valsA, backgroundColor: 'rgba(79, 70, 229, 0.85)', borderRadius: 4 },
        { label: `${monthB.value || '對比基準月'} (B)`, data: valsB, backgroundColor: 'rgba(148, 163, 184, 0.5)', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: 'rgba(0,0,0,0.03)' } },
        x: { grid: { display: false } }
      }
    }
  });
};

const renderWaterfallChartA = () => {
  if (waterfallChartInstanceA) waterfallChartInstanceA.destroy();
  const ctx = waterfallCanvasA.value?.getContext('2d');
  if (!ctx) return;

  const dA = compA.value;
  let currentLevel = dA.income;
  const labels = ['總收入'];
  const dataWaterfall = [[0, dA.income]];
  const colors = ['rgba(16, 185, 129, 0.75)'];

  Object.keys(dA.groups).forEach(g => {
    labels.push(`扣: ${g}`);
    const cost = dA.groups[g];
    dataWaterfall.push([currentLevel - cost, currentLevel]);
    currentLevel -= cost;
    colors.push('rgba(244, 63, 94, 0.75)');
  });

  labels.push('月底結餘');
  dataWaterfall.push([0, dA.balance]);
  colors.push(dA.balance >= 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.9)');

  waterfallChartInstanceA = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: dataWaterfall, backgroundColor: colors, borderRadius: 6 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(0,0,0,0.03)' } },
        x: { grid: { display: false } }
      }
    }
  });
};

const renderCCChartA = () => {
  if (ccChartInstanceA) ccChartInstanceA.destroy();
  const ctx = ccCanvasA.value?.getContext('2d');
  if (!ctx) return;

  const dA = compA.value;
  const accountsList = Object.keys(dA.accounts);
  const vals = Object.values(dA.accounts);

  ccChartInstanceA = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: accountsList.length ? accountsList : ['無消費'],
      datasets: [{
        data: vals.length ? vals : [1],
        backgroundColor: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#9ca3af']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%'
    }
  });
};

onMounted(() => {
  loadData();
  renderAllCharts();
});
</script>
