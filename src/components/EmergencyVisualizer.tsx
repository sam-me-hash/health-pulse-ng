"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ambulance,
  Heart,
  MapPin,
  Cross,
  Navigation,
  Clock,
  Gauge,
  Activity,
  Radio,
  Plus,
  Trash2,
  Shield,
  Target,
  CircleParking,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface FacilityNode {
  id: string;
  name: string;
  x: number; // percent 0-100
  y: number;
  beds: number;
  ambulances: number;
  parkedAmbulances: number;
}

interface PatientBeacon {
  id: string;
  name: string;
  x: number;
  y: number;
  severity: "critical" | "moderate" | "stable";
  timestamp: number;
}

interface AmbulanceUnit {
  id: string;
  label: string;
  status: "idle" | "en-route" | "transporting";
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number; // 0-1
  patientId: string | null;
  destinationFacilityId: string | null;
  speed: number; // km/h
  eta: number; // minutes
}

interface DispatchLog {
  time: string;
  message: string;
  type: "info" | "critical" | "success";
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const FACILITIES: FacilityNode[] = [
  { id: "f1", name: "Gombe Specialist Hospital", x: 25, y: 30, beds: 200, ambulances: 5, parkedAmbulances: 2 },
  { id: "f2", name: "Federal Teaching Hospital", x: 70, y: 25, beds: 350, ambulances: 8, parkedAmbulances: 3 },
  { id: "f3", name: "Ahajas Memorial Hospital", x: 45, y: 65, beds: 100, ambulances: 2, parkedAmbulances: 1 },
  { id: "f4", name: "Zainab Bulkachuwa Hospital", x: 80, y: 70, beds: 120, ambulances: 4, parkedAmbulances: 0 },
  { id: "f5", name: "Doma Hospital", x: 15, y: 75, beds: 80, ambulances: 3, parkedAmbulances: 2 },
  { id: "f6", name: "Mahdi Memorial Hospital", x: 55, y: 45, beds: 90, ambulances: 2, parkedAmbulances: 1 },
];

/* Bay offset per facility (right/below facility node) */
const BAY_OFFSETS: Record<string, { bx: number; by: number }> = {
  f1: { bx: 3, by: 3.5 },
  f2: { bx: -3.5, by: 3.5 },
  f3: { bx: 3, by: 2.5 },
  f4: { bx: -3, by: 2.5 },
  f5: { bx: 3, by: 2.5 },
  f6: { bx: -3, by: 3.5 },
};

const AMBULANCE_NAMES = ["AMB-01", "AMB-02", "AMB-03", "AMB-04", "AMB-05", "AMB-06"];
const PATIENT_NAMES = [
  "Pantami Ward",
  "Jeka Dafaru",
  "Tunfure Estate",
  "Bolari Clinic",
  "Nafada Town",
  "Kaltungo",
  "Dukku",
  "Bajoga",
  "Billiri",
  "Akko LGA",
];

const SEVERITY_LEVELS: Array<PatientBeacon["severity"]> = ["critical", "moderate", "stable"];

function randomSeverity(): PatientBeacon["severity"] {
  return SEVERITY_LEVELS[Math.floor(Math.random() * SEVERITY_LEVELS.length)];
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function findNearestFacility(x: number, y: number, excludeId?: string): FacilityNode {
  let best = FACILITIES[0];
  let bestDist = Infinity;
  for (const f of FACILITIES) {
    if (f.id === excludeId) continue;
    const dx = f.x - x;
    const dy = f.y - y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }
  return best;
}

function findNearestAvailableAmbulance(
  ambulances: AmbulanceUnit[],
  px: number,
  py: number
): AmbulanceUnit | null {
  let best: AmbulanceUnit | null = null;
  let bestDist = Infinity;
  for (const a of ambulances) {
    if (a.status !== "idle") continue;
    const dx = a.x - px;
    const dy = a.y - py;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export const EmergencyVisualizer = () => {
  /* ---- state ---- */
  const [patients, setPatients] = useState<PatientBeacon[]>([]);
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>(() =>
    AMBULANCE_NAMES.map((name, i) => {
      const f = FACILITIES[i % FACILITIES.length];
      const bay = BAY_OFFSETS[f.id] || { bx: 3, by: 3 };
      const bayX = f.x + bay.bx;
      const bayY = f.y + bay.by;
      return {
        id: name,
        label: name,
        status: "idle" as const,
        x: bayX,
        y: bayY,
        targetX: bayX,
        targetY: bayY,
        progress: 1,
        patientId: null,
        destinationFacilityId: null,
        speed: 0,
        eta: 0,
      };
    })
  );
  const [dispatchLog, setDispatchLog] = useState<DispatchLog[]>([
    { time: now(), message: "Emergency dispatch system online", type: "info" },
    { time: now(), message: "All 6 ambulances awaiting deployment", type: "success" },
  ]);
  const [activeTelemetry, setActiveTelemetry] = useState<{
    activeCalls: number;
    enRoute: number;
    transporting: number;
    avgEta: number;
  }>({ activeCalls: 0, enRoute: 0, transporting: 0, avgEta: 0 });

  const logRef = useRef<HTMLDivElement>(null);
  const animFrame = useRef(0);
  const lastSpawn = useRef(0);

  /* ---- helpers ---- */
  const addLog = useCallback((message: string, type: DispatchLog["type"]) => {
    setDispatchLog((prev) => [...prev.slice(-49), { time: now(), message, type }]);
  }, []);

  const spawnEmergency = useCallback(() => {
    if (patients.length >= 6) {
      toast.error("All ambulance units are busy. Wait for a unit to become available.");
      return;
    }

    const name = PATIENT_NAMES[Math.floor(Math.random() * PATIENT_NAMES.length)];
    const x = randomBetween(5, 95);
    const y = randomBetween(5, 95);
    const severity = randomSeverity();

    const newPatient: PatientBeacon = {
      id: `p-${Date.now()}`,
      name,
      x,
      y,
      severity,
      timestamp: Date.now(),
    };

    setPatients((prev) => [...prev, newPatient]);
    addLog(`SOS call received from ${name} (${severity.toUpperCase()})`, "critical");

    const ambulance = findNearestAvailableAmbulance(ambulances, x, y);
    if (!ambulance) {
      toast.error(`No available ambulances for ${name}`);
      return;
    }

    const facility = findNearestFacility(x, y);
    const dist = Math.sqrt((x - ambulance.x) ** 2 + (y - ambulance.y) ** 2);
    const eta = Math.round(dist * 0.4 + randomBetween(1, 3));

    addLog(`${ambulance.label} dispatched to ${name} (ETA: ${eta} min)`, "info");

    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === ambulance.id
          ? {
              ...a,
              status: "en-route",
              targetX: x,
              targetY: y,
              progress: 0,
              patientId: newPatient.id,
              speed: 60 + Math.round(randomBetween(-10, 20)),
              eta,
            }
          : a
      )
    );

    toast.success(`${ambulance.label} dispatched to ${name}`, {
      description: `ETA: ${eta} minutes`,
      icon: <Ambulance className="h-4 w-4 text-cyan-400" />,
    });
  }, [patients, ambulances, addLog]);

  const clearAll = useCallback(() => {
    setPatients([]);
    setAmbulances((prev) =>
      prev.map((a, i) => {
        const f = FACILITIES[i % FACILITIES.length];
        const bay = BAY_OFFSETS[f.id] || { bx: 3, by: 3 };
        const bayX = f.x + bay.bx;
        const bayY = f.y + bay.by;
        return {
          ...a,
          status: "idle",
          x: bayX,
          y: bayY,
          targetX: bayX,
          targetY: bayY,
          progress: 1,
          patientId: null,
          destinationFacilityId: null,
          speed: 0,
          eta: 0,
        };
      })
    );
    addLog("All active feeds cleared — ambulances returned to bays", "info");
    toast.success("Emergency feeds cleared, ambulances parked");
  }, [addLog]);

  /* ---- animation loop ---- */
  useEffect(() => {
    let running = true;
    const step = () => {
      if (!running) return;
      animFrame.current = requestAnimationFrame(step);

      setAmbulances((prev) =>
        prev.map((a) => {
          // Idle ambulances smoothly glide back to their facility's bay
          if (a.status === "idle") {
            const f = FACILITIES.find((f) => f.id === a.facilityId);
            if (f) {
              const bay = BAY_OFFSETS[f.id] || { bx: 3, by: 3 };
              const bayX = f.x + bay.bx;
              const bayY = f.y + bay.by;
              const dx = bayX - a.x;
              const dy = bayY - a.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0.05) {
                return { ...a, x: a.x + dx * 0.03, y: a.y + dy * 0.03 };
              }
            }
            return a;
          }

          const newProgress = Math.min(a.progress + 0.008, 1);
          const ease = 1 - Math.pow(1 - newProgress, 3); // cubic ease-out
          const x = a.x + (a.targetX - a.x) * 0.02;
          const y = a.y + (a.targetY - a.y) * 0.02;

          // Check if arrived
          if (newProgress >= 1) {
            if (a.status === "en-route") {
              // Arrived at patient - pick up and head to facility
              const facility = findNearestFacility(a.targetX, a.targetY);
              addLog(`${a.label} arrived at scene, loading patient`, "success");
              return {
                ...a,
                status: "transporting",
                targetX: facility.x,
                targetY: facility.y,
                progress: 0,
                destinationFacilityId: facility.id,
                speed: 50 + Math.round(randomBetween(-10, 10)),
                eta: Math.round(Math.sqrt((a.x - facility.x) ** 2 + (a.y - facility.y) ** 2) * 0.4 + 1),
              };
            } else if (a.status === "transporting") {
              // Arrived at facility
              const facility = FACILITIES.find((f) => f.id === a.destinationFacilityId);
              addLog(
                `${a.label} arrived at ${facility?.name ?? "facility"} with patient`,
                "success"
              );
              // Remove patient
              if (a.patientId) {
                setPatients((prev) => prev.filter((p) => p.id !== a.patientId));
              }
              return {
                ...a,
                status: "idle",
                patientId: null,
                destinationFacilityId: null,
                speed: 0,
                eta: 0,
                progress: 1,
              };
            }
          }

          return { ...a, x: x + (a.targetX - x) * 0.02, y: y + (a.targetY - y) * 0.02, progress: newProgress, speed: a.status === "en-route" ? 60 + Math.round(randomBetween(-5, 10)) : 40 + Math.round(randomBetween(-5, 10)), eta: Math.max(1, a.eta - 0.02) };
        })
      );

      // Auto-spawn every 12-18s if fewer than 2 patients
      const nowMs = Date.now();
      if (nowMs - lastSpawn.current > 12000 && patients.length < 2 && Math.random() < 0.05) {
        lastSpawn.current = nowMs;
        // Defer to avoid setState-in-requestAnimationFrame issues
        setTimeout(() => spawnEmergency(), 100);
      }

      // Update telemetry
      setPatients((p) => p);
      setAmbulances((a) => {
        const enRoute = a.filter((x) => x.status === "en-route").length;
        const transporting = a.filter((x) => x.status === "transporting").length;
        const etas = a.filter((x) => x.eta > 0).map((x) => x.eta);
        const avgEta = etas.length ? Math.round(etas.reduce((s, v) => s + v, 0) / etas.length) : 0;
        setActiveTelemetry({
          activeCalls: enRoute + transporting,
          enRoute,
          transporting,
          avgEta,
        });
        return a;
      });
    };

    animFrame.current = requestAnimationFrame(step);
    return () => {
      running = false;
      cancelAnimationFrame(animFrame.current);
    };
  }, [patients.length, addLog, spawnEmergency]);

  /* ---- auto-scroll log ---- */
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [dispatchLog]);

