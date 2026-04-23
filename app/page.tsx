"use client";
import { Header } from "./components/header";
import { FeatureSection } from "./components/cards";
import { ActionButtons } from "./components/action";
import { KeyFeatures } from "./components/key-features";
import { Footer } from "./components/footer";
export default function Home() {
  return (
    <div>
      <Header />
      <FeatureSection />
      <ActionButtons />
      <KeyFeatures />
      <Footer />
    </div>
  );
}
