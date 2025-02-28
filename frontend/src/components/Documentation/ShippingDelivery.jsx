import React, { useState } from "react";
import "./documentation.css"; // Import the CSS file

const ShippingDelivery = () => {
  return (
<>
<section className="documentation-main">
    <div className="container">
      <h2 className="main-heading">Shipping & Delivery</h2>
      
      <div className="content">
        <p className="content-heading"></p>
        <p className="content-descp">
          <b>
We pack your art with extra care and get it to you just as fast as we can. Find out how to estimate shipping fees and delivery times below.
          </b>
        </p>
      </div>

      <div className="content">
        <p className="content-heading">PACKAGING</p>
        <p className="content-descp">
          <ul>
            <li>
Wallpapers & Rolled art are rolled with thick paper / PVC rolls to protect against damage during transit. There is no option to ship these items flat.
            </li>
            <li>
Wall Art are covered securely and placed in adjustable corrugated inserts that lock the frame in position and shipped in corrugated boxes
            </li>
          </ul>
        </p>
      </div>

      <div className="content">
        <p className="content-heading">PROCESSING & DELIVERY</p>
        <p className="content-descp">
        Estimate your art’s arrival by adding the processing and transit times below.
        </p>
      </div>

      <div className="content">
        <p className="content-heading">Processing</p>
        <p className="content-descp">
        Processing Time for Wall Art with standard frames is 3 – 5 business days. Real wood-based frames take 7 business days. Famous Art or custom dimensions take 7 business days.
        </p>
      </div>

      <div className="content">
        <p className="content-heading">Delivery</p>
        <p className="content-descp">
        Transit Time for Standard delivery is 3-5 business days. Expedited delivery is 2-4 business days.
        </p>
      </div>

      <div className="content">
        <p className="content-heading">Please Note:</p>
        <p className="content-descp">
          <ul>
            <li>
This is only a general guideline for our processing times of your art’s product details to see how soon a specific item is expected to ship. Processing begins only when successful payment has been applied to the order. Denied payment authorizations and mailed payments will delay processing start times.
            </li>
            <li>
If you select Expedited delivery for your order, you will receive priority processing which shortens the processing time by up to three days.
            </li>
            <li>
If you order a combination of in-house and special order posters and prints, the order processing time may be 5-7 days (we will ship those items together in one shipment).
            </li>
            <li>
In order to offer you the lowest shipping rates, we combine similar items in one shipment. In the event that an frame is temporarily out of stock or on back order, we may hold the rest of your items if we expect the item to be restocked soon. As soon as it arrives in our warehouse, we will ship your entire order to you in one shipment.
            </li>
            <li>
Average transit times are based on orders shipping to addresses in Tier 1 and 2 cities of India.
            </li>
          </ul>
        </p>
      </div>

      <div className="content">
        <p className="content-heading">Shipping Rates</p>
        <p className="content-descp">
        Shipping rates vary depending on the type of art you order and how quickly you’d like it to arrive. Contact us for expedited shipping arrangements.
        </p>
      </div>

      <div className="content">
        <p className="content-heading">TRACKING YOUR ORDER</p>
        <p className="content-descp">
        After your order is placed and processed, someone in the team will connect with you via Whatsapp or Phone and communicate tracking IDs of relevant shipping vendor, best suited for your shipping address. You will be able to track these shipments online using relevant shipping vendor service on their respective websites.
        </p>
      </div>

      <div className="content">
        <p className="content-heading">FAQs</p>
        <p className="content-descp">
          <ul>
            <li>
              <b>
Is my package insured?
              </b>
Wall&Tone.com guarantees your satisfaction and we will give you a refund or a replacement for purchased items you are not satisfied with. In the remote event that your package is lost or damaged upon arrival, please contact our Customer Support Team.
            </li>

<li>
  <b>
What happens if only a portion of my order is available for immediate shipment?
  </b>
  In order to offer you the lowest shipping rates, we combine similar items in one shipment subject to the processing times of all items in the shipment (see Processing & Delivery Times). If a temporary out of stock frame should prevent available items on your order from shipping when expected, you may specifically request that the available items be shipped separately. This will not affect your shipping charges, but you must contact our Customer Support Team directly.
</li>

          </ul>
        </p>
      </div>

    </div>
</section>
</>
  );
};

export default ShippingDelivery;
