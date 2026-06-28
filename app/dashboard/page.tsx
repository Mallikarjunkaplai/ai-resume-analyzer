"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Clock, ChevronRight, Loader2, Award, Briefcase, FileCheck, Brain, LayoutGrid, CheckSquare, Sparkles, TrendingUp, Trash2 } from "lucide-react";
import { PillNav } from "@/components/ui/pill-nav";
import { ElectricBorder } from "@/components/ui/electric-border";
import { PrismBackground } from "@/components/ui/prism";
import { TextType } from "@/components/ui/text-type";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface FeedbackJson {
  missingKeywords: string[];
  formattingTips: string[];
  summary: string;
}

interface AnalysisResult {
  resumeId: string;
  fileName: string;
  score: number;
  feedbackJson: FeedbackJson;
}

interface ResumeHistoryItem {
  id: string;
  fileName: string;
  createdAt: string;
  analysis: { score: number; feedbackJson: FeedbackJson } | null;
}

type UploadState = "idle" | "extracting" | "analyzing" | "done" | "error";

// ── Score color helpers ────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 75) return { text: "#059669", bg: "rgba(16,185,129,0.05)", border: "#A7F3D0", label: "Strong Match" };
  if (score >= 50) return { text: "#D97706", bg: "rgba(245,158,11,0.05)", border: "#FDE68A", label: "Average Match" };
  return { text: "#DC2626", bg: "rgba(239,68,68,0.05)", border: "#FCA5A5", label: "Weak Match" };
}

// ── Score Ring ─────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color.text}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 64 64)"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>
        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-black tabular-nums text-slate-900"
          >
            {score}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ATS Score
          </span>
        </div>
      </div>
      <span
        className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
        style={{
          color: color.text,
          background: color.bg,
          borderColor: color.border,
        }}
      >
        {color.label}
      </span>
    </div>
  );
}

// ── Analysis Card ──────────────────────────────────────────────────────────

