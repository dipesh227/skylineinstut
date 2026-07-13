"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/types";

export default function EnquiryCTA({ settings }: { settings: SiteSettings }) {
  return (
    <section className="py-24 bg-primary text-white text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-6"
      >
        <h2 className="font-heading text-4xl md:text-5xl font-bold">
          Ready to Start Your Journey?
        </h2>
        <p className="mt-4 text-cream/80 text-lg">
          Get in touch with our admission counsellors today.
        </p>
        <Link
          href={`/enquiry`}
          className="mt-8 inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5" /> Enquire Now
        </Link>
      </motion.div>
    </section>
  );
}