  /* ---- severity colors ---- */
  const severityColor = (s: PatientBeacon["severity"]) => {
    switch (s) {
      case "critical": return "text-red-400 bg-red-500/20 border-red-500/30";
      case "moderate": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "stable": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    }
  };

  const statusColor = (s: AmbulanceUnit["status"]) => {
    switch (s) {
      case "idle": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "en-route": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "transporting": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
  };

  const logTypeColor = (t: DispatchLog["type"]) => {
    switch (t) {
      case "critical": return "text-red-400";
      case "info": return "text-slate-400";
      case "success": return "text-emerald-400";
    }
  };

  return (
    <section className="relative w-full bg-slate-950 py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 mb-4">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase">
              Live Dispatch
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter text-white">
            Emergency Response{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
              Command Center
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real-time tracking of ambulances, active patients, and dispatch telemetry across Gombe State.
          </p>
        </motion.div>

        {/* Main grid: Map + Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* ---- Radar Map ---- */}
          <motion.div
            className="lg:col-span-8 relative rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden min-h-[400px] sm:min-h-[500px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            {/* Radar sweep */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.06)_20%,transparent_40%)] animate-spin-slow" />
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1="0" y1={i * 10} x2="100" y2={i * 10}
                    stroke="rgba(148,163,184,0.06)" strokeWidth="0.3"
                  />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * 10} y1="0" x2={i * 10} y2="100"
                    stroke="rgba(148,163,184,0.06)" strokeWidth="0.3"
                  />
                ))}
                {/* Concentric rings */}
                <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(6,182,212,0.04)" strokeWidth="0.3" />
              </svg>
            </div>

            {/* SVG overlay for entities */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Road connections */}
              {FACILITIES.map((f, i) =>
                FACILITIES.slice(i + 1).map((g, j) => {
                  // Only draw some roads for visual clarity
                  if ((i + j) % 2 !== 0) return null;
                  return (
                    <line
                      key={`road-${f.id}-${g.id}`}
                      x1={f.x} y1={f.y} x2={g.x} y2={g.y}
                      stroke="rgba(148,163,184,0.08)"
                      strokeWidth="0.4"
                      strokeDasharray="2,3"
                    />
                  );
                })
              )}

              {/* Facilities */}
              {FACILITIES.map((f) => {
                const bay = BAY_OFFSETS[f.id];
                return (
                  <g key={f.id}>
                    <circle cx={f.x} cy={f.y} r="1.8" fill="rgba(6,182,212,0.3)" stroke="rgba(6,182,212,0.6)" strokeWidth="0.3" />
                    <circle cx={f.x} cy={f.y} r="0.6" fill="#06b6d4" />
                    {/* Parking bay outline */}
                    {bay && (
                      <g>
                        {/* Dashed bay ring */}
                        <circle
                          cx={f.x + bay.bx}
                          cy={f.y + bay.by}
                          r="2.5"
                          fill="none"
                          stroke="rgba(16,185,129,0.25)"
                          strokeWidth="0.35"
                          strokeDasharray="1.5,1.5"
                        />
                        {/* Bay label */}
                        <text
                          x={f.x + bay.bx}
                          y={f.y + bay.by + 3.8}
                          textAnchor="middle"
                          fill="rgba(16,185,129,0.35)"
                          fontSize="0.5"
                          fontFamily="monospace"
                        >
                          PARKING
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Ambulance paths */}
              {ambulances.filter(a => a.status !== "idle").map((a) => (
                <line
                  key={`path-${a.id}`}
                  x1={a.x} y1={a.y} x2={a.targetX} y2={a.targetY}
                  stroke={a.status === "en-route" ? "rgba(251,191,36,0.2)" : "rgba(6,182,212,0.2)"}
                  strokeWidth="0.3"
                  strokeDasharray="1,2"
                />
              ))}
            </svg>

            {/* Patient beacons (absolute positioned) */}
            <AnimatePresence>
              {patients.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute z-20"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                >
                  {/* Ripple rings */}
                  <span className="absolute inset-[-8px] rounded-full border-2 border-red-500/40 animate-ping" />
                  <span className="absolute inset-[-16px] rounded-full border border-red-500/20 animate-ping" style={{ animationDelay: "0.3s" }} />
                  <span className="absolute inset-[-24px] rounded-full border border-red-500/10 animate-ping" style={{ animationDelay: "0.6s" }} />
                  {/* Beacon body */}
                  <div className={cn(
                    "relative flex items-center justify-center w-8 h-8 rounded-full border-2",
                    p.severity === "critical" ? "bg-red-500/30 border-red-400" :
                    p.severity === "moderate" ? "bg-amber-500/30 border-amber-400" :
                    "bg-emerald-500/30 border-emerald-400"
                  )}>
                    <Heart className={cn(
                      "h-4 w-4",
                      p.severity === "critical" ? "text-red-300" :
                      p.severity === "moderate" ? "text-amber-300" :
                      "text-emerald-300"
                    )} />
                  </div>
                  {/* Label */}
                  <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded">
                      {p.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Ambulance units (absolute positioned) */}
            <AnimatePresence>
              {ambulances.map((a) => (
                <motion.div
                  key={a.id}
                  className="absolute z-10"
                  style={{ left: `${a.x}%`, top: `${a.y}%`, transform: "translate(-50%, -50%)" }}
                  animate={{ left: `${a.x}%`, top: `${a.y}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 20, mass: 0.5 }}
                >
                  <div className={cn(
                    "relative flex items-center justify-center w-7 h-7 rounded-full border-2",
                    a.status === "idle" ? "bg-emerald-500/20 border-emerald-500/50" :
                    a.status === "en-route" ? "bg-amber-500/20 border-amber-500/50" :
                    "bg-cyan-500/20 border-cyan-500/50"
                  )}>
                    {a.status === "idle" && (
                      <>
                        {/* Breathing glow ring */}
                        <span className="absolute inset-[-6px] rounded-full border-2 border-emerald-400/20 animate-pulse" style={{ animationDuration: "3s" }} />
                        <span className="absolute inset-[-12px] rounded-full border border-emerald-400/10 animate-pulse" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
                      </>
                    )}
                    {a.status === "en-route" && (
                      <span className="absolute inset-[-4px] rounded-full border-2 border-amber-400/30 animate-ping" />
                    )}
                    {a.status === "transporting" && (
                      <>
                        <span className="absolute inset-[-4px] rounded-full border-2 border-cyan-400/30 animate-ping" />
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      </>
                    )}
                    <Ambulance className={cn(
                      "h-3.5 w-3.5",
                      a.status === "idle" ? "text-emerald-300" :
                      a.status === "en-route" ? "text-amber-300" :
                      "text-cyan-300"
                    )} />
                  </div>
                  {/* Label */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className={cn(
                      "text-[9px] font-bold px-1 py-0.5 rounded",
                      a.status === "idle" ? "text-emerald-400" :
                      a.status === "en-route" ? "text-amber-400" :
                      "text-cyan-400"
                    )}>
                      {a.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Facility labels */}
            {FACILITIES.map((f) => (
              <div
                key={`label-${f.id}`}
                className="absolute z-5"
                style={{ left: `${f.x}%`, top: `${f.y + 3}%`, transform: "translate(-50%, 0)" }}
              >
                <div className="flex items-center gap-1">
                  <Cross className="h-2.5 w-2.5 text-cyan-400/60" />
                  <span className="text-[8px] font-medium text-cyan-400/60 whitespace-nowrap">
                    {f.name}
                  </span>
                </div>
                {f.parkedAmbulances > 0 && (
                  <motion.div
                    className="flex items-center gap-0.5 mt-0.5 ml-3.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <CircleParking className="h-2.5 w-2.5 text-emerald-400" />
                    <motion.span
                      className="text-[8px] font-bold text-emerald-400 bg-emerald-500/20 px-1 rounded"
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {f.parkedAmbulances}
                    </motion.span>
                  </motion.div>
                )}
              </div>
            ))}

            {/* Bottom-left controls overlay */}
            <div className="absolute bottom-3 left-3 z-30 flex gap-2">
              <Button
                size="sm"
                onClick={spawnEmergency}
                className="h-8 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Simulate Distress Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearAll}
                className="h-8 text-xs gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </motion.div>

          {/* ---- Dispatch Console ---- */}
          <motion.div
            className="lg:col-span-4 space-y-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            {/* Telemetry Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5" />
                  Telemetry
                </h3>
                <Badge variant="outline" className={cn(
                  "text-[10px] border",
                  activeTelemetry.activeCalls > 0 ? "border-amber-500/30 text-amber-400" : "border-emerald-500/30 text-emerald-400"
                )}>
                  {activeTelemetry.activeCalls > 0 ? `${activeTelemetry.activeCalls} Active` : "Standby"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "En Route", value: activeTelemetry.enRoute, icon: Navigation, color: "text-amber-400" },
                  { label: "Transporting", value: activeTelemetry.transporting, icon: Activity, color: "text-cyan-400" },
                  { label: "Avg ETA", value: `${activeTelemetry.avgEta}m`, icon: Clock, color: "text-slate-300" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-1 rounded-lg bg-slate-800/50 p-2">
                    <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                    <span className={cn("text-lg font-bold", stat.color)}>{stat.value}</span>
                    <span className="text-[9px] text-slate-500">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambulance Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-sm p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Fleet Status
              </h3>
              <div className="space-y-1.5">
                {ambulances.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Ambulance className={cn(
                        "h-3 w-3",
                        a.status === "idle" ? "text-emerald-400" :
                        a.status === "en-route" ? "text-amber-400" : "text-cyan-400"
                      )} />
                      <span className="text-slate-300 font-medium">{a.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.status !== "idle" && (
                        <span className="text-slate-500 text-[10px]">{a.eta}min</span>
                      )}
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                        statusColor(a.status)
                      )}>
                        {a.status === "en-route" ? "En Route" : a.status === "transporting" ? "Transport" : "Idle"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch Log */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-sm p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Target className="h-3.5 w-3.5" />
                Dispatch Log
              </h3>
              <div
                ref={logRef}
                className="h-[180px] overflow-y-auto scrollbar-thin space-y-1 pr-1"
              >
                {dispatchLog.map((entry, i) => (
                  <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
                    <span className="text-slate-600 shrink-0 font-mono">{entry.time}</span>
                    <span className={cn("shrink-0", logTypeColor(entry.type))}>
                      [{entry.type.toUpperCase()}]
                    </span>
                    <span className="text-slate-400">{entry.message}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  System online
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};