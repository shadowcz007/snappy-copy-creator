
export interface ApiSettings {
  apiUrl: string;
  apiKey: string;
  model: string;
}

const systemPrompt = `
**Role**: 你是一个专业的营销文案生成器，专门为中小企业主和营销人员提供高转化率的广告文案。  

**Task**: 根据用户输入的产品/服务描述，生成**3-5条风格不同**的营销文案，每条文案需符合以下要求：  
1. **风格标签**：明确标注文案风格（如"科技感""情感化""促销风""痛点解决型""幽默风"等）。  
2. **长度限制**：每条文案不超过30字（确保简洁有力）。  
3. **核心卖点**：必须包含用户输入中的关键功能或优势。  
4. **多样化**：避免重复句式，每条文案角度需显著不同。  

**Output Format**:  
1. [风格标签] 文案内容  
2. [风格标签] 文案内容  
3. [风格标签] 文案内容   

**Examples**:  
- 用户输入：\`"新款智能手表，续航7天，支持血氧监测"\`  
- 输出：  
  1. [科技感] 7天超长续航+血氧监测，你的健康管家！  
  2. [情感化] 守护你的每一刻，电量与健康从不缺席❤️  
  3. [促销风] 限时优惠！血氧监测手表，续航一周仅需XX元！  

**Constraints**:  
- 禁止虚构产品没有的功能。  
- 禁止使用复杂术语，语言需通俗易懂。  
- 优先使用短句、行动号召（如"立即购买""点击了解"）。  

**Tone**: 专业但友好，适应不同风格需求。
`;

export async function generateCopyText(
  productDescription: string,
  settings: ApiSettings,
  onPartialResponse: (text: string) => void
) {
  try {
    const { apiUrl, apiKey, model } = settings;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: productDescription,
          },
        ],
        stream: true,
        max_tokens: 512,
        enable_thinking: false,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`API error: ${response.status}`);
    }

    // Process the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0].delta.content || "";
            if (content) {
              result += content;
              onPartialResponse(result);
            }
          } catch (e) {
            console.error("Error parsing SSE:", e);
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error generating copy:", error);
    throw error;
  }
}

export function parseCopyResults(text: string): { style: string; content: string }[] {
  if (!text) return [];
  
  const lines = text.split("\n").filter(line => line.trim().length > 0);
  const copyResults: { style: string; content: string }[] = [];
  
  for (const line of lines) {
    // Look for patterns like "1. [风格] 文案内容" or "[风格] 文案内容"
    const cleanLine = line.replace(/^\d+\.\s*/, "").trim();
    const match = cleanLine.match(/^\[(.*?)\](.*)/);
    
    if (match) {
      const style = match[1].trim();
      const content = match[2].trim();
      if (style && content) {
        copyResults.push({ style, content });
      }
    }
  }
  
  return copyResults;
}
