import { Button } from "@/components/ui/button";
import { ArrowRight, Hospital, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EmergencyVisualizer } from "@/components/EmergencyVisualizer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const imageVariants = {
  hidden: { x: 40, opacity: 0, scale: 0.95 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 16, delay: 0.3 },
  },
};

export const LandingPage = () => {
  return (
    <>
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white min-h-[100dvh] flex items-center overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column — Text Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Eyebrow badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-cyan-300 backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" />
                State of Gombe Health Facility Registry
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter leading-none"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-cyan-200 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Welcome to Health
              </span>
              <br />
              <span className="text-white">Facility Tracker</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-[55ch]"
              variants={itemVariants}
            >
              Real-time availability of health services and resources in
              health facilities across Gombe State. Find the care you need
              when you need it most.
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-block"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-cyan-500/25 text-base sm:text-lg px-7 sm:px-8 py-6 sm:py-7 rounded-xl"
                >
                  <Link
                    to="/facilities"
                    className="flex items-center justify-center gap-2"
                  >
                    Find Facilities{" "}
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex items-center gap-6 sm:gap-10 pt-4 sm:pt-6"
              variants={itemVariants}
            >
              {[
                { label: "Active Facilities", value: "24+" },
                { label: "Emergency Beds", value: "200+" },
                { label: "Ambulances", value: "50+" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-left"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.7 + i * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                >
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column — Image Showcase */}
          <motion.div
            className="lg:col-span-5 relative"
            variants={imageVariants}
          >
            {/* Decorative glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 via-teal-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            {/* Image frame */}
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-cyan-500/10 group"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 25px 50px -12px rgba(8, 145, 178, 0.25)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <div className="aspect-[4/3] w-full">
                <img
                  src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/0ac32c1e-9cb1-4dfb-9d73-1c49950a25a7/health-facility-hero-18e6dbd9-1783869249202.webp"
                  alt="Modern health facility in Gombe State"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Bottom gradient overlay with subtle info */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 backdrop-blur-sm">
                  <Hospital className="h-3.5 w-3.5 text-cyan-300" />
                </div>
                <span className="text-xs font-medium text-white/80 drop-shadow-sm">
                  Gombe State Health Facilities
                </span>
              </div>
            </motion.div>

            {/* Floating decorative card */}
            <motion.div
              className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/80 backdrop-blur-md px-3 py-2 shadow-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                <MapPin className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-300">
                6 Facilities across Gombe
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>

      {/* Live Emergency Dispatch & Patient Help Tracker */}
      <EmergencyVisualizer />
    </>
  );
};