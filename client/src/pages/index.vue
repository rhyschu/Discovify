<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { discoverSongs, getBanner } from '@/api/system'
import { UserStore } from '@/stores/modules/user'
import { ElMessage } from 'element-plus'
import Table from '@/components/Table.vue'
import type { Song } from '@/api/interface'
const user = UserStore()
const songs = ref<Song[]>([])
const banners = ref<{bannerId: number; bannerUrl: string}[]>([])
const loading = ref(false)
const failed = ref(false)
const intent = ref('')
const mode = ref('content')
const personalized = ref(false)
let requestId = 0
async function refresh() {
  const id = ++requestId
  loading.value = true
  failed.value = false
  try {
    const result = await discoverSongs(intent.value)
    if (id !== requestId) return
    if (result.code !== 0) throw new Error(result.message)
    songs.value = Array.isArray(result.data?.songs) ? result.data.songs : []
    mode.value = result.data?.mode || 'content'
    personalized.value = !!result.data?.personalized
  } catch {
    if (id !== requestId) return
    failed.value = true
    ElMessage.error('Could not load Discover. Please try again.')
  } finally { if (id === requestId) loading.value = false }
}
watch(() => user.userInfo?.token, () => { songs.value = []; intent.value = ''; refresh() })
onMounted(async () => {
  refresh()
  try {
    const result = await getBanner()
    if (result.code === 0 && Array.isArray(result.data)) banners.value = result.data
  } catch { /* Discover remains available if banners fail. */ }
})
</script>
<template>
  <div class="discover-page">
    <section class="discovery-hero">
      <div class="hero-copy">
        <span class="eyebrow">A little familiar. Something new.</span>
        <h1>Your next<br><em>favorite sound.</em></h1>
        <p>Start with what you love. Find something worth playing again.</p>
        <router-link to="/library" class="primary-link">Explore the library <span aria-hidden="true">↗</span></router-link>
      </div>
      <div class="hero-record" aria-hidden="true"><div class="record-label">d<span>discovify</span></div></div>
    </section>
    <section class="discover-section" aria-labelledby="discover-title">
      <div class="section-heading"><div><span class="eyebrow">Made for your curiosity</span><h2 id="discover-title">Discover</h2>
      <p>{{ personalized ? 'Inspired by your recent listening and liked songs.' : 'Explore the catalog. Sign in and listen or like songs to shape your discoveries.' }}</p></div>
      <button class="secondary-button" :disabled="loading" @click="refresh">{{ loading ? 'Finding tracks…' : 'Refresh selection' }}</button></div>
      <form class="discovery-request" @submit.prevent="refresh">
        <label for="discovery-intent">What would you like to hear?</label>
        <div><input id="discovery-intent" v-model="intent" maxlength="200" placeholder="An artist, a genre, or something you want to explore" /><button class="secondary-button" :disabled="loading">Find my mix</button></div>
        <p role="status">{{ mode === 'agent' ? 'AI-curated from playable tracks in your library.' : mode === 'fallback' ? 'Showing a library mix while personalized curation is unavailable.' : 'Selected from the catalog for you.' }}</p>
      </form>
      <div v-if="loading && !songs.length" class="empty-state" role="status">Finding your next listen…</div>
      <div v-else-if="failed && !songs.length" class="empty-state"><p>Discover is temporarily unavailable.</p><button class="secondary-button" @click="refresh">Try again</button></div>
      <div v-else-if="!songs.length" class="empty-state">No tracks yet. Check back soon.</div>
      <Table v-else :data="songs" />
    </section>
    <section v-if="banners.length" class="featured-section" aria-label="Featured artwork">
      <div class="section-heading"><h2>In the spotlight</h2></div>
      <el-carousel :interval="5000" height="220px" indicator-position="outside">
        <el-carousel-item v-for="banner in banners" :key="banner.bannerId"><img :src="banner.bannerUrl" alt="Featured music artwork" class="spotlight-image" /></el-carousel-item>
      </el-carousel>
    </section>
  </div>
</template>

<style scoped>
.discovery-request { margin: 0 0 24px; }
.discovery-request label { display: block; font-size: 14px; margin-bottom: 8px; }
.discovery-request > div { display: flex; gap: 12px; }
.discovery-request input { flex: 1; min-width: 0; padding: 12px 16px; border: 1px solid #8886; border-radius: 12px; background: transparent; color: inherit; font: inherit; }
.discovery-request p { font-size: 12px; opacity: .7; margin-top: 10px; }
@media (max-width: 600px) { .discovery-request > div { flex-direction: column; } }
</style>