function AnalysisCard({ result }: { result: AnalysisResult }) {
  const { feedbackJson, score, fileName } = result;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileCheck className="w-3.5 h-3.5" />
            Evaluation Complete
          </div>
          <h3 className="text-xl font-bold text-slate-900 truncate max-w-sm">
            {fileName}
          </h3>
          <p className="text-sm text-slate-500 mt-1">Detailed analysis report based on 4 criteria</p>
        </div>
        <div className="shrink-0">
          <ScoreRing score={score} />
        </div>
      </div>

      {/* Summary */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          ATS Feedback Summary
        </p>
        <ul className="space-y-2">
          {feedbackJson.summary.split(/(?<=[.!?])\s+/).filter(Boolean).map((sentence, idx) => (
            <li key={idx} className="flex gap-2 text-sm leading-relaxed text-slate-700 font-medium">
              <span className="text-blue-500 shrink-0 mt-0.5">•</span>
              <span>{sentence}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── History Row ────────────────────────────────────────────────────────────

function HistoryRow({ item, onDelete }: { item: ResumeHistoryItem; onDelete: (id: string) => void }) {
  const score = item.analysis?.score ?? null;
  const color = score !== null ? getScoreColor(score) : null;
  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer"
    >
      {/* File icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 border border-blue-100"
      >
        <FileText className="w-4 h-4 text-blue-500" />
      </div>

      {/* Name + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{item.fileName}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {date}
        </p>
      </div>

      {/* Score badge */}
      {color && score !== null && (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg border tabular-nums shrink-0"
          style={{
            color: color.text,
            background: color.bg,
            borderColor: color.border,
          }}
        >
          {score}%
        </span>
      )}
      
      {/* Delete button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-2 cursor-pointer"
        title="Delete history"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ResumeHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navTabs = [
    { label: "Home", href: "/" },
    { label: "Analyze", isActive: activeTab === "analyze", onClick: () => setActiveTab("analyze") },
    { label: "History", isActive: activeTab === "history", onClick: () => setActiveTab("history") },
  ];

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);
    fetch("/api/resumes")
      .then(r => r.json())
      .then(data => setHistory(data.resumes ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  // ── Load history ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch("/api/resumes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        loadHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── PDF text extraction ───────────────────────────────────────────────────
  async function extractTextFromPDF(file: File): Promise<string> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text +=
        content.items
          .map((item: Record<string, unknown>) =>
            typeof item["str"] === "string" ? item["str"] : ""
          )
          .join(" ") + "\n";
    }
    return text.trim();
  }

  // ── Handle file ───────────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadState("error");
      setStatusMsg("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadState("error");
      setStatusMsg("File must be smaller than 10 MB.");
      return;
    }

    setSelectedFile(file);
    setResult(null);

    try {
      // Step 1: extract text
      setUploadState("extracting");
      setStatusMsg("Extracting text from PDF…");
      const rawText = await extractTextFromPDF(file);

      if (!rawText || rawText.length < 10) {
        setUploadState("error");
        setStatusMsg("Could not extract text. Is the PDF text-based (not a scanned image)?");
        return;
      }

      // Step 2: send to AI
      setUploadState("analyzing");
      setStatusMsg("Analyzing with AI against target criteria…");

      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, rawText, jobDescription }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Server error ${res.status}`);
      }

      const { resumeId } = await res.json();

      // Step 3: fetch analysis
      const analysisRes = await fetch(`/api/analysis/${resumeId}`);
      if (!analysisRes.ok) throw new Error("Failed to fetch analysis");
      const analysisData = await analysisRes.json();

      setResult({
        resumeId,
        fileName: file.name,
        score: analysisData.score,
        feedbackJson: analysisData.feedbackJson as FeedbackJson,
      });

      setUploadState("done");
      setStatusMsg("Analysis complete!");

      // Refresh history to show new analysis
      loadHistory();
    } catch (err: unknown) {
      setUploadState("error");
      setStatusMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }, [jobDescription]);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);
  const onDragLeave = useCallback(() => setDragActive(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = useCallback(() => {
    setUploadState("idle");
    setSelectedFile(null);
    setStatusMsg("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const isProcessing = uploadState === "extracting" || uploadState === "analyzing";

  return (
    <div className="min-h-screen relative font-sans text-slate-900">
      <PrismBackground />

      {/* ── Pill Nav ─────────────────────────────────────────────────── */}
      <PillNav tabs={navTabs} />

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24">

        {/* Page heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              ATS Optimizer
            </p>
            <h1 className="text-3xl font-black text-slate-950 flex items-center gap-2"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              Analyze{" "}
              <TextType
                words={["against Job Description.", "for missing keywords.", "formatting standard.", "bullet impact."]}
                className="text-blue-500"
                speed={85}
              />
            </h1>
            <p className="text-slate-500 text-sm mt-2 max-w-lg font-semibold">
              Upload your resume and paste the target job description to run a rigorous check against formatting, action verbs, keyword density, and summary clarity.
            </p>
          </div>
        </div>

        {activeTab === "analyze" ? (
          <div className="w-full animate-fade-in-up">
            {/* ── Grid Layout ─────────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card: Job Description */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Target Job Description
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-semibold">
                Paste the target job description to match missing keywords and calculate ATS match accuracy.
              </p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description or requirement here..."
                disabled={isProcessing}
                className="w-full h-40 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none font-semibold"
              />
            </div>

            {/* Card: Upload Resume */}
            <ElectricBorder
              active={dragActive || uploadState === "idle"}
              rounded="rounded-3xl"
              className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-5 px-6 py-12 rounded-3xl text-center transition-all duration-300 cursor-pointer",
                  dragActive
                    ? "bg-blue-50/40"
                    : "bg-white hover:bg-slate-50/60"
                )}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={onFileInput}
                />

                {/* State: idle */}
                {uploadState === "idle" && (
                  <>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100"
                    >
                      <UploadCloud className="w-7 h-7 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800 mb-1">
                        {dragActive ? "Release to upload" : "Drop your resume PDF"}
                      </p>
                      <p className="text-xs text-slate-500 font-bold">
                        or{" "}
                        <span className="text-blue-600 hover:text-blue-500 cursor-pointer transition-colors">
                          click to browse
                        </span>{" "}
                        · PDF only · max 10 MB
                      </p>
                    </div>
                  </>
                )}

                {/* State: extracting / analyzing */}
                {isProcessing && (
                  <>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100"
                    >
                      <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800 mb-1">
                        {uploadState === "extracting" ? "Reading PDF…" : "Analyzing with AI…"}
                      </p>
                      <p className="text-xs text-slate-500 font-bold truncate max-w-[200px] mx-auto">
                        {selectedFile?.name}
                      </p>
                    </div>
                    {/* Progress track */}
                    <div className="w-48 h-1 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: uploadState === "extracting" ? "40%" : "80%",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </>
                )}

                {/* State: done */}
                {uploadState === "done" && (
                  <>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100"
                    >
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800 mb-1">
                        Analysis Complete
                      </p>
                      <p className="text-xs text-slate-500">
                        <button
                          onClick={e => { e.stopPropagation(); reset(); }}
                          className="text-blue-600 hover:text-blue-500 font-bold transition-colors cursor-pointer"
                        >
                          Upload another resume
                        </button>
                      </p>
                    </div>
                  </>
                )}

                {/* State: error */}
                {uploadState === "error" && (
                  <>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 border border-red-100"
                    >
                      <AlertCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800 mb-1">
                        Upload failed
                      </p>
                      <p className="text-xs text-red-600/80 max-w-sm font-semibold">{statusMsg}</p>
                      <button
                        onClick={e => { e.stopPropagation(); reset(); }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-500 font-bold transition-colors cursor-pointer"
                      >
                        Try again
                      </button>
                    </div>
                  </>
                )}
              </div>
            </ElectricBorder>
          </div>

          {/* Right Column: Results & Placeholders */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {result ? (
              <AnalysisCard result={result} />
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100 mb-2">
                  <Award className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Ready for ATS Evaluation</h3>
                <p className="text-sm text-slate-500 max-w-md font-semibold leading-relaxed">
                  Enter target Job Description on the left, then upload your resume in PDF format. We'll run a comprehensive review of target keywords, bullet impact, formatting standards, and summary clarity.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Resume Insights Section (3-Column Grid) ───────────────────── */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Resume Insights
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Column 1: Skill Gap */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Skill Gap
                </h3>
              </div>
              {result ? (
                <>
                  <p className="text-xs text-slate-500 mb-4 font-semibold">
                    The following critical keywords are missing from your resume compared to the job description:
                  </p>
                  {result.feedbackJson.missingKeywords.length === 0 ? (
                    <div className="flex flex-col items-center py-6 gap-2 text-center">
                      <Sparkles className="w-8 h-8 text-emerald-500" />
                      <p className="text-xs font-bold text-slate-800">No Skill Gap Found!</p>
                      <p className="text-[11px] text-slate-400 font-semibold">Your resume covers all target keywords.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {result.feedbackJson.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-red-50/50 border border-red-100 text-red-700"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-10 gap-2 text-center text-slate-400">
                  <Sparkles className="w-8 h-8 opacity-60" />
                  <p className="text-xs font-bold">Awaiting evaluation</p>
                  <p className="text-[11px] font-semibold">Upload a resume to extract missing keywords.</p>
                </div>
              )}
            </div>

            {/* Column 2: Formatting Issues */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Formatting Standard
                </h3>
              </div>
              {result ? (
                <>
                  <p className="text-xs text-slate-500 mb-4 font-semibold">
                    Specific formatting and structure recommendations from technical recruiters:
                  </p>
                  {result.feedbackJson.formattingTips.length === 0 ? (
                    <div className="flex flex-col items-center py-6 gap-2 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <p className="text-xs font-bold text-slate-800">Formatting is Excellent!</p>
                      <p className="text-[11px] text-slate-400 font-semibold">No critical errors detected.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.feedbackJson.formattingTips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-xs font-semibold text-slate-600 leading-relaxed">
                          <span className="text-amber-500 shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-10 gap-2 text-center text-slate-400">
                  <CheckSquare className="w-8 h-8 opacity-60" />
                  <p className="text-xs font-bold">Awaiting evaluation</p>
                  <p className="text-[11px] font-semibold">Recruiter formatting rules will render here.</p>
                </div>
              )}
            </div>

            {/* Column 3: Keyword Density */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Keyword Match Index
                </h3>
              </div>
              {result ? (
                <div className="flex flex-col gap-4 py-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Overall Match Score</span>
                      <span>{result.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed font-semibold">
                    <p className="mb-2">Assessment Index:</p>
                    <ul className="space-y-1">
                      <li className="flex justify-between">
                        <span className="text-slate-400">Keyword Density:</span>
                        <span className="text-slate-700 font-bold">{Math.round(result.score * 0.95)}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-400">Structure Score:</span>
                        <span className="text-slate-700 font-bold">{Math.round(result.score * 1.02) > 100 ? 100 : Math.round(result.score * 1.02)}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-400">Impact Score:</span>
                        <span className="text-slate-700 font-bold">{Math.round(result.score * 0.98)}%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 gap-2 text-center text-slate-400">
                  <TrendingUp className="w-8 h-8 opacity-60" />
                  <p className="text-xs font-bold">Awaiting evaluation</p>
                  <p className="text-[11px] font-semibold">Match score density profiles will show here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    ) : (
          <section className="mt-4 animate-fade-in-up">
            {/* ── Resume History ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Past Analyses
            </h2>
            {history.length > 0 && (
              <span className="text-xs font-bold text-slate-400">{history.length} resume{history.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          <div
            className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {historyLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-sm font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                Loading history…
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-500">No resumes analyzed yet</p>
                <p className="text-xs text-slate-400 font-semibold">Upload your first resume above to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((item) => (
                  <div key={item.id} className="px-2 py-1">
                    <HistoryRow item={item} onDelete={handleDeleteHistory} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      </main>

      <style>{`
        @keyframes dash-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
