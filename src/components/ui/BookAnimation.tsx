"use client";

import Lottie from "lottie-react";
import bookAnimation from "@/animations/book.json";

export default function BookLoader() {
  return (
    <Lottie
      animationData={bookAnimation}
      loop
      autoplay
      style={{ width: "100%", height: "100%" }}
    />
  );
}
