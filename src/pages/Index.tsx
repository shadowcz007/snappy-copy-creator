import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/Loading";
import { CopyCard } from "@/components/CopyCard";
import { ApiSettingsDialog } from "@/components/ApiSettingsDialog";
import { generateCopyText, parseCopyResults } from "@/services/apiService";
import { useApiStore } from "@/store/apiStore";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { TypewriterText } from "@/components/TypewriterText";

interface CopyItem {
  style: string;
  content: string;
}

const Index = () => {
  const [productDescription, setProductDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyResults, setCopyResults] = useState<CopyItem[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingCompleted, setStreamingCompleted] = useState(false);
  
  const { apiSettings, updateApiSettings } = useApiStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerateCopy = async () => {
    if (!productDescription.trim()) {
      toast.error("请输入产品描述");
      return;
    }

    if (!apiSettings.apiKey) {
      toast.error("请先设置 API Key", {
        description: "点击右上角的设置图标配置 API",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setCopyResults([]);
      setStreamingContent("");
      setStreamingCompleted(false);

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      await generateCopyText(
        productDescription, 
        apiSettings, 
        (partialText) => {
          setStreamingContent(partialText);
        }
      );

      setStreamingCompleted(true);

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error("Failed to generate copy:", error);
        toast.error("生成文案失败", {
          description: (error as Error).message,
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStreamingComplete = () => {
    if (streamingContent) {
      const parsedResults = parseCopyResults(streamingContent);
      setCopyResults(parsedResults);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      toast("已取消生成");
    }
  };

  const placeholderText = "例如：新款智能手表，续航7天，支持血氧监测";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">营销文案生成器</h1>
          <ApiSettingsDialog 
            settings={apiSettings} 
            onSave={updateApiSettings} 
          />
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <section className="max-w-3xl mx-auto">
          <div className="mb-8">
            <label htmlFor="product-description" className="block text-sm font-medium mb-2">
              产品描述
            </label>
            <div className="flex flex-col gap-3">
              <Textarea
                id="product-description"
                placeholder={placeholderText}
                className="h-32 resize-none"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                disabled={isGenerating}
              />
              <div className="flex justify-end gap-2">
                {isGenerating && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    取消
                  </Button>
                )}
                <Button
                  onClick={handleGenerateCopy}
                  disabled={isGenerating || !productDescription.trim()}
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <Loading className="mr-2" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      生成文案
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {(isGenerating || copyResults.length > 0 || streamingContent) && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-4">生成的文案</h2>
              
              {/* Streaming content display */}
              {streamingContent && !copyResults.length && (
                <Card className="mb-6 overflow-hidden bg-muted/20">
                  <CardContent className="p-4">
                    <TypewriterText 
                      text={streamingContent} 
                      onComplete={handleStreamingComplete}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Results in cards */}
              {copyResults.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {copyResults.map((item, index) => (
                    <CopyCard
                      key={index}
                      title={`[${item.style}]`}
                      content={item.content}
                    />
                  ))}
                </div>
              )}
              
              {/* Empty placeholder cards when loading */}
              {isGenerating && !streamingContent && (
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(4)].map((_, index) => (
                    <CopyCard
                      key={index}
                      title={`[风格 ${index + 1}]`}
                      content=""
                      isLoading={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          营销文案生成器 © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
