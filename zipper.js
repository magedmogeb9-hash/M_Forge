// ============ zipper.js ============
// تصدير الملفات كـ ZIP باستخدام JSZip (يعمل بالكامل داخل المتصفح).

async function downloadFilesAsZip(files, zipName){
  const zip = new JSZip();
  Object.entries(files).forEach(([name, content]) => {
    zip.file(name, content);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = zipName || 'mogibforge-project.zip';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
