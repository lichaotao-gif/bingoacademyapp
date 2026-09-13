/** 粘贴式批量导入：每行一条，逗号/制表符/中文逗号分隔 */
export default function parsePastedRows(text, fields) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells = line.split(/[\t,，]/).map((c) => c.trim())
      const row = {}
      fields.forEach((f, i) => {
        row[f] = cells[i] || ''
      })
      return row
    })
}
