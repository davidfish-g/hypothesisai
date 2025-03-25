import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HypothesisAI - AI Hypothesis Evaluation Platform",
  description: "A platform for domain experts to evaluate AI-generated scientific hypotheses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <div className="flex h-full">
            <div className="fixed h-full">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto ml-[200px]">
              <div className="container mx-auto px-4 py-8">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
