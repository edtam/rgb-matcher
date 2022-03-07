<script setup lang="ts">
import { computed, ref } from 'vue'
import MatchGroup from '../components/MatchGroup.vue'
import type { UploadFile } from 'element-plus'
import type { GroupConfig } from '../components/MatchGroup.vue'
import w1 from '../assets/w1.jpg'
import w2 from '../assets/w2.jpg'
import w3 from '../assets/w3.jpg'

// 配置
const zoom = ref(4)
const matchR = ref(true)
const matchG = ref(true)
const matchB = ref(true)
const rangeR = ref([0, 128])
const rangeG = ref([0, 128])
const rangeB = ref([0, 128])
const config = computed<GroupConfig>(() => ({
  rMatch: matchR.value,
  r0: rangeR.value[0],
  r1: rangeR.value[1],
  gMatch: matchG.value,
  g0: rangeG.value[0],
  g1: rangeG.value[1],
  bMatch: matchB.value,
  b0: rangeB.value[0],
  b1: rangeB.value[1],
}))

function formatRange(arr: number[]) {
  return arr.join(' - ')
}

// 示例
const example = ref([w1, w2, w3])
function removeExample(index: number) {
  example.value.splice(index, 1)
}

// 文件上传
const files = ref<UploadFile[]>([])
function updateFiles(file: UploadFile, fileList: UploadFile[]) {
  files.value = fileList
}
function removeFile(index: number) {
  files.value.splice(index, 1)
}
</script>

<template>
  <header>
    <el-space>
      <span>缩放:</span>
      <el-input-number size="small" :min="1" v-model="zoom" />
      <el-upload
        action=""
        :auto-upload="false"
        :show-file-list="false"
        multiple
        :on-change="updateFiles"
        :on-remove="updateFiles"
      >
        <template #trigger>
          <el-button type="text">添加图片</el-button>
        </template>
        <template #default></template>
      </el-upload>
    </el-space>

    <el-row>
      <el-col :span="7">
        <el-space>
          <el-tag effect="dark" type="danger">Red</el-tag>
          <el-switch v-model="matchR" />
          <span>{{ formatRange(rangeR) }}</span>
        </el-space>
        <el-slider :disabled="!matchR" range :max="255" v-model="rangeR" />
      </el-col>

      <el-col :span="7" :offset="1">
        <el-space>
          <el-tag effect="dark" type="success">Green</el-tag>
          <el-switch v-model="matchG" />
          <span>{{ formatRange(rangeG) }}</span>
        </el-space>
        <el-slider :disabled="!matchG" range :max="255" v-model="rangeG" />
      </el-col>

      <el-col :span="7" :offset="1">
        <el-space>
          <el-tag effect="dark">Blue</el-tag>
          <el-switch v-model="matchB" />
          <span>{{ formatRange(rangeB) }}</span>
        </el-space>
        <el-slider :disabled="!matchB" range :max="255" v-model="rangeB" />
      </el-col>
    </el-row>
  </header>

  <el-space direction="vertical" fill>
    <MatchGroup
      v-for="(url, index) in example"
      :key="url"
      :url="url"
      :config="config"
      :zoom="zoom"
      @remove="removeExample(index)"
    />
    <MatchGroup
      v-for="(file, index) in files"
      :key="file.raw.uid"
      :file="file.raw"
      :config="config"
      :zoom="zoom"
      @remove="removeFile(index)"
    />
  </el-space>
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 8px;
  padding: 8px 20px;
  background: #fff;
}
</style>
