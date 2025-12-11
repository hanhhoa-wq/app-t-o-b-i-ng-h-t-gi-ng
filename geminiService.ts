
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SeedInput, GeneratedContent } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for the text generation to ensure structured output
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    postContent: {
      type: Type.STRING,
      description: "The complete Facebook post content including title, body, benefits, instructions, combo, link, and hashtags.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A detailed prompt to generate a realistic image of the plant/seed for marketing purposes.",
    },
  },
  required: ["postContent", "imagePrompt"],
};

export const generateSeedPost = async (input: SeedInput): Promise<GeneratedContent> => {
  if (!apiKey) {
    throw new Error("API Key is missing via process.env.API_KEY");
  }

  const prompt = `
    Bạn là chuyên gia viết content bán nông sản – hạt giống – dụng cụ trồng rau. 
    Hãy tạo ra bài đăng Facebook ấn tượng, dễ viral, dễ chốt đơn cho sản phẩm sau:
    
    - Loại hạt: ${input.seedName}
    - Giá: ${input.price}
    - Điểm mạnh: ${input.strongPoints}
    - Thời gian thu hoạch: ${input.harvestTime}
    - Không gian phù hợp: ${input.suitableSpace}
    ${input.recommendedCombos ? `- Gợi ý phối hợp/Combo: ${input.recommendedCombos}` : ''}
    - Link mua: ${input.purchaseLink}
    ${input.seoKeywords ? `- Từ khóa SEO (Facebook Search) cần tối ưu: ${input.seoKeywords}` : ''}
    ${input.customImagePrompt ? `- Yêu cầu đặc biệt về hình ảnh minh họa: ${input.customImagePrompt}` : ''}

    Yêu cầu cấu trúc bài đăng:
    1. Tiêu đề câu view (dùng icon, viết hoa điểm nhấn).
    2. Nội dung bán hàng thuyết phục (đánh vào nỗi đau hoặc niềm vui trồng cây). ${input.seoKeywords ? `(Lồng ghép tự nhiên các từ khóa: "${input.seoKeywords}")` : ''}
    3. Lợi ích khi mua hạt giống này.
    4. Hướng dẫn trồng nhanh/gọn.
    5. Gợi ý combo hoặc ưu đãi ${input.recommendedCombos ? `(Tập trung vào gợi ý: "${input.recommendedCombos}")` : `(Hãy tự đề xuất combo cây trồng chung (Companion Planting) phù hợp với ${input.seedName} để cây phát triển tốt hoặc giảm sâu bệnh)`}.
    6. Link mua hàng (kêu gọi hành động mạnh).
    7. Hashtag (Tiếng Việt + Tiếng Anh). ${input.seoKeywords ? `(Bao gồm các từ khóa SEO dưới dạng hashtag)` : ''}

    Ngoài ra, hãy viết một 'imagePrompt' mô tả thật chi tiết hình ảnh cây trưởng thành đẹp mắt, ánh sáng tự nhiên, trồng ở ban công hoặc vườn, để tôi dùng AI tạo ảnh minh hoạ.
    ${input.customImagePrompt ? `QUAN TRỌNG: Hãy kết hợp mô tả cây với yêu cầu hình ảnh: "${input.customImagePrompt}" vào trong 'imagePrompt'.` : ''}
  `;

  try {
    // 1. Generate Text Content
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "Bạn là chuyên gia Marketing nông nghiệp, văn phong thân thiện, gần gũi, đáng tin cậy, dùng nhiều emoji phù hợp với người yêu cây cối.",
      },
    });

    const textData = JSON.parse(textResponse.text || '{}');
    
    if (!textData.postContent || !textData.imagePrompt) {
      throw new Error("Failed to generate valid text content.");
    }

    let imageBase64: string | undefined = undefined;

    // 2. Generate Image using the prompt from step 1
    try {
      imageBase64 = await regenerateSeedImage(textData.imagePrompt);
    } catch (imgError) {
      console.error("Image generation failed:", imgError);
      // We don't throw here, we just return the text without the image if image fails
    }

    return {
      postContent: textData.postContent,
      imagePrompt: textData.imagePrompt,
      imageBase64: imageBase64,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const regenerateSeedImage = async (imagePrompt: string): Promise<string | undefined> => {
  if (!apiKey) {
    throw new Error("API Key is missing via process.env.API_KEY");
  }

  try {
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: imagePrompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1", // Square for Facebook/Instagram
        }
      }
    });

    // Extract image data
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw error;
  }
};