import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "trustmrrr ༼ つ ╹ ╹ ༽つ",
  description: "986 startups. every mrr. every revenue. scraped, verified, searchable.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
