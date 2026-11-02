<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAllSongs } from '@/api/system'
import { useLibraryStore } from '@/stores/modules/library'
import { ElMessage } from 'element-plus'
const route = useRoute()
const libraryStore = useLibraryStore()
const props = defineProps({ selected: { type: String, default: '1' } })
const tableData = computed(() => libraryStore.tableData)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const sortBy = ref('artistName')
const sortOrder = ref('asc')
const loading = ref(false)
let requestId = 0
async function getSongs() {
  const id = ++requestId
  loading.value = true
  try {
    const res = await getAllSongs({ pageNum: currentPage.value, pageSize: pageSize.value,
      songName: String(route.query.query || ''), artistName: '', album: '',
      sortBy: sortBy.value, sortOrder: sortOrder.value })
    if (id !== requestId) return
    if (res.code !== 0) throw new Error(res.message)
    libraryStore.setTableData(res.data)
    total.value = res.data?.total || 0
  } catch { if (id === requestId) ElMessage.error('Could not load the library. Please try again.') }
  finally { if (id === requestId) loading.value = false }
}
function resetPage() { currentPage.value = 1; getSongs() }
watch(() => [route.query.query, props.selected], () => { if (props.selected === '1') resetPage() }, { immediate: true })
</script>
<template>
  <section class="library-page" aria-labelledby="library-title">
    <div class="section-heading"><div><span class="eyebrow">Find your next repeat</span><h1 id="library-title">Library</h1><p>{{ total }} tracks to explore<span v-if="route.query.query"> · Results for “{{ route.query.query }}”</span></p></div></div>
    <div class="library-toolbar">
      <label for="sort-field">Sort by</label>
      <select id="sort-field" v-model="sortBy" @change="resetPage"><option value="artistName">Artist</option><option value="songName">Song title</option><option value="album">Album</option></select>
      <label for="sort-direction" class="sr-only">Sort direction</label>
      <select id="sort-direction" v-model="sortOrder" @change="resetPage"><option value="asc">Ascending ↑</option><option value="desc">Descending ↓</option></select>
      <span v-if="loading" role="status">Loading…</span>
    </div>
    <Table :data="tableData?.items || []" />
    <nav class="library-pagination" aria-label="Library pages"><el-pagination v-model:page-size="pageSize" v-model:current-page="currentPage" :total="total" :page-sizes="[20,30,50]" layout="total, sizes, prev, pager, next" @size-change="resetPage" @current-change="getSongs" /></nav>
  </section>
</template>
