const axios = require("axios");
require("dotenv").config();

const generateImage = async (req, res) => {
  const apiKey = process.env.FREEPIK_API_KEY;
  const { prompt, negativePrompt, styling } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const images = [];

    // Allowed style options
    const allowedStyles = ["photo", "digital-art", "anime", "painting", "fantasy"];

    // Loop three times for independent image generations.
    for (let i = 0; i < 3; i++) {
      // Generate a seed that is less than 1,000,000.
      const uniqueSeed = Math.floor(Math.random() * 1000000);

      // Validate the style value; if it's not one of the allowed, use an empty string.
      let styleValue = "";
      if (styling && styling.style && allowedStyles.includes(styling.style.toLowerCase())) {
        styleValue = styling.style.toLowerCase();
      }

      const requestPayload = {
        prompt,
        negative_prompt: negativePrompt || "b&w, earth, cartoon, ugly",
        guidance_scale: 2,
        seed: uniqueSeed,
        num_images: 1,
        image: {
          size: styling?.size || "square_1_1",
        },
        styling: {
          // Only include style key now.
          style: styleValue,
        },
      };

      // Log the payload for debugging

      try {
        const response = await axios.post(
          "https://api.freepik.com/v1/ai/text-to-image",
          requestPayload,
          {
            headers: {
              "Content-Type": "application/json",
              "x-freepik-api-key": apiKey,
            },
          }
        );

        const imagesData = response.data?.data || [];
        // Filter out NSFW images and select one image.
        const safeImageData = imagesData.find((imgData) => !imgData.has_nsfw);
        if (safeImageData) {
          images.push(`data:image/png;base64,${safeImageData.base64}`);
        }
      } catch (innerError) {
        console.error(
          "API call failed for iteration",
          i,
          innerError.response ? innerError.response.data : innerError.message
        );
        return res.status(400).json({
          message: "Error generating images",
          error: innerError.response ? innerError.response.data : innerError.message,
        });
      }
    }

    if (images.length > 0) {
      return res.status(200).json({
        message: "Images generated successfully",
        images,
      });
    }

    return res.status(400).json({
      message: "No suitable images generated. Please try a different prompt.",
    });
  } catch (error) {
    console.error("Error generating images:", error);
    return res.status(500).json({
      message: "Error generating images",
      error: error.message,
    });
  }
};

module.exports = { generateImage };
