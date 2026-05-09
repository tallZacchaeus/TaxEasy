import "./globals.css";

export const metadata = {
  title: "TaxEasy Survey — Help Us Build Better Tax Tools",
  description:
    "A 3-minute survey to help shape TaxEasy, a mobile app for paying tax in Nigeria under the new 2026 tax laws.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
