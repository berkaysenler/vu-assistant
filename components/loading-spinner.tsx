import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-2 border-b-2",
        className
      )}
      style={{
        width: size,
        height: size,
        borderColor: "currentColor",
      }}
    />
  );
}
