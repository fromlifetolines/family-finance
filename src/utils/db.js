// LocalStorage DB helper for family finance

const STORAGE_KEYS = {
  TRANSACTIONS: 'ff_transactions',
  ACCOUNTS: 'ff_accounts',
  BUDGETS: 'ff_budgets'
};

const DEFAULT_TRANSACTIONS = [
  // 2026-06
  { id: '1', type: "支出", date: "2026-06-29", title: "馬祖食堂", amount: -170, group: "娛樂", category: "午餐", account: "錢包" },
  { id: '2', type: "支出", date: "2026-06-29", title: "7-11", amount: -84, group: "娛樂", category: "早餐", account: "國泰CUBE" },
  { id: '3', type: "支出", date: "2026-06-28", title: "診所", amount: -270, group: "家庭", category: "醫療", account: "錢包" },
  { id: '4', type: "支出", date: "2026-06-28", title: "過牛義大利麵", amount: -1448, group: "娛樂", category: "午餐", account: "國泰CUBE" },
  { id: '5', type: "支出", date: "2026-06-27", title: "壽司郎", amount: -840, group: "娛樂", category: "晚餐", account: "國泰CUBE" },
  { id: '6', type: "支出", date: "2026-06-25", title: "房租固定開銷", amount: -30500, group: "固定支出", category: "房租", account: "彰化銀行" },
  { id: '7', type: "支出", date: "2026-06-20", title: "芽米寶貝(寶寶副食品)", amount: -3060, group: "家庭", category: "育兒購物", account: "台新銀行" },
  { id: '8', type: "支出", date: "2026-06-15", title: "Momo購物(夜用尿布/濕紙巾)", amount: -1250, group: "家庭", category: "育兒購物", account: "聯邦銀行" },
  { id: '9', type: "支出", date: "2026-06-12", title: "星巴克咖啡與甜點", amount: -350, group: "娛樂", category: "下午茶", account: "星展銀行" },
  { id: '10', type: "收入", date: "2026-06-05", title: "薪資入帳", amount: 46785, group: "固定收入", category: "薪資", account: "彰化銀行" },
  { id: '11', type: "收入", date: "2026-06-05", title: "政府租屋補助", amount: 4000, group: "固定收入", category: "補助", account: "彰化銀行" },
  
  // 2025-06 (Historical Comparison data)
  { id: '12', type: "支出", date: "2025-06-25", title: "房租固定開銷", amount: -30500, group: "固定支出", category: "房租", account: "彰化銀行" },
  { id: '13', type: "支出", date: "2025-06-15", title: "育兒大型用品", amount: -1800, group: "家庭", category: "育兒購物", account: "聯邦銀行" },
  { id: '14', type: "支出", date: "2025-06-10", title: "小聚餐聚會", amount: -650, group: "娛樂", category: "晚餐", account: "國泰CUBE" },
  { id: '15', type: "收入", date: "2025-06-05", title: "薪資入帳", amount: 45000, group: "固定收入", category: "薪資", account: "彰化銀行" }
];

const DEFAULT_ACCOUNTS = [
  { id: 'a1', name: "彰化銀行", type: "bank", balance: 15000 },
  { id: 'a2', name: "國泰Bank", type: "bank", balance: 52000 },
  { id: 'a3', name: "中國信託", type: "bank", balance: 8000 },
  { id: 'a4', name: "錢包", type: "bank", balance: 2000 },
  { id: 'c1', name: "國泰CUBE", type: "cc", limit: 150000 },
  { id: 'c2', name: "台新銀行", type: "cc", limit: 120000 },
  { id: 'c3', name: "聯邦銀行", type: "cc", limit: 100000 },
  { id: 'c4', name: "星展銀行", type: "cc", limit: 80000 }
];

const DEFAULT_BUDGETS = [
  { group: "固定支出", limit: 35000 },
  { group: "家庭", limit: 8000 },
  { group: "娛樂", limit: 5000 }
];

export function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!data) {
    saveTransactions(DEFAULT_TRANSACTIONS);
    return DEFAULT_TRANSACTIONS;
  }
  return JSON.parse(data);
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getAccounts() {
  const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  if (!data) {
    saveAccounts(DEFAULT_ACCOUNTS);
    return DEFAULT_ACCOUNTS;
  }
  return JSON.parse(data);
}

export function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export function getBudgets() {
  const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  if (!data) {
    saveBudgets(DEFAULT_BUDGETS);
    return DEFAULT_BUDGETS;
  }
  return JSON.parse(data);
}

export function saveBudgets(budgets) {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}
