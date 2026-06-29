<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>
    
    <!-- Modal content -->
    <div class="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden transform transition-all z-10 border border-slate-100">
      <div class="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
        <h3 class="text-lg font-bold">✨ 一鍵快速記帳</h3>
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
          <label class="block text-xs font-semibold text-slate-500 mb-1">金額</label>
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
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">類別群組</label>
            <select 
              v-model="form.group" 
              class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">細項類別</label>
            <select 
              v-model="form.category" 
              class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option v-for="c in subCategories" :key="c" :value="c">{{ c }}</option>
            </select>
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
            確認記帳
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
  accounts: Array
});

const emit = defineEmits(['close', 'add']);

const getTodayDate = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const form = ref({
  type: '支出',
  date: getTodayDate(),
  title: '',
  amount: null,
  group: '娛樂',
  category: '午餐',
  account: '國泰CUBE'
});

const availableGroups = computed(() => {
  return form.value.type === '支出' 
    ? ['娛樂', '家庭', '固定支出'] 
    : ['固定收入', '變動收入'];
});

const subCategoriesMap = {
  '娛樂': ['午餐', '晚餐', '早餐', '下午茶', '飲料', '奢侈品', '娛樂活動'],
  '家庭': ['育兒購物', '醫療', '生活用品', '雜支'],
  '固定支出': ['房租', '管理費', '水電瓦斯', '保險費', '信用卡費'],
  '固定收入': ['薪資', '獎金', '補助'],
  '變動收入': ['投資收益', '二手拍賣', '其他收入']
};

const subCategories = computed(() => {
  return subCategoriesMap[form.value.group] || [];
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
  }
};

watch(() => form.value.group, (newGroup) => {
  const list = subCategoriesMap[newGroup] || [];
  if (list.length && !list.includes(form.value.category)) {
    form.value.category = list[0];
  }
});

const handleSubmit = () => {
  const finalAmount = form.value.type === '支出' 
    ? -Math.abs(form.value.amount) 
    : Math.abs(form.value.amount);

  emit('add', {
    ...form.value,
    id: Date.now().toString(),
    amount: finalAmount
  });
  
  // Reset form
  form.value.title = '';
  form.value.amount = null;
  form.value.date = getTodayDate();
};
</script>
