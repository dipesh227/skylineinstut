"use client";
import { motion } from "motion/react";
import Base64Image from "@/components/Base64Image";
import Link from "next/link";
import { Clock, IndianRupee, ArrowRight } from "lucide-react";
import type { Course } from "@/types";

interface CoursesSectionProps {
  courses: Course[];
}

export default function CoursesSection({ courses }: CoursesSectionProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-24 bg-cream">
      {/* max-w-6xl = 1152px, thoda chhota container */}
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary">
            Our Premium Courses
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Industry‑designed curriculum to launch your career in hospitality
          </p>
        </motion.div>

        {/* Grid with min-w-0 to prevent items from overflowing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col min-w-0"
            >
              {/* Image height aur chhoti */}
              <div className="relative h-24 overflow-hidden">
                {course.thumbnail_url ? (
                  <Base64Image
                    base64={course.thumbnail_url}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
                    No image
                  </div>
                )}
                {course.badge && (
                  <span className="absolute top-1.5 left-1.5 bg-secondary text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    {course.badge}
                  </span>
                )}
              </div>
              {/* Body padding aur chhoti */}
              <div className="p-2.5 flex flex-col flex-1 space-y-1">
                <h3 className="font-heading text-sm font-semibold text-primary leading-tight">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-[11px] leading-snug flex-1 line-clamp-2">
                  {course.short_description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-0.5 font-semibold text-secondary">
                    <IndianRupee className="w-3 h-3" /> {course.fee}
                  </span>
                </div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="mt-2 inline-flex items-center gap-1 text-secondary font-semibold text-[10px] hover:gap-1.5 transition-all"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}