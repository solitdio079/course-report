type StarRatingProps = {
  value: number | null;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  label?: string;
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  label = "Rating",
}: StarRatingProps) {
  const rating = Math.max(0, Math.min(5, Math.round(value || 0)));

  return (
    <div className="flex items-center gap-1" aria-label={`${label}: ${rating}/5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= rating;
        if (readOnly) {
          return (
            <span
              key={star}
              className={`text-xl leading-none ${
                active ? "text-warning" : "text-base-300"
              }`}
              aria-hidden="true"
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            className={`btn btn-ghost btn-xs h-8 min-h-8 px-1 text-2xl ${
              active ? "text-warning" : "text-base-300"
            }`}
            onClick={() => onChange?.(star)}
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          >
            ★
          </button>
        );
      })}
      {value != null && (
        <span className="ml-2 text-sm font-medium text-base-content/70">
          {value}/5
        </span>
      )}
    </div>
  );
}
