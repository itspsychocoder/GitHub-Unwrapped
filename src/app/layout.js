import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";
import { getSession } from "next-auth/react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  const session = await getSession()
  return (
    
    <html data-theme="synthwave" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers session={session}>

        <Navbar/>
        {children}


          </Providers>
        <Footer/>
      </body>
    </html>
   
  );
}
