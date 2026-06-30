<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>
    
    <!-- Modal content -->
    <div class="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden transform transition-all z-10 border border-slate-100">
      <div class="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
        <h3 class="text-lg font-bold">{{ isEditMode ? '✏️ 修改交易紀錄' : '✨ 一鍵快速記帳' }}</h3>
        <button @click="$emit('close')" class="text-white/80 hover:text-white text-xl font-bold">
          &times;
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Type Selection -->
        <div class="flex gap-2">
          <button 
            type="button" 
            class="flex-1 py-2.5 rounded-xl font-bold transition-all text-center border"
            :class="form.type === '支出' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-500'"
            @click="setType('支出')"
          >
            💸 支出
          </button>
          <button 
            type="button" 
            class="flex-1 py-2.5 rounded-xl font-bold transition-all text-center border"
            :class="form.type === '收入' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'"
            @click="setType('收入')"
          >
            💰 收入
          </button>
        </div>

        <!-- Date & Title -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">日期</label>
            <input 
              v-model="form.date" 
              type="date" 
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">項目名稱</label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="例如: 晚餐"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">
            金額 {{ form.isInstallment && !isEditMode ? '(單期金額)' : '(單筆金額)' }}
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
            <input 
              v-model.number="form.amount" 
              type="number" 
              placeholder="0"
              required
              min="1"
              class="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <!-- Group & Category -->
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">類別群組</label>
              <select 
                v-model="form.group" 
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
                <option value="__NEW_GROUP__">➕ 新增自訂群組...</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">細項類別</label>
              <select 
                v-model="form.category" 
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option v-for="c in subCategories" :key="c" :value="c">{{ c }}</option>
                <option value="__NEW_CAT__">➕ 新增自訂細項...</option>
              </select>
            </div>
          </div>

          <!-- Custom group input field -->
          <div v-if="form.group === '__NEW_GROUP__'">
            <label class="block text-[10px] font-bold text-indigo-600 mb-1">請輸入全新自訂群組名稱</label>
            <input 
              v-model="customGroupInput" 
              type="text" 
              placeholder="例如: 機車、汽車"
              required
              class="w-full px-3 py-2 border border-indigo-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/10 font-semibold"
            />
          </div>

          <!-- Custom category input field -->
          <div v-if="form.category === '__NEW_CAT__'">
            <label class="block text-[10px] font-bold text-indigo-600 mb-1">請輸入全新自訂細項名稱</label>
            <input 
              v-model="customCategoryInput" 
              type="text" 
              placeholder="例如: 機車加油、停車費"
              required
              class="w-full px-3 py-2 border border-indigo-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/10 font-semibold"
            />
          </div>
        </div>

        <!-- Account / Payment -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">支付帳戶 / 卡別</label>
          <select 
            v-model="form.account" 
            class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option v-for="acc in accounts" :key="acc.name" :value="acc.name">
              {{ acc.name }} ({{ acc.type === 'bank' ? '帳戶存款' : '信用卡' }})
            </option>
          </select>
        </div>

        <!-- Remark field -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">備註 / 補充說明</label>
          <textarea 
            v-model="form.remark" 
            rows="2"
            placeholder="請輸入說明 (例如: 家人聚餐、加油...)"
            class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <!-- Installment Option (Only for Expenses in Add Mode) -->
        <div v-if="form.type === '支出' && !isEditMode" class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600">是否設定分期付款？</span>
            <input 
              v-model="form.isInstallment" 
              type="checkbox" 
              class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>
          <div v-if="form.isInstallment" class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-1">分期期數</label>
              <select 
                v-model.number="form.installments" 
                class="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option :value="3">3 期</option>
                <option :value="6">6 期</option>
                <option :value="12">12 期</option>
                <option :value="24">24 期</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-1">每期金額</label>
              <div class="text-xs font-mono font-bold text-rose-600 py-1.5">
                $ {{ Math.round(form.amount).toLocaleString() }} / 月
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2 flex gap-3">
          <button 
            type="button" 
            class="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-medium hover:bg-slate-50 transition"
            @click="$emit('close')"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
          >
            {{ isEditMode ? '確認修改' : '確認記帳' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  accounts: Array,
  budgets: {
    type: Array,
    default: () => []
  },
  allTransactions: {
    type: Array,
    default: () => []
  },
  editingTransaction: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'add-multiple', 'add', 'update']);

const getTodayDate = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const isEditMode = computed(() => !!props.editingTransaction);

const form = ref({
  type: '支出',
  date: getTodayDate(),
  title: '',
  amount: null,
  group: '娛樂',
  category: '午餐',
  account: '國泰CUBE',
  remark: '',
  isInstallment: false,
  installments: 3
});

