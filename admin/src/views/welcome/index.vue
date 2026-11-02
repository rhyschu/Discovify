<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { useDark } from "./utils";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { ChartBar, ChartLine, ChartPie1, ChartPie2 } from "./components/charts";
import useChartData from "./hooks/useChartData";
import GroupLine from "@iconify-icons/ri/group-line";
import Artist from "@iconify-icons/ri/mic-fill";
import Music from "@iconify-icons/ri/music-2-fill";
import Album from "@iconify-icons/ri/album-fill";

defineOptions({
  name: "Welcome"
});

const { isDark } = useDark();

const {
  userCount,
  artistCount,
  songCount,
  playlistCount,
  popCount,
  classicCount,
  hiphopCount,
  rockCount,
  electronicCount,
  jazzCount,
  lightCount,
  countAmerica,
  countChina,
  countKorea,
  countJapan,
  countGermany,
  countBritain,
  maleCount,
  femaleCount
} = useChartData();

const pieChartData1 = ref([
  { value: popCount, name: "Pop" },
  { value: classicCount, name: "Classical" },
  { value: hiphopCount, name: "Hip-hop" },
  { value: rockCount, name: "Rock" },
  { value: electronicCount, name: "Electronic" },
  { value: jazzCount, name: "R&B" },
  { value: lightCount, name: "Easy listening" }
]);

const pieChartData2 = ref([
  { value: maleCount, name: "Male" },
  { value: femaleCount, name: "Female" }
]);
</script>

<template>
  <div>
    <div class="studio-heading"><p>DISCOVIFY STUDIO</p><h1>Your catalog, at a glance.</h1><span>Manage the music behind every discovery.</span></div>
    <el-row :gutter="24" justify="space-around">
      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * 1
          }
        }"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">
              {{ "Users" }}
            </span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : '#effaff'
              }"
            >
              <IconifyIconOffline
                :icon="GroupLine"
                :color="'#41b6ff'"
                width="18"
              />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="2200"
                :fontSize="'2.5em'"
                :startVal="0"
                :endVal="userCount"
              />
            </div>
            
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * 2
          }
        }"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">
              {{ "Artists" }}
            </span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : '#fff5f4'
              }"
            >
              <IconifyIconOffline
                :icon="Artist"
                :color="'#e85f33'"
                width="18"
              />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="2200"
                :fontSize="'2.5em'"
                :startVal="0"
                :endVal="artistCount"
              />
            </div>
            
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * 3
          }
        }"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">
              {{ "Songs" }}
            </span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : '#eff8f4'
              }"
            >
              <IconifyIconOffline :icon="Music" :color="'#26ce83'" width="18" />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="2200"
                :fontSize="'2.5em'"
                :startVal="0"
                :endVal="songCount"
              />
            </div>
            
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * 4
          }
        }"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">
              {{ "Playlists" }}
            </span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : '#f6f4fe'
              }"
            >
              <IconifyIconOffline :icon="Album" :color="'#7846e5'" width="18" />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="2200"
                :fontSize="'2.5em'"
                :startVal="0"
                :endVal="playlistCount"
              />
            </div>
            
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card class="bar-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">Genre distribution</span>
          </div>
          <div class="flex justify-between items-start mt-3">
            <ChartPie1 :chartData="pieChartData1" />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card class="bar-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">Artists by country</span>
          </div>
          <div class="flex justify-between items-start mt-3">
            <ChartBar
              :barChartData="[
                countAmerica,
                countChina,
                countKorea,
                countJapan,
                countGermany,
                countBritain
              ]"
            />
          </div>
        </el-card>

        <el-card class="bar-card bar-position" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">Artist type distribution</span>
          </div>
          <div class="flex justify-between items-start mt-3">
            <ChartPie2 :chartData="pieChartData2" />
          </div>
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-border-color: none;

  .el-progress--line {
    width: 85%;
  }

  .el-progress-bar__innerText {
    font-size: 15px;
  }

  .el-scrollbar__bar {
    display: none;
  }

  .el-timeline-item {
    margin: 0 6px;
  }
}

.main-content {
  margin: 20px 20px 0 !important;
}

.bar-position {
  margin-top: 18px;
}
</style>
