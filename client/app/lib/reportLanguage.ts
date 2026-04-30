export function pdfLanguageParam(language: string | undefined) {
  const normalized = language?.toLowerCase() || "";
  if (normalized.startsWith("tr")) return "tr";
  if (normalized.startsWith("fr")) return "fr";
  return "en";
}

export function pdfUrl(apiUrl: string, reportId: number, language?: string) {
  return `${apiUrl}/reports/${reportId}/pdf?lang=${pdfLanguageParam(language)}`;
}
