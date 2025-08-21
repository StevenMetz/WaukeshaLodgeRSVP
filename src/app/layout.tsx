import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waukesha Lodge No. 37 – RSVP",
  description: "Waukesha Lodge No. 37's RSVP page for the Steak Dinner Event",
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
