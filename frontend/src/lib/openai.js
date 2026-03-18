import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-haiku-4-5-20251001';

/**
 * Generates a Vietnamese TikTok caption with hashtags and CTA.
 *
 * @param {{ productName: string, price: string, description?: string }} params
 * @returns {Promise<{ caption: string, hashtags: string[], cta: string }>}
 */
export async function generateCaption({ productName, price, description }) {
  const prompt = `Bạn là chuyên gia marketing TikTok tại Việt Nam. Tạo một caption TikTok hấp dẫn để bán sản phẩm sau:

Tên sản phẩm: ${productName}
Giá: ${price}
Mô tả: ${description || 'Không có mô tả thêm'}

Trả về JSON với format sau (chỉ JSON thuần, không có markdown hay code block):
{
  "caption": "Caption TikTok hấp dẫn (2-4 câu, tone vui vẻ, tạo urgency)",
  "hashtags": ["hashtag1", "hashtag2"],
  "cta": "Call to action ngắn gọn (1 câu)"
}

Yêu cầu:
- hashtags: 5-8 hashtag phổ biến trên TikTok VN, không có dấu #
- caption tạo cảm giác FOMO và urgency
- cta kêu gọi hành động rõ ràng`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  // Strip markdown code fences if present
  const json = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(json);
}

/**
 * Generates 5 viral TikTok video hooks.
 *
 * @param {{ productName: string, productType: string }} params
 * @returns {Promise<{ hooks: string[] }>}
 */
export async function generateHooks({ productName, productType }) {
  const prompt = `Bạn là chuyên gia tạo nội dung TikTok tại Việt Nam. Tạo 5 câu mở đầu video (hooks) cực kỳ thu hút cho sản phẩm sau:

Tên sản phẩm: ${productName}
Loại sản phẩm: ${productType}

Mỗi hook phải:
- Dài 1-2 câu
- Gây tò mò hoặc tạo cảm giác FOMO
- Phù hợp với người dùng TikTok Việt Nam

Trả về JSON thuần (không có markdown hay code block):
{
  "hooks": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"]
}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  const json = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(json);
}
