import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Check,
  Star,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
} from "lucide-react";
import SEO from "@/components/SEO";
import { aiApi } from "@/api/ai";
import { adminApi, type PublicAIModel } from "@/api/admin";

// Types
type ProcessingStatus = "idle" | "uploading" | "processing" | "success" | "error";

const watermarkRemoverStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Watermark Remover",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online watermark remover tool. Remove watermarks, logos, text, and unwanted objects from images with AI technology.",
  },
];

const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => (
  <div className="border-b border-gray-100 last:border-b-0">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 text-left font-medium hover:text-sky-600 transition-colors"
    >
      <span className="text-gray-900">{question}</span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-sky-600 flex-shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="pb-4 text-gray-600 leading-relaxed">{answer}</div>
    )}
  </div>
);

export default function RemoveWatermarkPage() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [modelId, setModelId] = useState<string>("");
  const [models, setModels] = useState<PublicAIModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await adminApi.getPublicModels("image");
        if (response.code === 0 && response.data) {
          setModels(response.data);
          // Set default model (first one or the one marked as default)
          if (response.data.length > 0) {
            setModelId(response.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };
    fetchModels();
  }, []);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size too large. Max 10MB.");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setStatus("idle");
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const pollTask = async (taskId: string) => {
    try {
      const response = await aiApi.getTask(taskId);
      const task = response.data;

      if (task.status === "completed" && task.output_url) {
        setResultUrl(task.output_url);
        setStatus("success");
      } else if (task.status === "failed") {
        setError(task.error_message || "Processing failed");
        setStatus("error");
      } else {
        // Continue polling
        setTimeout(() => pollTask(taskId), 2000);
      }
    } catch {
      setError("Failed to check task status");
      setStatus("error");
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setStatus("processing");
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const response = await aiApi.removeWatermark({
        image_url: base64,
        model_id: modelId || undefined,
      });
      
      if (response.data && response.data.id) {
        pollTask(response.data.id);
      } else {
        throw new Error("No task ID received");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to start processing");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setStatus("idle");
    setError(null);
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "watermark-removed.png";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(resultUrl, "_blank");
    }
  };

  // Content for landing page
  const steps = [
    {
      icon: Upload,
      title: "Upload Image",
      description: "Upload any image with watermarks, logos, or text.",
      color: "bg-sky-100 text-sky-600",
    },
    {
      icon: Sparkles,
      title: "AI Processing",
      description: "Our advanced AI automatically detects and removes watermarks.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Download,
      title: "Download Result",
      description: "Get your clean, high-quality image instantly.",
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  const features = [
    {
      icon: Star,
      title: "Professional Quality",
      description: "Maintain original image quality while removing unwanted elements.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process images in seconds with our optimized AI engine.",
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your images are processed securely and deleted automatically.",
    },
  ];

  const faqs = [
    {
      question: "Is it free to use?",
      answer: "Yes, you can try our watermark remover for free. We also offer premium plans for bulk processing and higher resolution limits.",
    },
    {
      question: "What image formats are supported?",
      answer: "We support all common image formats including JPG, PNG, WebP, and BMP.",
    },
    {
      question: "Will the quality of my image be affected?",
      answer: "Our AI is trained to fill in the removed areas intelligently, preserving the original quality and texture of your image.",
    },
  ];

  return (
    <>
      <SEO
        title="AI Watermark Remover - Remove Watermarks Free Online"
        description="Remove watermarks, logos, text, and unwanted objects from images instantly with AI. High quality, free, and secure."
        canonicalUrl="/remove-watermark"
        structuredData={watermarkRemoverStructuredData}
      />

      <div className="min-h-screen bg-white">
        {/* Editor / Hero Section */}
        <section className={`relative pt-6 pb-8 transition-all duration-500 ${file ? 'bg-gray-50 min-h-[calc(100vh-64px)]' : 'bg-gradient-to-b from-sky-50 to-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header Content (Only show when no file is selected) */}
            {!file && (
              <div className="text-center mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 bg-sky-100 rounded-full mb-3">
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  <span className="text-xs font-medium text-sky-700">
                    New Generation AI
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  Remove Watermarks <span className="text-sky-600">Like Magic</span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 mb-4 max-w-xl mx-auto">
                  Instantly remove watermarks, logos, and text from your photos using AI.
                </p>
              </div>
            )}

            {/* Main Application Area */}
            <div className={`mx-auto transition-all duration-500 ${file ? 'max-w-6xl' : 'max-w-3xl'}`}>
              
              {!file ? (
                // Upload Zone (Landing State)
                <div className="flex flex-col gap-3">
                  {/* Model Selector placed above upload zone */}
                  {models.length > 0 && (
                    <div className="flex justify-center">
                      <div className="bg-white px-3 py-2 rounded-lg border border-sky-100 shadow-sm inline-flex items-center gap-2">
                        <span className="text-sm text-gray-500">Model:</span>
                        <select
                          value={modelId}
                          onChange={(e) => setModelId(e.target.value)}
                          className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-sky-600"
                        >
                          {models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.display_name} {m.credits_per_use === 0 ? "(Free)" : `(${m.credits_per_use} credits)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white border-2 border-dashed border-sky-200 hover:border-sky-400 hover:bg-sky-50/50 transition-all duration-300 p-8 text-center shadow-lg shadow-sky-100/50"
                  >
                    <div className="absolute inset-0 bg-grid-sky-500/[0.05] [mask-image:linear-gradient(0deg,white,transparent)]" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Upload an Image</h3>
                        <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400 uppercase tracking-wider font-medium">
                        <span>JPG</span>
                        <span className="w-px h-4 bg-gray-300" />
                        <span>PNG</span>
                        <span className="w-px h-4 bg-gray-300" />
                        <span>WebP</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Editor Interface
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  
                  {/* Toolbar */}
                  <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white z-10">
                    <button 
                      onClick={handleReset}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {models.length > 0 && (
                        <div className="flex-1 sm:flex-none">
                          <select
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            disabled={status === 'processing'}
                            className="text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer"
                          >
                            {models.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.display_name} {m.credits_per_use === 0 ? "(Free)" : `(${m.credits_per_use} credits)`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        onClick={handleProcess}
                        disabled={status === 'processing' || status === 'success'}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-sky-200 ${
                          status === 'processing' 
                            ? 'bg-sky-100 text-sky-400 cursor-not-allowed'
                            : status === 'success'
                            ? 'bg-green-500 text-white cursor-default'
                            : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-300 hover:-translate-y-0.5'
                        }`}
                      >
                        {status === 'processing' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : status === 'success' ? (
                          <>
                            <Check className="w-4 h-4" />
                            Done
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Remove Watermark
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Canvas Area */}
                  <div className="grid md:grid-cols-2 gap-px bg-gray-100 h-[600px] relative">
                    
                    {/* Error Overlay */}
                    {error && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
                        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg border border-red-100 max-w-md">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm font-medium">{error}</p>
                          <button onClick={() => setError(null)} className="ml-auto hover:bg-red-100 p-1 rounded-full">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Original Image */}
                    <div className="relative bg-gray-50/50 flex items-center justify-center p-4 overflow-hidden group">
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur text-white text-xs font-medium rounded-full">Original</div>
                      {previewUrl && (
                        <img 
                          src={previewUrl} 
                          alt="Original" 
                          className="max-w-full max-h-full object-contain shadow-sm rounded-lg"
                        />
                      )}
                    </div>

                    {/* Result Image */}
                    <div className="relative bg-white flex items-center justify-center p-4 overflow-hidden">
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-sky-600/90 backdrop-blur text-white text-xs font-medium rounded-full shadow-lg">Result</div>
                      
                      {status === 'processing' ? (
                         <div className="flex flex-col items-center gap-4 text-sky-600 animate-pulse">
                           <div className="relative">
                             <div className="w-16 h-16 border-4 border-sky-200 rounded-full animate-spin"></div>
                             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-sky-600 rounded-full animate-spin border-t-transparent"></div>
                           </div>
                           <p className="text-sm font-medium">AI is working its magic...</p>
                         </div>
                      ) : resultUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                          <img 
                            src={resultUrl} 
                            alt="Result" 
                            className="max-w-full max-h-full object-contain shadow-md rounded-lg"
                          />
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                            <button 
                              onClick={handleDownload}
                              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-xl hover:bg-black transition-colors font-medium"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p className="text-sm">Processed image will appear here</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </section>

        {/* Features & Content (Only show when no file is selected) */}
        {!file && (
          <>
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                  <p className="text-gray-600">Three simple steps to clean images</p>
                </div>
                <div className="grid md:grid-cols-3 gap-12">
                  {steps.map((step, i) => (
                    <div key={i} className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${step.color}`}>
                        <step.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-20 bg-sky-50/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
                    <div className="space-y-8">
                      {features.map((feature, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-sky-600">
                            <feature.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl transform rotate-3 opacity-10 blur-xl"></div>
                    <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="space-y-4">
                         <div className="h-40 bg-gray-100 rounded-xl w-full animate-pulse"></div>
                         <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                         <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 bg-white">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <FAQItem
                      key={i}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFAQ === i}
                      onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
