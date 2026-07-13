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
      <div className="max-w-7xl mx-auto px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col"
            >
              <div className="relative h-52 overflow-hidden">
                {course.thumbnail_url ? (
                  <Base64Image
                    base64={course.thumbnail_url}
                    alt={course.title}
                    width={600}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                )}
                {course.badge && (
                  <span className="absolute top-4 left-4 bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {course.badge}
                  </span>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-2xl font-semibold text-primary">{course.title}</h3>
                <p className="mt-2 text-gray-600 text-sm flex-1">{course.short_description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
                  <span className="flex items-center gap-1 font-semibold text-secondary"><IndianRupee className="w-4 h-4" /> {course.fee}</span>
                </div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}