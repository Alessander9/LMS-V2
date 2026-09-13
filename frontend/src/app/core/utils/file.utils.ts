export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(tipo: string): string {
  const t = (tipo || '').toLowerCase();
  if (t.includes('pdf')) return 'picture_as_pdf';
  if (t.includes('word') || t.includes('msword') || t.includes('document')) return 'description';
  if (t.includes('image') || t.includes('jpeg') || t.includes('jpg') || t.includes('png')) return 'image';
  return 'article';
}

export function getCleanFileType(tipo: string): string {
  const t = (tipo || '').toLowerCase();
  if (t.includes('pdf')) return 'PDF';
  if (t.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'DOCX';
  if (t.includes('msword') || t.includes('word')) return 'DOC';
  if (t.includes('jpeg') || t.includes('jpg')) return 'JPG';
  if (t.includes('png')) return 'PNG';
  return 'Archivo';
}

export function getFileExtension(tipo: string): string {
  const t = (tipo || '').toLowerCase();
  if (t.includes('pdf')) return 'pdf';
  if (t.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'docx';
  if (t.includes('msword') || t.includes('word')) return 'doc';
  if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
  if (t.includes('png')) return 'png';
  return 'bin';
}

export function isAllowedExtension(fileName: string): boolean {
  const fileExt = fileName.split('.').pop()?.toLowerCase();
  const dangerousExts = ['exe', 'bat', 'sh', 'cmd', 'js', 'com', 'scr', 'msi', 'vbs'];
  return !fileExt || !dangerousExts.includes(fileExt);
}
