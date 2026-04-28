export function pdfLanguageParam(language: string | undefined) {
  return encodeURIComponent(language?.startsWith("tr") ? "tr" : "en");
}

export function pdfUrl(apiUrl: string, reportId: number, language?: string) {
  return `${apiUrl}/reports/${reportId}/pdf?lang=${pdfLanguageParam(language)}`;
}
