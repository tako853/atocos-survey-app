import type { Metadata } from "next";
import "./globals.css";
import { ApolloWrapper } from "./apolloWrapper";
import { AuthProvider } from "./auth/context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <ApolloWrapper>{children}</ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}