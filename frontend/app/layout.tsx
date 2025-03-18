import type { Metadata } from "next";
import "./globals.css";
import { ApolloWrapper } from "./apolloWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="ja">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}