// Watch editingTransaction to load existing values when in edit mode
watch(() => props.editingTransaction, (newTx) => {
  if (newTx) {
    form.value = {
      type: newTx.type,
      date: newTx.date,
      title: newTx.title,
      amount: Math.abs(newTx.amount),
      group: newTx.group,
      category: newTx.category,
      account: newTx.account,
      remark: newTx.remark || '',
      isInstallment: false,
      installments: 3
    };
  } else {
    // Reset to defaults
    form.value = {
      type: '支出',
      date: getTodayDate(),
      title: '',
      amount: null,
      group: '娛樂',
      category: '午餐',
      account: '國泰CUBE',
      remark: '',
      isInstallment: false,
      installments: 3
    };
  }
}, { immediate: true });

const availableGroups = computed(() => {
  if (form.value.type === '支出') {
    const budgetGroups = props.budgets.map(b => b.group);
    const defaults = ['娛樂', '家庭', '固定支出', '其他', '公用事業', '機車', '汽車'];
    return [...new Set([...budgetGroups, ...defaults])];
  } else {
    return ['固定收入', '變動收入'];
  }
});

const computedSubCategoriesMap = computed(() => {
  const map = {
    '娛樂': ['午餐', '晚餐', '早餐', '下午茶', '飲料', '奢侈品', '娛樂活動', 'GYM', 'KTV', '外出用餐', '宵夜', '甜點', '購物', '電影'],
    '家庭': ['育兒購物', '醫療', '生活用品', '雜支', 'Ubereats會員', '學校', '年度保險', '悠遊卡加值', '房租', '水費', '瓦斯費', '社區網路', '網路費', '老婆', '衣物', '雜貨', '電費', '電話費'],
    '固定支出': ['房租', '管理費', '水電瓦斯', '保險費', '信用卡費'],
    '其他': ['其他', '剪頭髮', '軟體', '雲端'],
    '公用事業': ['電話費'],
    '機車': ['機車保養', '機車加油'],
    '汽車': ['ETC', '保養', '停車費', '汽油', '洗車', '車險'],
    '固定收入': ['薪資', '獎金', '補助'],
    '變動收入': ['投資收益', '二手拍賣', '其他收入']
  };

  // Add categories learned from transaction history
  props.allTransactions.forEach(t => {
    if (t.group && t.category) {
      if (!map[t.group]) {
        map[t.group] = [];
      }
      if (!map[t.group].includes(t.category)) {
        map[t.group].push(t.category);
      }
    }
  });

  return map;
});

const subCategories = computed(() => {
  return computedSubCategoriesMap.value[form.value.group] || ['其他'];
});

const setType = (type) => {
  form.value.type = type;
  if (type === '支出') {
    form.value.group = '娛樂';
    form.value.category = '午餐';
    form.value.account = '國泰CUBE';
  } else {
    form.value.group = '固定收入';
    form.value.category = '薪資';
    form.value.account = '國泰Bank';
    form.value.isInstallment = false;
  }
};

const customGroupInput = ref('');
const customCategoryInput = ref('');

watch(() => form.value.group, (newGroup) => {
  if (newGroup === '__NEW_GROUP__') {
    form.value.category = '__NEW_CAT__';
    return;
  }
  const list = computedSubCategoriesMap.value[newGroup] || [];
  if (list.length && !list.includes(form.value.category)) {
    form.value.category = list[0];
  }
});

const handleSubmit = () => {
  let finalGroup = form.value.group;
  let finalCategory = form.value.category;

  if (form.value.group === '__NEW_GROUP__') {
    finalGroup = customGroupInput.value.trim() || '其他';
  }
  if (form.value.category === '__NEW_CAT__') {
    finalCategory = customCategoryInput.value.trim() || '其他';
  }

  const baseAmount = form.value.type === '支出' 
    ? -Math.abs(form.value.amount) 
    : Math.abs(form.value.amount);

  if (isEditMode.value) {
    emit('update', {
      ...props.editingTransaction,
      type: form.value.type,
      date: form.value.date,
      title: form.value.title,
      amount: baseAmount,
      group: finalGroup,
      category: finalCategory,
      account: form.value.account,
      remark: form.value.remark
    });
  } else {
    if (form.value.type === '支出' && form.value.isInstallment) {
      const list = [];
      const baseDate = new Date(form.value.date);
      
      for (let i = 0; i < form.value.installments; i++) {
        const targetDate = new Date(baseDate);
        targetDate.setMonth(baseDate.getMonth() + i);
        
        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        
        list.push({
          id: `inst-${Date.now()}-${i}`,
          type: form.value.type,
          date: `${y}-${m}-${d}`,
          title: `${form.value.title} (分期 ${i+1}/${form.value.installments})`,
          amount: baseAmount,
          group: finalGroup,
          category: finalCategory,
          account: form.value.account,
          remark: form.value.remark || `分期付款 第 ${i+1} 期 / 共 ${form.value.installments} 期`
        });
      }
      emit('add-multiple', list);
    } else {
      emit('add', {
        ...form.value,
        id: Date.now().toString(),
        amount: baseAmount,
        group: finalGroup,
        category: finalCategory
      });
    }
  }
  
  // Reset form
  form.value.title = '';
  form.value.amount = null;
  form.value.date = getTodayDate();
  form.value.remark = '';
  form.value.isInstallment = false;
  customGroupInput.value = '';
  customCategoryInput.value = '';
};
</script>
