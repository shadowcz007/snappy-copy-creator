
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
}

export function Loading({ className }: LoadingProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
