import type { CSSProperties } from "react";

type Size = "xs" | "sm" | "md" | "lg";

type SpinnerProps = {
  size?: Size;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

export function Spinner({
  size = "sm",
  className = "",
  style,
  label,
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
      className={`loading loading-spinner loading-${size} ${className}`.trim()}
      style={style}
    />
  );
}

type PageLoaderProps = {
  label?: string;
  className?: string;
};

export function PageLoader({
  label = "Loading...",
  className = "",
}: PageLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 py-16 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <span className="text-base-content/70">{label}</span>
    </div>
  );
}

type SectionLoaderProps = {
  label?: string;
  className?: string;
};

export function SectionLoader({
  label = "Loading...",
  className = "",
}: SectionLoaderProps) {
  return (
    <div
      className={`flex items-center gap-2 py-4 text-sm text-base-content/70 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <Spinner size="sm" />
      <span>{label}</span>
    </div>
  );
}

type ButtonSpinnerProps = {
  loading: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
};

export function ButtonContent({
  loading,
  loadingLabel,
  children,
}: ButtonSpinnerProps) {
  if (loading) {
    return (
      <>
        <Spinner size="xs" className="mr-2" />
        {loadingLabel ?? children}
      </>
    );
  }
  return <>{children}</>;
}
