import type { Metadata } from "next";
import "./globals.css";
import "./professional-theme.css";
import "./alfatah-theme.css";
import "./order-desk.css";
import 'leaflet/dist/leaflet.css';
import './delivery.css';
import './shop.css';
import './brand.css';

export const metadata: Metadata = {
  title: "Daily Basket | Lahore Groceries",
  description: "Grocery essentials and household favourites from Daily Basket. Delivery within 5 km of our PGECHS Phase 1 store in Lahore.",
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
