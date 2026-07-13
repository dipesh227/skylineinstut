"use client";
import { motion } from "motion/react";
import Base64Image from "@/components/Base64Image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteSettings } from "@/types";

interface HeroProps {
  settings: SiteSettings;
}

export default function HeroSection({ settings }: HeroProps) {
  const { hero_headline, hero_subtext, hero_cta_text, hero_bg_image } = settings;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {hero_bg_image && (
        <div className="absolute inset-0 z-0">
          <Base64Image
            base64={hero_bg_image}
            alt="Background"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm" />
        </div>
      )}
      {!hero_bg_image && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary-light to-accent" />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg"
        >
          {hero_headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mt-6 text-lg md:text-xl text-cream/90 max-w-2xl mx-auto"
        >
          {hero_subtext}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="mt-10"
        >
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-semibold px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl"
          >
            {hero_cta_text} <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}