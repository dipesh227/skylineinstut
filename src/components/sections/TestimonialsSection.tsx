"use client";
import { motion } from "motion/react";
import Base64Image from "@/components/Base64Image";
import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/types";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary">
            What Our Students Say
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Real stories from alumni now working in top hotels
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-cream p-6 rounded-2xl shadow-md hover:shadow-xl transition-all relative"
            >
              <Quote className="absolute top-4 right-4 text-secondary/20 w-8 h-8" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {testimonial.photo_url ? (
                    <Base64Image
                      base64={testimonial.photo_url}
                      alt={testimonial.student_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-cream flex items-center justify-center text-lg font-bold">
                      {testimonial.student_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-primary">{testimonial.student_name}</h4>
                  <p className="text-xs text-gray-500">{testimonial.course_name}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-gray-700 text-sm italic">“{testimonial.text}”</p>
              {testimonial.placement_hotel && (
                <p className="mt-3 text-xs font-semibold text-secondary">
                  🏨 Placed at: {testimonial.placement_hotel}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}