export type EvaluationStatus = "in_progress" | "needs_work" | "priority";

export type EvaluationCriteria = Partial<Record<string, EvaluationStatus>>;

export const EVALUATION_STATUS_OPTIONS: EvaluationStatus[] = [
  "in_progress",
  "needs_work",
  "priority",
];

export const EVALUATION_CRITERIA = [
  "vocabulary",
  "grammar",
  "listening_comprehension",
  "reading_comprehension",
  "speaking",
  "writing",
  "pronunciation",
  "confidence",
  "autonomy",
] as const;

export function defaultEvaluationCriteria(): EvaluationCriteria {
  return Object.fromEntries(
    EVALUATION_CRITERIA.map((criterion) => [criterion, "needs_work"])
  );
}

export function isEvaluationStatus(value: unknown): value is EvaluationStatus {
  return (
    typeof value === "string" &&
    EVALUATION_STATUS_OPTIONS.includes(value as EvaluationStatus)
  );
}

export function normalizeEvaluationCriteria(
  value: unknown
): EvaluationCriteria {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return EVALUATION_CRITERIA.reduce<EvaluationCriteria>((acc, criterion) => {
    const status = (value as Record<string, unknown>)[criterion];
    if (isEvaluationStatus(status)) acc[criterion] = status;
    return acc;
  }, {});
}
