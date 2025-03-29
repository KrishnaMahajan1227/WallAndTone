const axios = require("axios");
const { cloudinary } = require("../utils/cloudinary");
require("dotenv").config();
const apiKey = process.env.FREEPIK_API_KEY;

const pollForImages = async (taskId, apiKey, maxAttempts = 20, delay = 2000) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pollResponse = await axios.get(
      `https://api.freepik.com/v1/ai/text-to-image/imagen3/${taskId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-freepik-api-key": apiKey,
        },
      }
    );
    console.log(`Polling attempt ${attempt + 1}:`, pollResponse.data);
    const data = pollResponse.data?.data;
    if (data && data.status !== "CREATED") {
      if (Array.isArray(data.generated) && data.generated.length > 0) {
        return data.generated;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Timeout waiting for images to be generated");
};

const getAspectRatioCrop = (size) => {
  if (size === "traditional_3_4") {
    return { aspect_ratio: "3:4", crop: "fill" };
  } else if (size === "classic_4_3") {
    return { aspect_ratio: "4:3", crop: "fill" };
  } else {
    return { aspect_ratio: "1:1", crop: "fill" };
  }
};

const generateImage = async (req, res) => {
  const apiKey = process.env.FREEPIK_API_KEY;
  const { prompt, negativePrompt, styling } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const generateSingleImage = async () => {
      const uniqueSeed = Math.floor(Math.random() * 1000000);
      const requestPayload = {
        prompt,
        negative_prompt: negativePrompt || "b&w, earth, cartoon, ugly",
        guidance_scale: 2,
        seed: uniqueSeed,
        num_images: 1,
        image: { size: styling?.size || "traditional_3_4" },
      };

      if (styling?.style && styling.style.trim() !== "") {
        const styleKey = styling.style.trim().toLowerCase();
        if (styleKey === "ghibli") {
          requestPayload.guidance_scale = 4;
          requestPayload.styling = {
            style: "anime",
            effects: {
              color: "pastel",
              lightning: "golden-hour",
              framing: "portrait"
            }
          };
          requestPayload.prompt += ", in the style of Studio Ghibli with a watercolor finish, soft brush strokes, and a hand-painted, whimsical aesthetic";
        } else {
          requestPayload.styling = { style: styleKey };
          if (styling.effects) {
            requestPayload.styling.effects = styling.effects;
          }
        }
      }

      const response = await axios.post(
        "https://api.freepik.com/v1/ai/text-to-image/imagen3",
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-freepik-api-key": apiKey,
          },
        }
      );

      const taskData = response.data?.data;
      const taskId = taskData.task_id;
      let imagesData = taskData.generated;

      if (!Array.isArray(imagesData) || imagesData.length === 0) {
        imagesData = await pollForImages(taskId, apiKey);
      }

      const firstImage = imagesData[0];
      let finalImageUrl;

      if (typeof firstImage === "string") {
        const transformation = getAspectRatioCrop(styling?.size);
        const upload = await cloudinary.uploader.upload(firstImage, {
          folder: "freepik-generated",
          transformation: [transformation],
        });
        finalImageUrl = upload.secure_url;
      } else if (firstImage?.base64 && !firstImage?.has_nsfw) {
        const base64Url = `data:image/png;base64,${firstImage.base64}`;
        const transformation = getAspectRatioCrop(styling?.size);
        const upload = await cloudinary.uploader.upload(base64Url, {
          folder: "freepik-generated",
          transformation: [transformation],
        });
        finalImageUrl = upload.secure_url;
      }

      return finalImageUrl;
    };

    // 🔄 Generate 3 images concurrently, handle partial success
    const settledResults = await Promise.allSettled([
      generateSingleImage(),
      generateSingleImage(),
      generateSingleImage(),
    ]);

    const validImages = settledResults
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    if (validImages.length > 0) {
      return res.status(200).json({
        message: `${validImages.length} image(s) generated successfully`,
        images: validImages,
      });
    } else {
      return res.status(400).json({
        message: "No suitable images generated. Please try a different prompt.",
      });
    }
  } catch (error) {
    console.error("Error generating image:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error generating image",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { generateImage };
