"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import {
  ArrowRight, Zap, ShieldCheck, BarChart3, CheckCircle, Star,
  Upload, Brain, Target, FileSearch, MessageSquare, Mail,
  Users, Award, ChevronDown, Sparkles, Globe
} from "lucide-react";
import { PillNav } from "@/components/ui/pill-nav";
import { PrismBackground } from "@/components/ui/prism";
import { LightfallBackground } from "@/components/ui/lightfall";
import { ElectricBorder } from "@/components/ui/electric-border";
import { TextType } from "@/components/ui/text-type";

// ── Scroll reveal hook ──────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function RevealSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Static data ─────────────────────────────────────────────────────────────

// ── Cycling Hero Card Data ──────────────────────────────────────────────────
const heroCards = [
  {
    title: "Software Engineer Resume",
    subtitle: "vs. Google SDE-II posting",
    score: 85,
    scoreColor: "#2563EB",
    metrics: [
      { label: "Keyword Match", value: 88, color: "#2563EB" },
      { label: "Formatting", value: 92, color: "#059669" },
      { label: "Bullet Impact", value: 76, color: "#D97706" },
    ],
    tags: [
      { text: "Missing: React", type: "missing" as const },
      { text: "Missing: TypeScript", type: "missing" as const },
      { text: "Found: Python", type: "found" as const },
      { text: "Found: AWS", type: "found" as const },
    ],
  },
  {
    title: "Product Manager Resume",
    subtitle: "vs. Meta PM-III posting",
    score: 62,
    scoreColor: "#D97706",
    metrics: [
      { label: "Keyword Match", value: 58, color: "#D97706" },
      { label: "Formatting", value: 85, color: "#059669" },
      { label: "Bullet Impact", value: 64, color: "#D97706" },
    ],
    tags: [
      { text: "Missing: A/B Testing", type: "missing" as const },
      { text: "Missing: PRD", type: "missing" as const },
      { text: "Missing: Metrics", type: "missing" as const },
      { text: "Found: Agile", type: "found" as const },
    ],
  },
  {
    title: "Data Scientist Resume",
    subtitle: "vs. Amazon DS posting",
    score: 93,
    scoreColor: "#059669",
    metrics: [
      { label: "Keyword Match", value: 95, color: "#059669" },
      { label: "Formatting", value: 88, color: "#059669" },
      { label: "Bullet Impact", value: 91, color: "#059669" },
    ],
    tags: [
      { text: "Found: Python", type: "found" as const },
      { text: "Found: SQL", type: "found" as const },
      { text: "Found: ML", type: "found" as const },
      { text: "Found: TensorFlow", type: "found" as const },
    ],
  },
  {
    title: "UX Designer Resume",
    subtitle: "vs. Apple Design posting",
    score: 45,
    scoreColor: "#DC2626",
    metrics: [
      { label: "Keyword Match", value: 38, color: "#DC2626" },
      { label: "Formatting", value: 72, color: "#D97706" },
      { label: "Bullet Impact", value: 52, color: "#DC2626" },
    ],
    tags: [
      { text: "Missing: Figma", type: "missing" as const },
      { text: "Missing: Prototyping", type: "missing" as const },
      { text: "Missing: User Research", type: "missing" as const },
      { text: "Found: Wireframing", type: "found" as const },
    ],
  },
];

