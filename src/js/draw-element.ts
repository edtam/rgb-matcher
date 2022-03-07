export function drawElement(
  el: CanvasImageSource,
  ctx: CanvasRenderingContext2D,
  zoom: number = 1
) {
  const width = Number(el.width) * zoom
  const height = Number(el.height) * zoom
  ctx.canvas.width = width
  ctx.canvas.height = height
  // 抗锯齿设置
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(el, 0, 0, width, height)
}
