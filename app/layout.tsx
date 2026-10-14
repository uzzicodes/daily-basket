import type { Metadata } from "next";
import "./globals.css";
import "./professional-theme.css";
import "./alfatah-theme.css";
import "./order-desk.css";

export const metadata: Metadata = {
  title: "Askari Departmental Store | Lahore Groceries",
  description: "Everyday grocery essentials, trusted Pakistani brands and doorstep delivery across Lahore. Askari Departmental Store.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
