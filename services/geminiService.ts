import { GoogleGenerativeAI } from "@google/generative-ai";
import { SeedInput, GeneratedContent } from "../types";

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Schema
const responseSchema = {
  type: "object",
  properties: {
    postContent: { type: "string" },
    imagePrompt: { type: "string" }
  },
  required: ["postContent", "imagePrompt"]
};

export const generateSeedPost = async (
  input: SeedInput
): Promise<GeneratedContent> => {
  if (!apiKey) throw new Error("Missing API KEY");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema
    },
    systemInstruction:
      "Bạn là chuyên gia Marketing nông nghiệp, văn phong thân thiện, gần gũi, đáng tin cậy, dùng nhiều emoji."
  });

  const prompt = `
    Viết bài bán hàng cho hạt giống:
    - Tên hạt: ${input.seedName}
    - Giá: ${input.price}
    - Điểm mạnh: ${input.strongPoints}
    - Thời gian thu hoạch: ${input.harvestTime}
    - Không gian phù hợp: ${input.suitableSpace}
    ${input.recommendedCombos ? `Combo: ${input.recommendedCombos}` : ""}
    Link mua: ${input.purchaseLink}
  `;

  const result = await model.generateContent(prompt);
  const json = JSON.parse(result.response.text());

  // sinh ảnh
  const imageBase64 = await regenerateSeedImage(json.imagePrompt);

  return {
    postContent: json.postContent,
    imagePrompt: json.imagePrompt,
    imageBase64
  };
};

export const regenerateSeedImage = async (
  imagePrompt: string
): Promise<string | undefined> => {
  const imageModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });

  const result = await imageModel.generateContent([
    {
      text: imagePrompt
    }
  ]);

  const imagePart = result.response.candidates?.[0]?.content.parts.find(
    (p) => p.inlineData
  );

  return imagePart?.inlineData?.data;
};
