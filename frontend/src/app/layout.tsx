import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ParticleBackground from "@/components/ParticleBackground";
import GamificationToast from "@/components/GamificationToast";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CareerPilot AI - Your Futuristic AI Career Mentor",
  description: "Get personalized career guidance, interactive roadmaps, ATS resume analysis, mock interviews, and skill gap mapping with CareerPilot AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <AuthProvider>
          <ParticleBackground />
          <div className="relative z-10 min-h-screen flex flex-col justify-between">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <GamificationToast />
        </AuthProvider>
      </body>
    </html>
  );
}

