"use client";

import { Suspense } from "react";
import Reset from "./Reset";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      }
    >
      <Reset />
    </Suspense>
  );
}
