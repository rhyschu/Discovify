<script setup lang="ts">
import { getArtistDetail } from '@/api/system'
import Table from '@/components/Table.vue'
import { useArtistStore } from '@/stores/modules/artist'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

interface ArtistDetailResponse {
    artistId: number
    artistName: string
    avatar: string
    birth: string
    area: string
    introduction: string
    songs: any[]
}

const route = useRoute()
const artistStore = useArtistStore()
const artistInfo = computed(() => artistStore.artistInfo)

const fetchArtistDetail = async () => {
    const id = route.params.id
    const numericId = parseInt(id.toString())

    try {
        artistStore.setArtistInfo(null)
        const res = await getArtistDetail(numericId)

        if (res.code === 0 && res.data) {
            const artistData = res.data as ArtistDetailResponse
            artistStore.setArtistInfo({
                artistId: artistData.artistId,
                artistName: artistData.artistName || 'Unknown artist',
                avatar: artistData.avatar || '',
                birth: artistData.birth || '',
                area: artistData.area || 'Unknown',
                introduction: artistData.introduction || 'No bio yet',
                songs: artistData.songs || []
            })
        } else {
            ElMessage.error(res.message || 'Could not load artist')
        }
    } catch (error) {
        console.error('Could not load artist details:', error)
        ElMessage.error('Could not load artist. Please try again.')
    }
}

watch(
    () => route.params.id,
    () => {
        fetchArtistDetail()
    },
    { immediate: true }
)
const formatBirth = (birth: string) => {
    if (!birth) return ''
    return new Date(birth).toLocaleDateString()
}
</script>

<template>
    <div class="container mx-auto py-10 px-5 h-full flex-1 flex flex-col">
        
        <div class="flex flex-col lg:flex-row items-center gap-8">
            <div class="w-48 h-48 rounded-full overflow-hidden bg-gray-200">
                <img :src="artistInfo?.avatar" :alt="artistInfo?.artistName" class="w-full h-full object-cover" />
            </div>
            <div class="text-center lg:text-left flex-1">
                <h1 class="text-3xl font-semibold text-foreground">
                    {{ artistInfo?.artistName }}
                </h1>
                <div class="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p v-if="artistInfo?.birth">Birthday: {{ formatBirth(artistInfo.birth) }}</p>
                    <p v-if="artistInfo?.area">Region: {{ artistInfo.area }}</p>
                    <p v-if="artistInfo?.introduction" class="mt-2 line-clamp-4">Bio: {{ artistInfo.introduction }}
                    </p>
                </div>
            </div>
        </div>

        <div class="mt-12 flex flex-col flex-1">
            <h2 class="text-2xl font-semibold text-foreground mb-6">All songs</h2>
            <div class="w-full h-full flex">
                <Table :data="artistInfo?.songs" />
            </div>
        </div>
    </div>
</template>
