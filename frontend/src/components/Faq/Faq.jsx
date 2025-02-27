import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Faq.css"; // Import the CSS file

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How to Place an Order?",
      answer:
        'Place the product(s) you wish to order in your shopping cart by clicking on the "Add to Cart" button located next to the product image. When you\'re ready to complete your order, click “Checkout” from within your cart and follow the instructions.',
    },
    {
      question: "Payment Options",
      answer:
        "We accept all major credit and debit cards, Net banking, Payment Wallets, and UPI transactions. We also accept Paytm, Google Pay, or direct bank transfers on special request.",
    },
    {
      question: "Order Cancellations & Modifications",
      answer:
        "To cancel an order that has not yet shipped, have your order number available and contact our Customer Support Team. We are unable to process cancellations for items that have already shipped.",
    },
    {
      question: "Product Information",
      answer:
        "Feel free to connect with Customer Care to learn more about our Product Types, Framing, and Other Services to find the art that best suits your style and budget. Our Customer Support Team is happy to assist!",
    },
    {
      question: "How do I find a specific item from your catalog?",
      answer:
        "Enter the exact name of the artwork or the catalog item number into the search box that appears at the top of each page.",
    },
    {
      question: "Does the image on your site accurately represent what I will be sent?",
      answer:
        "We strive for a high degree of image accuracy. However, in some cases, the visual representation may be approximate. Occasionally, minor modifications occur between printing runs. If you are not satisfied with the product you receive, you may return it within 30 days.",
    },
    {
      question: "How accurate are the item dimensions listed on your web pages?",
      answer:
        "Wall&Tone verifies the dimensions of all images on our site, but due to industry standards, sizes can vary slightly up to (1¼\"). If you are not satisfied with the product you receive, you may return it within 30 days.",
    },
  ];

  return (
    <motion.div 
      className="faq-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2>FAQ</h2>
      <div className="faq-accordion">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button className="faq-button" onClick={() => toggleFAQ(index)}>
              {faq.question}
              <motion.span 
                className="faq-icon"
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {openIndex === index ? "-" : "+"}
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div 
                  className="faq-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  layout
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FAQ;
