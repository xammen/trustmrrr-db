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
      <head>
        <script src="https://cdn.visitors.now/v.js" data-token="b0adf01d-fa2b-401e-bcab-cfc6262df06b" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
