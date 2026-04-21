import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Snack It | Campus Food Delivery",
  description: "Premium food delivery for college campuses",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
