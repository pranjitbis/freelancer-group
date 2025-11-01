// components/StickyWhatsApp.js
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const whatsappNumber = "9870519002"; // Replace with your number
const message = "Hello! I want to chat."; // Optional default message

export default function StickyWhatsApp() {
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="sticky-whatsapp"
    >
      <FaWhatsapp size={40} />
    </a>
  );
}
