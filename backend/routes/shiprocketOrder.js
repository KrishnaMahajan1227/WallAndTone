const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

/**
 * Helper function: Send WhatsApp notification using a messaging service (e.g. Twilio)
 * Uncomment and adjust the implementation if you integrate with Twilio.
 */
async function sendWhatsappNotification(phone, message) {
  // Example using Twilio – ensure you install the twilio package and configure your env vars.
  // const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   from: "whatsapp:+14155238886", // Your Twilio WhatsApp-enabled number
  //   to: `whatsapp:${phone}`,
  //   body: message,
  // });
  console.log(`WhatsApp notification sent to ${phone}: ${message}`);
}

/**
 * Helper function: Send Email notification using nodemailer.
 */
async function sendEmailNotification(email, subject, message) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465, // true if using port 465 (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM, // e.g., "no-reply@yourdomain.com"
    to: email,
    subject: subject,
    text: message,
    // Optionally, add an HTML version: html: `<p>${message}</p>`
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email notification sent to ${email} with subject "${subject}"`);
}

/**
 * POST /create-order
 * Creates a Shiprocket order.
 */
router.post("/create-order", async (req, res) => {
  try {
    const { token, orderData } = req.body;
    // Validate required billing fields – ensure key names match Shiprocket's documentation.
    if (!orderData.billing_address || !orderData.billing_city || !orderData.billing_pincode) {
      return res.status(400).json({
        success: false,
        message: "Billing address is incomplete",
      });
    }

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json({ success: true, orderResponse: response.data });
  } catch (error) {
    console.error(
      "Error creating order in Shiprocket:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

/**
 * GET /track-order
 * Fetches tracking details from Shiprocket. If the order is confirmed,
 * it sends notifications to the customer's WhatsApp and Email.
 */
router.get("/track-order", async (req, res) => {
  try {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const token = process.env.SHIPROCKET_TOKEN;
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Shiprocket token not configured",
      });
    }

    console.log(`Fetching tracking info for order_id: ${order_id}`);
    
    // Call Shiprocket's tracking API. Adjust URL/parameters as per documentation.
    const shiprocketResponse = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/shipments/track?order_id=${order_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Shiprocket API response: ", shiprocketResponse.data);
    const orderResponse = shiprocketResponse.data;

    // Debug logging: output the parsed orderResponse object
    console.log("Parsed orderResponse: ", orderResponse);

    // Check if the order is confirmed (adjust condition if needed)
    if (orderResponse.status && orderResponse.status.toLowerCase() === "confirmed") {
      // Extract customer contact details – adjust these keys as needed.
      const customerPhone = orderResponse.billing_phone || orderResponse.customer_phone;
      const customerEmail = orderResponse.billing_email || orderResponse.customer_email;
      console.log("Customer phone: ", customerPhone, " Customer email: ", customerEmail);

      // Build the notification message including key order details.
      const notificationMessage = `
Order Confirmation Details:
Order ID: ${orderResponse.order_id || "N/A"}
Shipment ID: ${orderResponse.shipment_id || "N/A"}
Order Status: ${orderResponse.status || "N/A"}
Products: ${
        orderResponse.products
          ? orderResponse.products.map(p => `${p.name} (Qty: ${p.quantity})`).join(", ")
          : "N/A"
      }
Order History: ${orderResponse.order_history || "N/A"}
      `.trim();

      console.log("Notification message: ", notificationMessage);

      // Send WhatsApp notification if a valid phone number is available.
      if (customerPhone) {
        try {
          await sendWhatsappNotification(customerPhone, notificationMessage);
          console.log("WhatsApp notification sent.");
        } catch (err) {
          console.error("Error sending WhatsApp notification: ", err.message);
        }
      }

      // Send Email notification if a valid email is available.
      if (customerEmail) {
        try {
          const subject = "Your Order Confirmation and Tracking Details";
          await sendEmailNotification(customerEmail, subject, notificationMessage);
          console.log("Email notification sent.");
        } catch (err) {
          console.error("Error sending email notification: ", err.message);
        }
      } else {
        console.log("No valid customer email found for sending notification.");
      }
    } else {
      console.log("Order status is not confirmed. Status: ", orderResponse.status);
    }

    res.json({ success: true, orderResponse });
  } catch (error) {
    console.error("Error tracking order:", error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tracking details",
    });
  }
});

module.exports = router;
