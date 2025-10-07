"use client"

import { Toaster } from "react-hot-toast"

export default function ToastHost() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { fontSize: 14 },
        success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  )
}
