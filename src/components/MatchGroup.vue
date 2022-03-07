<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { file2Img, url2Img } from '../js/convert-to-img'
import { drawElement } from '../js/draw-element'

export interface GroupConfig {
  rMatch: boolean
  r0: number
  r1: number
  gMatch: boolean
  g0: number
  g1: number
  bMatch: boolean
  b0: number
  b1: number
}

const props = defineProps<{
  url?: string
  file?: File
  config: GroupConfig
  zoom: number
}>()
const emit = defineEmits<{
  (e: 'remove'): void
}>()

// 返回 canvas 上下文
function getCtx(el: HTMLCanvasElement) {
  return el.getContext('2d') as CanvasRenderingContext2D
}

// 匹配逻辑
function matchRGB(r: number, g: number, b: number) {
  const { rMatch, r0, r1, gMatch, g0, g1, bMatch, b0, b1 } = props.config
  return !(
    (rMatch && (r < r0 || r > r1)) ||
    (gMatch && (g < g0 || g > g1)) ||
    (bMatch && (b < b0 || b > b1))
  )
}

// 匹配图片像素
function matchData(
  ctxGet: CanvasRenderingContext2D,
  ctxPut: CanvasRenderingContext2D
) {
  const { width, height } = ctxGet.canvas
  const imageData = ctxGet.getImageData(0, 0, width, height)
  const { data } = imageData
  let matchNum = 0
  for (var i = 0; i < data.length; i += 4) {
    const r = data[i + 0]
    const g = data[i + 1]
    const b = data[i + 2]
    const isMatch = matchRGB(r, g, b)
    if (isMatch) {
      data[i + 0] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = 255
      matchNum++
    }
  }
  ctxPut.putImageData(imageData, 0, 0)
  return { matchNum, pixelNum: data.length / 4 }
}

const rawRef = shallowRef<HTMLCanvasElement>() // 原图
const rawZoomRef = shallowRef<HTMLCanvasElement>()
const matchRef = shallowRef<HTMLCanvasElement>() // 处理图
const matchZoomRef = shallowRef<HTMLCanvasElement>()

const rawWidth = ref(0) // 原图 尺寸
const rawHeigh = ref(0)

const matchNum = ref(0) // 匹配信息
const pixelNum = ref(0)
const matchRate = computed(() => {
  return ((matchNum.value / pixelNum.value) * 100).toFixed(2)
})

let img: HTMLImageElement
let ctxRaw: CanvasRenderingContext2D
let ctxRawZoom: CanvasRenderingContext2D
let ctxMatch: CanvasRenderingContext2D
let ctxMatchZoom: CanvasRenderingContext2D

function drawRaw() {
  drawElement(img, ctxRaw)
  drawElement(img, ctxRawZoom, props.zoom)
}
function drawMatch() {
  drawElement(img, ctxMatch)
  const res = matchData(ctxRaw, ctxMatch)
  matchNum.value = res.matchNum
  pixelNum.value = res.pixelNum
  if (matchRef.value) {
    drawElement(matchRef.value, ctxMatchZoom, props.zoom)
  }
}

onMounted(async () => {
  if (props.url) {
    img = await url2Img(props.url)
  } else if (props.file) {
    img = await file2Img(props.file)
  }
  rawWidth.value = img.width
  rawHeigh.value = img.height
  ctxRaw = getCtx(rawRef.value as HTMLCanvasElement)
  ctxRawZoom = getCtx(rawZoomRef.value as HTMLCanvasElement)
  ctxMatch = getCtx(matchRef.value as HTMLCanvasElement)
  ctxMatchZoom = getCtx(matchZoomRef.value as HTMLCanvasElement)
  drawRaw()
  drawMatch()
})

watch(() => props.config, drawMatch)
watch(
  () => props.zoom,
  () => {
    drawRaw()
    drawMatch()
  }
)

// 鼠标位置颜色
const mouseRgb = reactive({ r: 0, g: 0, b: 0 })
const mouseEnter = ref(false)
function handleLeave() {
  mouseEnter.value = false
}
function handleMove(event: MouseEvent) {
  const x = event.offsetX
  const y = event.offsetY
  const { data } = ctxRawZoom.getImageData(x, y, 1, 1)
  mouseRgb.r = data[0]
  mouseRgb.g = data[1]
  mouseRgb.b = data[2]
  mouseEnter.value = true
}

function rmGroup() {
  emit('remove')
}
</script>

<template>
  <el-space>
    <canvas ref="rawRef" hidden></canvas>
    <canvas
      ref="rawZoomRef"
      @mousemove="handleMove"
      @mouseleave="handleLeave"
    ></canvas>
    <canvas ref="matchRef" hidden></canvas>
    <canvas
      ref="matchZoomRef"
      @mousemove="handleMove"
      @mouseleave="handleLeave"
    ></canvas>
    <el-button type="text" @click="rmGroup">删除</el-button>
    <div class="stat">
      <div>尺寸</div>
      <div>{{ rawWidth }} x {{ rawHeigh }}</div>
    </div>
    <div class="stat">
      <div>匹配数</div>
      <div>{{ matchNum }} / {{ pixelNum }}</div>
    </div>
    <div class="stat">
      <div>匹配率</div>
      <div>{{ matchRate }}</div>
    </div>
    <template v-if="mouseEnter">
      <div class="color"></div>
      <div>rgb( {{ mouseRgb.r }} , {{ mouseRgb.g }} , {{ mouseRgb.b }} )</div>
    </template>
  </el-space>
</template>

<style scoped>
.stat {
  padding: 0 12px;
  text-align: center;
}
.color {
  width: 24px;
  height: 24px;
  background-color: rgb(
    v-bind('mouseRgb.r'),
    v-bind('mouseRgb.g'),
    v-bind('mouseRgb.b')
  );
}
</style>
