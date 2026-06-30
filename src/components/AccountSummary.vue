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
            <p class="text-[9px] text-slate-400">
              活期存款
            </p>
          </div>
          <span class="font-mono font-bold text-emerald-600">
            $ {{ getBankAccountBalance(acc.name).toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Credit Cards -->
    <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
          💳 信用卡應付帳單 & 繳款日
        </h3>
        <span class="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold">
          總負債: NT$ -{{ totalCCDebt.toLocaleString() }}
        </span>
      </div>
      <div class="space-y-4">
        <div 
          v-for="card in creditCards" 
          :key="card.id"
          class="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100/50 space-y-3"
        >
          <div class="flex justify-between items-start">
            <div>
              <span class="font-bold text-slate-700 text-sm block">{{ card.name }}</span>
              <span class="text-[10px] text-slate-400 font-medium">
                結帳日: 每月 {{ card.billingDay }} 號 ｜ 繳款日: {{ card.dueNextMonth ? '下月' : '當月' }} {{ card.dueDay }} 號
              </span>
            </div>
            <div class="text-right">
              <!-- Always display as negative to match phone bookkeeping apps -->
              <span class="font-mono text-sm font-bold text-rose-600 block">
                -NT$ {{ getCardDebt(card.name).toLocaleString() }}
              </span>
              <span class="text-[9px] text-slate-400 font-medium block">當前卡債餘額</span>
            </div>
          </div>

          <!-- Billing Info break down -->
          <div class="grid grid-cols-2 gap-2 text-xs bg-white/60 p-2.5 rounded-lg border border-slate-200/30">
            <div class="space-y-0.5">
              <span class="text-[9px] text-slate-400 uppercase tracking-wider block">本期帳單應繳</span>
              <span class="font-bold text-indigo-700 font-mono text-sm block">
                $ {{ getBillingInfo(card).statementAmount.toLocaleString() }}
              </span>
              <span class="text-[8px] text-slate-400 block">
                ({{ getBillingInfo(card).period }})
              </span>
            </div>
            <div class="space-y-0.5 text-right border-l border-slate-200 pl-2">
              <span class="text-[9px] text-slate-400 uppercase tracking-wider block">繳款截止日</span>
              <span class="font-bold text-rose-500 font-mono block">
                {{ getBillingInfo(card).dueDate }}
              </span>
              <span class="text-[9px] text-slate-500 block">
                未出帳: $ {{ getBillingInfo(card).unbilledAmount.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Card statement tx detail (Collapse) -->
          <div class="text-[10px] bg-slate-100/50 p-2 rounded-lg space-y-1">
            <div class="flex justify-between items-center text-slate-500 font-bold border-b border-slate-200 pb-1 mb-1">
              <span>📋 本期帳單計費明細 ({{ getBillingInfo(card).txCount }} 筆)</span>
              <span class="text-[9px]">總計 $ {{ getBillingInfo(card).statementAmount.toLocaleString() }}</span>
            </div>
            <div class="max-h-24 overflow-y-auto space-y-0.5 font-mono pr-1">
              <div v-for="t in getBillingInfo(card).txs" :key="t.id" class="flex justify-between text-slate-600 text-[9px]">
                <span class="truncate w-28">{{ t.date.substring(5) }} {{ t.title }}</span>
                <span :class="t.type === '支出' ? 'text-rose-500' : 'text-emerald-600'">
                  {{ t.type === '支出' ? '-' : '+' }}{{ Math.abs(t.amount) }}
                </span>
              </div>
              <div v-if="!getBillingInfo(card).txs.length" class="text-center text-slate-400 text-[9px] py-1">
                此期間無刷卡交易
              </div>
            </div>
          </div>

          <!-- Limit usage bar -->
          <div class="space-y-1">
            <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                class="h-full bg-amber-500 transition-all duration-500" 
                :style="{ width: `${Math.min(100, (getCardDebt(card.name) / card.limit) * 100)}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[9px] text-slate-400">
              <span>可用額度 $ {{ (card.limit - getCardDebt(card.name)).toLocaleString() }}</span>
              <span>總額度 $ {{ card.limit.toLocaleString() }}</span>
            </div>
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
  },
  activeMonth: {
    type: String,
    default: ''
  }
});

const bankAccounts = computed(() => props.accounts.filter(a => a.type === 'bank'));
const creditCards = computed(() => props.accounts.filter(a => a.type === 'cc'));

const getBankAccountBalance = (accName) => {
  const acc = bankAccounts.value.find(a => a.name === accName);
  return acc ? (acc.balance || 0) : 0;
};

const totalBankSavings = computed(() => {
  return bankAccounts.value.reduce((sum, acc) => sum + getBankAccountBalance(acc.name), 0);
});

// Force positive value representation of card debt for calculations
const getCardDebt = (cardName) => {
  const card = creditCards.value.find(c => c.name === cardName);
  return card ? Math.abs(card.initialDebt || 0) : 0;
};

const totalCCDebt = computed(() => {
  return creditCards.value.reduce((sum, card) => sum + getCardDebt(card.name), 0);
});

const getBillingInfo = (card) => {
  const fallback = { period: '—', dueDate: '—', statementAmount: 0, unbilledAmount: 0, txs: [], txCount: 0 };
  if (!card.billingDay) return fallback;

  const targetMonthStr = props.activeMonth || new Date().toISOString().substring(0, 7);
  const [yearStr, monthStr] = targetMonthStr.split('-');
  const year = parseInt(yearStr || new Date().getFullYear());
  const month = parseInt(monthStr || (new Date().getMonth() + 1));

  // Billing statement date: Year-Month-billingDay
  const billDate = new Date(year, month - 1, card.billingDay);
  
  // Start date: Previous month's billingDay + 1 day
  const startDate = new Date(year, month - 2, card.billingDay + 1);
  
  // Due Date:
  let dueYear = year;
  let dueMonth = month;
  if (card.dueNextMonth) {
    dueMonth += 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }
  }
  const dueDate = new Date(dueYear, dueMonth - 1, card.dueDay);

  const formatDateShort = (d) => {
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDateFull = (d) => {
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  // Find transactions falling strictly inside statement period: [startDate, billDate]
  // CRITICAL FIX: EXCLUDE '轉帳' (transfers/repayments) from bill statement, only count consumer spending and refunds
  const statementTxs = props.transactions
    .filter(t => {
      if (t.account !== card.name) return false;
      if (t.type !== '支出' && t.type !== '收入') return false;
      
      const tDate = new Date(t.date);
      tDate.setHours(0,0,0,0);
      
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      
      const end = new Date(billDate);
      end.setHours(23,59,59,999);
      
      return tDate >= start && tDate <= end;
    });

  // Calculate bill statement amount: Spending (adds) minus Refunds (reduces)
  const statementAmount = statementTxs.reduce((sum, t) => {
    if (t.type === '支出') {
      return sum + Math.abs(t.amount);
    } else {
      return sum - Math.abs(t.amount);
    }
  }, 0);

  // Sum transactions made strictly AFTER billDate
  const unbilledTxSum = props.transactions
    .filter(t => {
      if (t.type !== '支出' || t.account !== card.name) return false;
      const tDate = new Date(t.date);
      tDate.setHours(0,0,0,0);
      
      const endOfBill = new Date(billDate);
      endOfBill.setHours(23,59,59,999);
      
      return tDate > endOfBill;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    period: `${formatDateShort(startDate)} ~ ${formatDateShort(billDate)}`,
    dueDate: formatDateFull(dueDate),
    statementAmount: card.statementBill !== undefined && card.statementBill > 0 ? card.statementBill : statementAmount, 
    unbilledAmount: unbilledTxSum,
    txs: statementTxs,
    txCount: statementTxs.length
  };
};
</script>
