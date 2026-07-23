import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";

import "./globals.css";

export const metadata: Metadata = {
  title: "TYNYS Mektep",
  description:
    "TYNYS білім беру ұйымдарына климаттық жағдайды ескеріп шешім қабылдауға көмектеседі.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="kk">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
