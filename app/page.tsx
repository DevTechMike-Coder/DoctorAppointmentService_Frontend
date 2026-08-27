"use client";

import Link from "next/link";
import { Calendar, Stethoscope, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import type { Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas overflow-hidden">
      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-b border-ink/10 bg-white/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-ink tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block animate-pulse" />
            MedBook
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink/70 hover:text-ink transition px-3 py-2"
            >
              Sign in
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="text-sm font-medium bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-lg transition shadow-sm hover:shadow"
              >
                Get started
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-canvas">
        <SlotPattern />

        {/* Ambient gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto px-6 py-28 text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas/10 border border-canvas/15 text-canvas/80 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-light" />
            <span>Modern healthcare scheduling simplified</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.15] max-w-3xl mx-auto mb-6 tracking-tight"
          >
            Book a doctor in a few taps, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-canvas via-canvas/90 to-teal-light">
              not a few calls.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-canvas/75 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light"
          >
            Browse real availability, pick a time that works, and get confirmed —
            no hold music, no back-and-forth.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-7 py-3.5 transition shadow-lg shadow-teal/25"
              >
                <span>Find a doctor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl border border-canvas/20 text-canvas text-sm font-medium px-7 py-3.5 hover:bg-canvas/10 transition backdrop-blur-sm"
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="grid sm:grid-cols-3 gap-8"
        >
          <Feature
            icon={<Calendar className="w-5 h-5" />}
            title="Real-time slots"
            description="See exactly when a doctor is free — no guessing, no double-booked appointments."
          />
          <Feature
            icon={<Stethoscope className="w-5 h-5" />}
            title="Every specialty"
            description="From general practice to cardiology, find the right doctor for what you need."
          />
          <Feature
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Your data, protected"
            description="Every booking and record is handled with the same care as your visit."
          />
        </motion.div>
      </section>

      {/* For doctors */}
      <section className="border-t border-ink/10 bg-white relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-6xl mx-auto px-6 py-20 flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10"
        >
          <div className="max-w-md text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl text-ink mb-3 font-semibold">
              Are you a doctor?
            </h2>
            <p className="text-sm sm:text-base text-ink/65 leading-relaxed">
              Set your availability once and let patients book directly — no phone
              tag, no scheduling back-and-forth.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-6 py-3.5 transition shadow-sm hover:shadow-md shrink-0"
            >
              <span>Join as a doctor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-ink/10 bg-canvas">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink/40">
          <div>© {new Date().getFullYear()} MedBook. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-ink transition">Sign in</Link>
            <Link href="/register" className="hover:text-ink transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group p-6 rounded-2xl bg-white border border-ink/5 shadow-xs hover:shadow-md transition duration-200 text-center sm:text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-teal-light text-teal-dark flex items-center justify-center mb-5 mx-auto sm:mx-0 group-hover:scale-110 group-hover:bg-teal group-hover:text-white transition duration-300">
        {icon}
      </div>
      <h3 className="font-display text-lg text-ink font-semibold mb-2">{title}</h3>
      <p className="text-sm text-ink/60 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function SlotPattern() {
  const dots = Array.from({ length: 60 });
  return (
    <div className="absolute inset-0 opacity-[0.08] grid grid-cols-10 gap-6 p-10 pointer-events-none">
      {dots.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, (i % 5 === 0 ? 0.9 : 0.4), 0.2],
            scale: [1, (i % 7 === 0 ? 1.4 : 1), 1],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: (i % 10) * 0.2,
            ease: "easeInOut",
          }}
          className="w-1.5 h-1.5 rounded-full bg-canvas"
        />
      ))}
    </div>
  );
}