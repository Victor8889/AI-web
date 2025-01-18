/**
 *  @From https://github.com/JetBrains/svg-sprite-loader/issues/434
 *  @Better https://github.com/anncwb/vite-plugin-svg-icons
 */
import { readFileSync, readdirSync } from 'fs'

let idPrefix = ''

const hasViewBox = /(viewBox="[^>+].*?")/g

const clearHeightWidth = /(width|height)="([^>+].*?)"/g

const svgTitle = /<svg([^>+].*?)>/

const clearReturn = /(\r)|(\n)/g

// dir需以/结尾
/**
 * 函数“findSvgFile”递归地搜索目录中的 SVG 文件，提取每个 SVG 文件的内容，并将它们转换为具有唯一 ID 的“<symbol>”标签。
 * @param dir - `dir` 参数是您要搜索 SVG 文件的目录路径。
 * @returns 函数“findSvgFile”返回 SVG 字符串数组。
 */
function findSvgFile(dir) {
  const svgRes = []
  // 读取目标目录
  const dirents = readdirSync(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      // 是目录则递归遍历目录
      svgRes.push(...findSvgFile(`${dir + dirent.name}/`))
    }
    else {
      if (!dirent.name.endsWith('.svg'))
        continue
      const svg = readFileSync(dir + dirent.name)
        .toString()
        .replace('<?xml version="1.0" standalone="no"?>', '')
        .replace(clearReturn, '')
        // 提取出svg标签,并根据id规则生成<symbol id="xxx">
        .replace(svgTitle, ($1, $2) => {
          let width = 0
          let height = 0
          // 获取svg标签里的属性 如 xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 1024 1024"
          let content = $2.replace(clearHeightWidth, (s1, s2, s3) => {
            if (s2 === 'width')
              width = s3

            else if (s2 === 'height')
              height = s3

            return ''
          })
          // 用 width/height属性来替换viewBox的值
          if (!hasViewBox.test($2))
            content += `viewBox="0 0 ${width} ${height}"`

          // 将svg的文件名和id-prefix拼接成<symbol>标签的id
          return `<symbol id="${idPrefix}-${dirent.name.replace('.svg', '')}" ${content}>`
        })
        // 将闭合标签/svg也换成symbol
        .replace('</svg>', '</symbol>')
      svgRes.push(svg)
    }
  }
  return svgRes
}

/**
 * `svgLoader` 函数是一个 JavaScript 函数，它接受路径和可选前缀作为参数，并返回一个具有 `name` 属性的对象和一个替换 `transformIndexHtml`
 * 方法的对象。<body> HTML 字符串中的 ` 标记，带有 SVG 精灵，其中包含在指定路径找到的 SVG 文件。
 * @param path - `path` 参数是 SVG 文件所在目录的相对路径。
 * @param [prefix=icon] - `prefix` 参数是一个字符串，用作 SVG 图标 ID 的前缀。默认情况下，前缀设置为“icon”。
 * @returns 函数“svgLoader”返回一个对象，其“name”属性设置为“svg-transform”和一个“transformIndexHtml”方法。
 */
export const svgLoader = (path, prefix = 'icon') => {
  if (path === '')
    return
  idPrefix = prefix
  const res = findSvgFile(process.cwd() + path)
  return {
    name: 'svg-transform',
    transformIndexHtml(html) {
      return html.replace(
        '<body>',
        ` <svg id="svgSpriteStats" xmlns="http://www.w3.org/2000/svg"  style="display: none">${res.join(
          '',
        )}</svg>`,
      )
    },
  }
}
