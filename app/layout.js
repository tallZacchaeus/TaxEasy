import "./globals.css";

export const metadata = {
  title: "Help Us Build Something Useful — Tax Survey",
  description:
    "A 3-minute survey on paying tax in Nigeria under the new 2026 tax laws.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
