import { GoogleGenerativeAI } from "@google/generative-ai";
import { SeedInput, GeneratedContent } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) console.error("❌ API_KEY is missing on server!");

const genAI = new GoogleGenerativeAI(apiKey);

// JSON Schema
const responseSchema = {
  type: "object",
  properties: {
    postContent: { type: "string" },
    imagePrompt: { type: "string" }
  },
  required: ["postContent", "imagePrompt"]
};

// ⚡ Generate Facebook Post
export const generateSeedPost = async (
  input: SeedInput
): Promise<GeneratedContent> => {
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema
    },
    systemInstruction:
      "Bạn là chuyên gia Marketing nông nghiệp, văn phong thân thiện, gần gũi, giàu cảm xúc và dễ viral."
  });

  const prompt = `
    Tạo bài đăng bán hàng cho hạt giống:
    - Tên hạt: ${input.seedName}
    - Giá: ${input.price}
    - Điểm mạnh: ${input.strongPoints}
    - Thu hoạch: ${input.harvestTime}
    - Không gian: ${input.suitableSpace}
    ${input.recommendedCombos ? `Combo: ${input.recommendedCombos}` : ""}
    Link mua: ${input.purchaseLink}
  `;

  const result = await model.generateContent(prompt);
  const json = JSON.parse(result.response.text());

  // generate image
  const imageBase64 = await regenerateSeedImage(json.imagePrompt);

  return {
    postContent: json.postContent,
    imagePrompt: json.imagePrompt,
    imageBase64
  };
};

// ⚡ Generate Image (Gemini 2.5 Flash Image)
export const regenerateSeedImage = async (
  imagePrompt: string
): Promise<string | undefined> => {

  const imageModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image"
  });

  const result = await imageModel.generateContent([
    { text: imagePrompt }
  ]);

  const part =
    result.response.candidates?.[0]?.content.parts.find(
      (p) => p.inlineData
    );

  return part?.inlineData?.data; // base64
};
