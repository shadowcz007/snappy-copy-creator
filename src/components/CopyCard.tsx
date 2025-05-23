
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

interface CopyCardProps {
  title: string;
  content: string;
  isLoading?: boolean;
  className?: string;
}

export function CopyCard({ title, content, isLoading, className }: CopyCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <CopyButton text={content} />
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className={cn(
          "min-h-[60px]", 
          isLoading && "animate-pulse"
        )}>
          {content || (isLoading ? "正在生成..." : "等待生成...")}
        </p>
      </CardContent>
    </Card>
  );
}
