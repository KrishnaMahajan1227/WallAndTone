const axios = require('axios');
require('dotenv').config();

const generateImage = async (req, res) => {
  const { prompt, negativePrompt, styling } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    console.log('Generating images for prompt:', prompt);

    const requestPayload = {
      prompt,
      negative_prompt: negativePrompt || 'b&w, earth, cartoon, ugly',
      guidance_scale: 2,
      seed: Math.floor(Math.random() * 100000),
      num_images: 1,
      image: {
        size: styling.size || 'square_1_1',
      },
      styling: {
        color: styling.color || '',
        framing: styling.framing || '',
        lightning: styling.lightning || '',
        style: styling.style || '',
      },
    };

    // Remove empty styling options
    Object.keys(requestPayload.styling).forEach((key) => {
      if (requestPayload.styling[key] === '') {
        delete requestPayload.styling[key];
      }
    });

    const response = await axios.post(
      'https://api.freepik.com/v1/ai/text-to-image',
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': process.env.FREEPIK_API_KEY,
        },
      }
    );

    const imgData = response.data?.data?.[0];
    if (imgData && !imgData.has_nsfw) {
      // Return the base64 image data
      const imageUrl = `data:image/png;base64,${imgData.base64}`;
      return res.status(200).json({ 
        message: 'Image generated successfully',
        images: [imageUrl]
      });
    }

    return res.status(400).json({
      message: 'No suitable images generated. Please try a different prompt.',
    });
  } catch (error) {
    console.error('Error generating images:', error);
    return res.status(500).json({ 
      message: 'Error generating images', 
      error: error.message 
    });
  }
};

module.exports = { generateImage };