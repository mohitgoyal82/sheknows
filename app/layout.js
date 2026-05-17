export const metadata = {
  title: "She Knows | Women's Health Companion",
  description: "A safe space to ask about your cycle, hormones, skin, mood, energy, gut health, fertility, and everything in between. By Meesha Goyal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#fce8f0" }}>
        {children}
      </body>
    </html>
  );
}
