const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

/**
 * Helper function: Send WhatsApp notification using a messaging service (e.g. Twilio)
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
 * Updated to send HTML content.
 */
async function sendEmailNotification(email, subject, message) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true if using port 465 (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM, // e.g., "no-reply@yourdomain.com"
    to: email,
    subject: subject,
    // Use html property to send the HTML template.
    html: message,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email notification sent to ${email} with subject "${subject}"`);
}

/**
 * POST /create-order
 * Creates a Shiprocket order and sends detailed notification emails
 * to both the admin and the customer.
 */
router.post("/create-order", async (req, res) => {
  try {
    const { token, orderData } = req.body;
    // Validate required billing/shipping/user fields.
    if (
      !orderData.billing_address ||
      !orderData.billing_city ||
      !orderData.billing_pincode ||
      !orderData.billing_email ||
      !orderData.billing_phone ||
      !(orderData.customer_name || orderData.billing_customer_name)
    ) {
      return res.status(400).json({
        success: false,
        message: "Required billing/shipping or user details are incomplete",
      });
    }

    // Create order in Shiprocket.
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

    // Extract response data.
    const orderResponse = response.data;

    // Build product details string for admin email.
    // Use orderData.order_items if available; otherwise, use orderData.products.
    const itemsArr =
      (orderData.order_items && Array.isArray(orderData.order_items)
        ? orderData.order_items
        : orderData.products && Array.isArray(orderData.products)
          ? orderData.products
          : []
      );
    const productDetails = itemsArr
      .map(p => {
        // Use p.quantity or p.units; if missing, fallback to "Not Provided"
        const qty = (p.quantity || p.units) !== "" ? (p.quantity || p.units) : "Not Provided";
        const frame = (p.frameType && p.frameType.name) ? p.frameType.name : "Not Provided";
        const subFrame = (p.subFrameType && p.subFrameType.name) ? p.subFrameType.name : "Not Provided";
        const size = (p.size && p.size.name) ? p.size.name : "Not Provided";
        return `Product Name: ${p.name || ""}
Main Image: ${p.mainImage || ""}
Quantity: ${qty}
Frame Type: ${frame}
SubFrame Type: ${subFrame}
Size: ${size}`;
      })
      .join("\n\n");

    // Use billing_customer_name if available; otherwise, fallback to customer_name.
    const customerName = orderData.billing_customer_name || orderData.customer_name;

    // Construct the detailed message for admin (includes product details).
    const adminMessage = `
New Order Created

--- User Details ---
Name: ${customerName}
Email: ${orderData.billing_email}
Phone: ${orderData.billing_phone}

--- Shipping / Billing Details ---
Address: ${orderData.billing_address}
City: ${orderData.billing_city}
State: ${orderData.billing_state || ""}
Pincode: ${orderData.billing_pincode}
Country: ${orderData.billing_country || ""}

--- Order Details ---
Order ID: ${orderResponse.order_id || ""}
Order Status: ${orderResponse.status || ""}
Order Date: ${orderData.order_date || new Date().toISOString().split("T")[0]}
Payment Method: ${orderData.payment_method || "Prepaid"}
Sub Total: ${orderData.sub_total || ""}

--- Products Ordered ---
${productDetails}

Additional Info: ${orderData.additional_info || ""}
    `.trim();

    const customerMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>New Order Confirmation</title>
      <style>
        /* Reset some defaults */
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        /* Overall background and font */
        body {
          background-color: #f8f8f8;
          font-family: "Lexend Deca", sans-serif;
          color: #555;
          line-height: 1.6;
        }
        /* Main container styling */
        .container {
          max-width: 100%;
          margin: 30px auto;
          background: #fff;
          border: 1px solid #ddd;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        /* Banner image styling */
        .banner {
          width: 100%;
          display: block;
          height: auto;
        }
        /* Header text styling */
        .header {
          text-align: center;
          padding: 20px;
          background: #5B2EFF;
          color: #fff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: 1px;
        }
        /* Content section styling */
        .content {
          padding: 25px 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section h2 {
          font-size: 20px;
          color: #5B2EFF;
          margin-bottom: 12px;
          border-bottom: 2px solid #eee;
          padding-bottom: 5px;
        }
        .section p {
          margin: 8px 0;
          font-size: 15px;
        }
        .section p strong {
          color: #333;
        }
        /* Footer styling with image */
        .footer {
          text-align: center;
          background: #f0f0f0;
          padding: 15px 20px;
          border-top: 1px solid #ddd;
        }
        .footer img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto 10px;
        }
        .footer p {
          font-size: 12px;
          color: #999;
          margin: 0;
        }
        /* Responsive adjustments */
        @media only screen and (max-width: 600px) {
          .container {
            margin: 15px;
          }
          .content {
            padding: 20px;
          }
          .header h1 {
            font-size: 24px;
          }
          .section h2 {
            font-size: 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Banner Image -->
        <img src="https://res.cloudinary.com/dxpf8q672/image/upload/v1741429839/Email-ThankYou-Banner_ho2mmd.jpg" alt="Thank You Banner" class="banner" />
        
        <!-- Header Section -->
        <div class="header">
          <h1>New Order Created</h1>
        </div>
        
        <!-- Content Section -->
        <div class="content">
          <!-- User Details Section -->
          <div class="section">
            <h2>User Details</h2>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${orderData.billing_email}</p>
            <p><strong>Phone:</strong> ${orderData.billing_phone}</p>
          </div>
          
          <!-- Shipping / Billing Details Section -->
          <div class="section">
            <h2>Shipping / Billing Details</h2>
            <p><strong>Address:</strong> ${orderData.billing_address}</p>
            <p><strong>City:</strong> ${orderData.billing_city}</p>
            <p><strong>State:</strong> ${orderData.billing_state || "N/A"}</p>
            <p><strong>Pincode:</strong> ${orderData.billing_pincode}</p>
            <p><strong>Country:</strong> ${orderData.billing_country || "N/A"}</p>
          </div>
          
          <!-- Order Details Section -->
          <div class="section">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${orderResponse.order_id || ""}</p>
            <p><strong>Order Status:</strong> ${orderResponse.status || ""}</p>
            <p><strong>Order Date:</strong> ${orderData.order_date || new Date().toISOString().split("T")[0]}</p>
            <p><strong>Payment Method:</strong> ${orderData.payment_method || "Prepaid"}</p>
            <p><strong>Sub Total:</strong> Rs ${orderData.sub_total || ""}</p>
          </div>
          
          <!-- Additional Info Section -->
          <div class="section">
            <h2>Additional Info</h2>
            <p>${orderData.additional_info || "N/A"}</p>
          </div>
        </div>
        
        <!-- Footer Section -->
        <div class="footer">
          <img src="https://res.cloudinary.com/dxpf8q672/image/upload/v1741429840/Email-ThankYou-Footer_err0xo.png" alt="Footer Decoration" />
          <p>Thank you for your order.</p>
          <p>&copy; ${new Date().getFullYear()} Wall & Tone. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `.trim();
    
    
    // Send email to admin.
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        const adminSubject = "New Order Created - Detailed Information";
        await sendEmailNotification(adminEmail, adminSubject, adminMessage);
        console.log("Admin email notification sent.");
      } catch (adminErr) {
        console.error("Error sending admin email notification:", adminErr.message);
      }
    } else {
      console.log("ADMIN_EMAIL is not configured in environment variables.");
    }

    // Send email to customer.
    const customerEmail = orderData.billing_email;
    if (customerEmail) {
      try {
        const customerSubject = "Your Order Confirmation and Details";
        await sendEmailNotification(customerEmail, customerSubject, customerMessage);
        console.log("Customer email notification sent.");
      } catch (custErr) {
        console.error("Error sending customer email notification:", custErr.message);
      }
    } else {
      console.log("Customer email not provided in orderData.");
    }

    res.json({ success: true, orderResponse });
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
    
    const shiprocketResponse = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/shipments/track?order_id=${order_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Shiprocket API response:", shiprocketResponse.data);
    const orderResponse = shiprocketResponse.data;
    console.log("Parsed orderResponse:", orderResponse);

    if (orderResponse.status && orderResponse.status.toLowerCase() === "confirmed") {
      const customerPhone = orderResponse.billing_phone || orderResponse.customer_phone;
      const customerEmail = orderResponse.billing_email || orderResponse.customer_email;
      console.log("Customer phone:", customerPhone, "Customer email:", customerEmail);

      const notificationMessage = `
Order Confirmation Details:
Order ID: ${orderResponse.order_id || ""}
Shipment ID: ${orderResponse.shipment_id || ""}
Order Status: ${orderResponse.status || ""}
Products: ${
        orderResponse.products
          ? orderResponse.products
              .map(p => `${p.name} (Qty: ${p.quantity || p.units || "Not Provided"})`)
              .join(", ")
          : ""
      }
Order History: ${orderResponse.order_history || ""}
      `.trim();

      console.log("Notification message:", notificationMessage);

      if (customerPhone) {
        try {
          await sendWhatsappNotification(customerPhone, notificationMessage);
          console.log("WhatsApp notification sent.");
        } catch (err) {
          console.error("Error sending WhatsApp notification:", err.message);
        }
      }

      if (customerEmail) {
        try {
          const subject = "Your Order Confirmation and Tracking Details";
          await sendEmailNotification(customerEmail, subject, notificationMessage);
          console.log("Email notification sent to customer.");
        } catch (err) {
          console.error("Error sending email notification to customer:", err.message);
        }
      } else {
        console.log("No valid customer email found for sending notification.");
      }
    } else {
      console.log("Order status is not confirmed. Status:", orderResponse.status);
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
