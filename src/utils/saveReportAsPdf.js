/**
 * 将报告 DOM 节点导出为 PDF 并触发浏览器下载到本地。
 * 展开 details、展开答题列表高度，便于完整截图。
 */
export async function saveReportAsPdf(element, filename) {
  if (!element || typeof window === 'undefined') return

  const html2pdf = (await import('html2pdf.js')).default

  const safeName =
    filename ||
    `报告-${new Date().toISOString().slice(0, 19).replace(/T/, '_').replace(/:/g, '-')}.pdf`

  const opt = {
    margin: [12, 12, 12, 12],
    filename: safeName,
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      onclone(clonedDoc) {
        clonedDoc.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))
        clonedDoc.querySelectorAll('.report-detail-list').forEach((el) => {
          el.style.maxHeight = 'none'
          el.style.overflow = 'visible'
        })
      },
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  await html2pdf().set(opt).from(element).save()
}
