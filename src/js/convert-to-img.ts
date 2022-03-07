export function file2Img(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve(img)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

export function url2Img(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}
