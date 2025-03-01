const axios = require("axios");

const testAuth = async () => {
  try {
    const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email: "hello@wallandtone.com",
      password: "Ramkrish1227@"
    });

    console.log("Shiprocket Token:", response.data.token);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
};

testAuth();
