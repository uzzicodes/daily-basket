import type { Metadata } from "next";
import "./globals.css";
import "./professional-theme.css";
import "./alfatah-theme.css";
import "./order-desk.css";
import 'leaflet/dist/leaflet.css';
import './delivery.css';
import './shop.css';
import './brand.css';
import './operations.css';

export const metadata: Metadata = {
  title: "Daily Basket | Lahore Groceries",
  description: "Grocery essentials and household favourites from Daily Basket. Delivery within 7 km of our PGECHS Phase 1 store in Lahore.",
  icons: {
    icon: "/brand/daily-basket-app-icon-v2.png",
    shortcut: "/brand/daily-basket-app-icon-v2.png",
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
