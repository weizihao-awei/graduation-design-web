<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :small="small"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  small: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  background: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['pagination'])

const currentPage = ref(props.page)
const pageSize = ref(props.limit)

watch([() => props.page, () => props.limit], ([newPage, newLimit]) => {
  currentPage.value = newPage
  pageSize.value = newLimit
})

const handleSizeChange = (val) => {
  pageSize.value = val
  emit('pagination', { page: currentPage.value, limit: val })
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  emit('pagination', { page: val, limit: pageSize.value })
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>