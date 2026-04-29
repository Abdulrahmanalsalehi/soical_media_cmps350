export const metadata = {
  title: "SocialX",
  description: "A social media platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
