import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spin Duel — One spin. One winner.",
  description: "A premium 1v1 spin game demo. Play with virtual points only.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
