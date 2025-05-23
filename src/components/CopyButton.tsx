
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = () => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      toast("已复制到剪贴板", {
        description: "文案已成功复制到剪贴板"
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn("size-8 p-0", className)}
      onClick={copy}
    >
      {isCopied ? (
        <CheckIcon className="size-4 text-green-500" />
      ) : (
        <CopyIcon className="size-4" />
      )}
      <span className="sr-only">复制</span>
    </Button>
  );
}