function HeroCyclingCard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % heroCards.length);
        setIsTransitioning(false);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const card = heroCards[activeIdx];
  const circ = 2 * Math.PI * 50;
  const offset = circ * (1 - card.score / 100);

  return (
    <ElectricBorder active rounded="rounded-3xl" className="shadow-2xl">
      <div
        className="p-8 bg-white rounded-3xl"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "scale(0.96) rotateY(8deg)" : "scale(1) rotateY(0deg)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.scoreColor}10`, border: `1px solid ${card.scoreColor}25` }}>
            <BarChart3 className="w-5 h-5" style={{ color: card.scoreColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{card.title}</p>
            <p className="text-xs text-slate-400 font-medium">{card.subtitle}</p>
          </div>
        </div>

        {/* Score Ring */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <svg width="110" height="110" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={card.scoreColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black" style={{ color: card.scoreColor, transition: "color 0.5s ease" }}>{card.score}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ATS Score</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-2.5 mb-4">
          {card.metrics.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>{m.label}</span>
                <span style={{ color: m.color, transition: "color 0.5s" }}>{m.value}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${m.value}%`,
                    background: m.color,
                    transition: "width 1s cubic-bezier(0.4,0,0.2,1), background 0.5s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((t) => (
            <span
              key={t.text}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
              style={{
                background: t.type === "missing" ? "#FEF2F2" : "#F0FDF4",
                borderColor: t.type === "missing" ? "#FECACA" : "#BBF7D0",
                color: t.type === "missing" ? "#DC2626" : "#059669",
              }}
            >
              {t.text}
            </span>
          ))}
        </div>

        {/* Cycle dots */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {heroCards.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === activeIdx ? card.scoreColor : "#CBD5E1",
                transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </ElectricBorder>
  );
}


const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "LLaMA 3.1 evaluates your resume on 4 key dimensions: keyword density, formatting standards, bullet impact, and summary clarity.",
    color: "#2563EB",
  },
  {
    icon: Target,
    title: "Job Description Matching",
    description: "Paste the target JD and our AI compares every keyword, skill, and requirement to calculate your exact ATS match percentage.",
    color: "#7C3AED",
  },
  {
    icon: BarChart3,
    title: "ATS Score Breakdown",
    description: "Get a detailed 0-100 score with granular subscores for structure, keyword density, and impact — not just a generic number.",
    color: "#0891B2",
  },
  {
    icon: FileSearch,
    title: "Missing Keyword Detection",
    description: "Instantly see which critical keywords from the job posting are absent from your resume so you can add them before applying.",
    color: "#DC2626",
  },
  {
    icon: ShieldCheck,
    title: "Formatting & Layout Audit",
    description: "Our engine checks section headers, bullet consistency, whitespace balance, and ATS-parseable formatting standards.",
    color: "#059669",
  },
  {
    icon: Sparkles,
    title: "Actionable Recommendations",
    description: "Receive specific, recruiter-level tips on how to rewrite bullet points, restructure sections, and improve clarity.",
    color: "#D97706",
  },
];

const stats = [
  { value: "10,000+", label: "Resumes Analyzed" },
  { value: "<3s", label: "Analysis Time" },
  { value: "94%", label: "User Satisfaction" },
  { value: "Free", label: "To Get Started" },
];

const steps = [
  { step: "01", icon: Upload, title: "Upload Your Resume", desc: "Drop your PDF — we extract every word instantly in your browser using client-side parsing. No data leaves your device until you click analyze." },
  { step: "02", icon: Target, title: "Paste Job Description", desc: "Add the target job posting so our AI can do a precise keyword-by-keyword comparison and calculate your real ATS match score." },
  { step: "03", icon: Brain, title: "AI Runs Deep Analysis", desc: "Our Groq-powered LLaMA 3.1 engine evaluates formatting, bullet impact, keyword density, and summary clarity in under 3 seconds." },
  { step: "04", icon: Award, title: "Get Your Score & Tips", desc: "Receive your ATS score, missing keywords list, formatting fixes, and recruiter-level recommendations — all in one beautiful dashboard." },
];

const testimonials = [
  { name: "Priya Sharma", role: "Software Engineer at Google", text: "ResumeAI found 12 missing keywords I had no idea about. Landed 3 interviews in the first week after updating my resume.", rating: 5 },
  { name: "James Chen", role: "Product Manager at Meta", text: "The formatting audit alone saved me hours. It caught issues no human reviewer had mentioned in 6 months of job searching.", rating: 5 },
  { name: "Sarah Williams", role: "Data Scientist at Amazon", text: "I went from a 42% ATS score to 89% after following ResumeAI's recommendations. Got the offer within 2 weeks.", rating: 5 },
];

const faqs = [
  { q: "Is ResumeAI really free?", a: "Yes! Our core resume analysis is completely free. Upload unlimited resumes, get ATS scores, missing keywords, and formatting tips at no cost." },
  { q: "How accurate is the ATS score?", a: "Our AI evaluates resumes against the same 4 criteria that real ATS systems use: keyword matching, formatting standards, bullet point impact, and summary clarity. It's powered by LLaMA 3.1 for high accuracy." },
  { q: "Is my resume data private?", a: "Absolutely. PDF text extraction happens entirely in your browser. The extracted text is sent securely to our AI for analysis and stored in your personal encrypted account. We never share your data." },
  { q: "What file formats are supported?", a: "Currently we support PDF files up to 10MB. PDF is the industry standard format for ATS systems, so we recommend always submitting your resume as a PDF." },
  { q: "Can I analyze against a specific job description?", a: "Yes! That's our key feature. Paste the target job description and our AI will do a keyword-by-keyword comparison, showing you exactly what's missing." },
];

const LANDING_TABS = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isSignedIn } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative font-sans text-slate-900 selection:bg-blue-500/30">
      {/* ── Layered Backgrounds ─────────────────────────────────────── */}
      <PrismBackground />
      <LightfallBackground />

      {/* ── Fixed Pill Nav ──────────────────────────────────────────── */}
      <PillNav tabs={LANDING_TABS} />

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative z-10 pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Copy */}
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white border border-slate-200 shadow-sm self-center lg:self-start"
              style={{ animation: "fade-in-up 0.5s ease forwards" }}
            >
              <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
              <span className="text-slate-600">AI-Powered Resume Analyzer</span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]"
              style={{ animation: "fade-in-up 0.6s ease 0.1s both forwards" }}
            >
              Land Your Dream Job
              <br />
              <TextType
                words={["Faster With AI.", "With Better Keywords.", "With Expert Tips.", "With Confidence."]}
                className="text-blue-600"
                speed={80}
              />
            </h1>

            {/* Sub-headline */}
            <p
              className="text-lg text-slate-500 leading-relaxed max-w-xl font-medium"
              style={{ animation: "fade-in-up 0.6s ease 0.2s both forwards" }}
            >
              Upload your resume, paste the target job description, and get an instant{" "}
              <span className="text-slate-800 font-semibold">ATS compatibility score</span>,{" "}
              <span className="text-slate-800 font-semibold">missing keywords</span>, and{" "}
              <span className="text-slate-800 font-semibold">recruiter-level tips</span> — all in under 3 seconds.
            </p>

            {/* Stars */}
            <div
              className="flex items-center gap-2 text-sm text-slate-500 justify-center lg:justify-start"
              style={{ animation: "fade-in-up 0.6s ease 0.3s both forwards" }}
            >
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <span className="font-semibold">Trusted by 10,000+ job seekers</span>
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              style={{ animation: "fade-in-up 0.6s ease 0.4s both forwards" }}
            >
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                >
                  Go to Workspace
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : (
                <SignUpButton mode="redirect">
                  <button
                    className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                  >
                    Analyze My Resume — Free
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </SignUpButton>
              )}
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                See How It Works
              </a>
            </div>

            {/* Trust */}
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400 justify-center lg:justify-start"
              style={{ animation: "fade-in-up 0.6s ease 0.5s both forwards" }}
            >
              {["No credit card required", "Results in 3 seconds", "100% private & secure"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Cycling preview card with ElectricBorder */}
          <div
            className="flex-1 max-w-md w-full"
            style={{ animation: "fade-in-up 0.7s ease 0.3s both forwards" }}
          >
            <HeroCyclingCard />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <RevealSection className="relative z-10 py-12 px-6">
        <div
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 shadow-lg"
          style={{ borderRadius: "20px", overflow: "hidden" }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-8 px-4 gap-1 text-center bg-white">
              <span
                className="text-3xl font-black"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}
              >
                {stat.value}
              </span>
              <span className="text-sm font-semibold text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES SECTION (6 cards, 3x2 grid)
      ══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Powerful Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-950 leading-tight">
              Everything You Need to{" "}
              <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Beat the ATS
              </span>
            </h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto font-medium">
              Our AI analyzes your resume the same way real Applicant Tracking Systems do — then tells you exactly how to score higher.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <RevealSection key={feat.title} delay={i * 0.1}>
                  <div className="group relative p-7 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default h-full">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${feat.color}10`, border: `1px solid ${feat.color}25` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: feat.color }} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{feat.description}</p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS (4 steps)
      ══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <RevealSection className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Simple 4-Step Process</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-950 leading-tight">
              From Upload to{" "}
              <span style={{ background: "linear-gradient(135deg, #2563EB, #0891B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Dream Job
              </span>
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <RevealSection key={s.step} delay={i * 0.12}>
                  <div className="relative p-6 bg-[#F8FAFC] border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col items-center text-center gap-4">
                    {/* Step connector line */}
                    {i < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 -right-3 w-6 h-px bg-slate-300 z-10" />
                    )}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black relative"
                      style={{
                        background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(59, 130, 246, 0.04))",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        color: "#2563EB",
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Step {s.step}</span>
                    <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">What Users Say</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-950 leading-tight">
              Real Results From{" "}
              <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Real People
              </span>
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <RevealSection key={t.name} delay={i * 0.1}>
                <div className="p-7 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">
                  <div className="flex mb-3">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <RevealSection className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">FAQ</p>
            <h2 className="text-4xl font-extrabold text-slate-950">Frequently Asked Questions</h2>
          </RevealSection>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 0.05}>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-[#F8FAFC] hover:shadow-md transition-shadow duration-300">
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-bold text-slate-800 pr-4">{faq.q}</span>
                    <ChevronDown
                      className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300"
                      style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: openFaq === i ? "200px" : "0px", opacity: openFaq === i ? 1 : 0 }}
                  >
                    <p className="px-6 pb-4 text-sm text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">About ResumeAI</p>
                <h2 className="text-4xl font-extrabold text-slate-950 leading-tight mb-6">
                  Built by Engineers Who<br />
                  <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Understand the Struggle
                  </span>
                </h2>
                <p className="text-base text-slate-500 leading-relaxed mb-4 font-medium">
                  We built ResumeAI because we were tired of submitting resumes into black holes. ATS systems reject 75% of resumes before a human ever sees them — most of the time for fixable formatting and keyword issues.
                </p>
                <p className="text-base text-slate-500 leading-relaxed mb-6 font-medium">
                  Our mission is simple: give every job seeker access to the same resume intelligence that career coaches charge hundreds of dollars for — instantly, for free, powered by the latest AI.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Users, label: "10K+ Users" },
                    { icon: Globe, label: "Global" },
                    { icon: Zap, label: "Real-Time AI" },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all duration-300">
                      <item.icon className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <ElectricBorder active rounded="rounded-3xl" className="shadow-xl max-w-sm w-full">
                  <div className="p-8 bg-white rounded-3xl text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg">
                      <Brain className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Powered by LLaMA 3.1</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium mb-4">
                      Our AI engine runs on Meta's LLaMA 3.1 model via Groq's ultra-fast inference. Analyze any resume in under 3 seconds.
                    </p>
                    <div className="flex justify-center gap-3 mt-2">
                      {["Next.js", "Groq", "Clerk", "Prisma"].map(t => (
                        <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-500">{t}</span>
                      ))}
                    </div>
                  </div>
                </ElectricBorder>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <RevealSection className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Get In Touch</p>
            <h2 className="text-4xl font-extrabold text-slate-950 leading-tight">
              Contact Us
            </h2>
            <p className="text-base text-slate-500 mt-4 font-medium flex items-center justify-center gap-1.5">
              Have questions, feedback, or partnership inquiries? We'd love to hear from you <span className="text-red-500">❤️</span>
            </p>
          </RevealSection>

          <RevealSection>
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300">
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                  const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                  const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
                  window.open(`mailto:mallikarjunkaplai1096@gmail.com?subject=Contact from ${name}&body=${encodeURIComponent(message)}%0A%0AFrom: ${email}`, "_self");
                }}
              >
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                >
                  <Mail className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative z-10">
        <RevealSection>
          <div className="max-w-4xl mx-auto">
            <ElectricBorder active rounded="rounded-3xl" className="shadow-2xl">
              <div className="relative p-12 md:p-16 rounded-3xl overflow-hidden bg-white text-center">
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)" }} />
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-slate-950 leading-tight">
                    Ready to Land That Job?
                  </h2>
                  <p className="text-lg text-slate-500 max-w-lg font-medium">
                    Join thousands of job seekers who've transformed their resumes. Free, fast, and no credit card needed.
                  </p>
                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                    >
                      Go to Workspace
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <SignUpButton mode="redirect">
                      <button
                        className="group flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                      >
                        Start Analyzing For Free
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </SignUpButton>
                  )}
                </div>
              </div>
            </ElectricBorder>
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="py-12 px-6 border-t border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <p className="text-lg font-bold text-slate-900 mb-2">
                Resume<span className="text-blue-600">AI</span>
              </p>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                AI-powered resume analysis. Beat the ATS, land more interviews.
              </p>
            </div>
            {/* Links */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Product</p>
              <ul className="space-y-2">
                {["Features", "How It Works", "Workspace"].map(l => (
                  <li key={l}>
                    <a href={l === "Workspace" ? "/dashboard" : `#${l.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Company</p>
              <ul className="space-y-2">
                {["About", "Contact", "Careers"].map(l => (
                  <li key={l}>
                    <a href={l === "Careers" ? "#" : `#${l.toLowerCase()}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Legal</p>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400 font-medium">© 2026 ResumeAI. Built with Next.js, Clerk & Groq.</p>
            <div className="flex gap-4 text-sm text-slate-400">
              <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-900 transition-colors">GitHub</a>
              <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
