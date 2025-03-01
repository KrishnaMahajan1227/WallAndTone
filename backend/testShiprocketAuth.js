const axios = require("axios");

// Use process.env.VITE_API_URL if available; otherwise use fallback
const apiUrl =
  process.env.VITE_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://wallandtone.com");

const testAuth = async () => {
  try {
    const response = await axios.post(`${apiUrl}/api/shiprocket/auth`, {
      email: "hello@wallandtone.com",
      password: "Ramkrish1227@"
    });
    console.log("Shiprocket Token:", response.data.token);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
};

testAuth();
