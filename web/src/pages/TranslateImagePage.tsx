import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Languages,
  Download,
  Check,
  Globe,
  Zap,
  Layers,
  Lock,
  Star,
  Shield,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Image as ImageIcon
} from 'lucide-react';
import SEO from '@/components/SEO';
import { useAITaskStore } from "@/store/aiTaskStore";
import { useWalletStore } from "@/store/walletStore";
import { SUPPORTED_LANGUAGES } from "@/api/ai";
import { adminApi, type PublicAIModel } from "@/api/admin";

const getPageConfig = () => {
  return {
    title: 'Free Image Translator - Translate Text in Images Online',
    description:
      'Translate text in images from any language instantly. AI-powered image translation for manga, comics, documents and more. 100% free.',
    keywords:
      'image translator, translate image, translate text in image, manga translator, comic translator, picture translator',
    canonicalUrl: '/translate-image',
    heading: 'Image Translator',
    subheading: 'Translate Images',
  };
};

const imageTranslatorStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Image Translator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free online image translator. Translate text in images from any language using AI technology.',
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
    {isOpen && <div className="pb-4 text-gray-600 leading-relaxed">{answer}</div>}
  </div>
);

export default function TranslateImagePage() {
  // Page Config
  const pageConfig = getPageConfig();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [modelId, setModelId] = useState<string>("");
  const [models, setModels] = useState<PublicAIModel[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stores
  const { currentTask, isLoading, isPolling, error: taskError, translateImage, startPolling, clearCurrentTask, clearError } = useAITaskStore();
  const { fetchBalance } = useWalletStore();

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

  // Cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      clearCurrentTask();
      clearError();
    };
  }, [clearCurrentTask, clearError]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        const preview = URL.createObjectURL(selectedFile);
        setPreviewUrl(preview);
        clearCurrentTask();
        clearError();
      }
    },
    [clearCurrentTask, clearError]
  );

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTranslate = useCallback(async () => {
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const task = await translateImage({
        image_url: base64,
        source_lang: sourceLang,
        target_lang: targetLang,
        model_id: modelId || undefined,
      });

      if (task) {
        startPolling(task.id, () => {
          fetchBalance();
        });
      }
    } catch (err) {
      console.error("Translation error:", err);
    }
  }, [file, sourceLang, targetLang, modelId, translateImage, startPolling, fetchBalance]);

  const handleDownload = useCallback(() => {
    if (!currentTask?.output_url) return;
    const link = document.createElement("a");
    link.href = currentTask.output_url;
    link.download = `translated_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentTask]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    clearCurrentTask();
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearCurrentTask, clearError]);

  const isProcessing = isLoading || isPolling;
  const isCompleted = currentTask?.status === "completed";

  // Features data
  const steps = [
    {
      icon: Upload,
      title: 'Upload Image',
      description: 'Upload your image containing text.',
      color: 'bg-sky-100 text-sky-600',
    },
    {
      icon: Languages,
      title: 'Select Languages',
      description: 'Choose source and target languages.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Download,
      title: 'Download',
      description: 'Get your translated image instantly.',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const features = [
    { icon: Star, title: 'Completely Free', description: 'Translate images 100% free, no hidden costs.' },
    { icon: Globe, title: '100+ Languages', description: 'Support for over 100 languages including Japanese, Korean, Chinese.' },
    { icon: Zap, title: 'AI-Powered', description: 'Advanced AI for accurate text detection and translation.' },
    { icon: Layers, title: 'Preserve Layout', description: 'Maintains original image layout and text positioning.' },
    { icon: Lock, title: '100% Private', description: 'Your images are processed securely and never stored.' },
    { icon: Shield, title: 'High Quality', description: 'Export translated images in original quality.' },
  ];

  const faqs = [
    {
      question: 'What types of images can I translate?',
      answer: 'Our Image Translator works with any image containing text, including manga, comics, webtoons, screenshots, documents, signs, menus, and more.',
    },
    {
      question: 'How accurate is the translation?',
      answer: 'We use state-of-the-art AI models for both text detection and translation. The accuracy depends on the image quality and text clarity.',
    },
    {
      question: 'Is there a limit on image size?',
      answer: 'We recommend images under 10MB for optimal processing speed.',
    },
    {
      question: 'Is the translation free?',
      answer: 'Yes, our basic image translation service is completely free.',
    },
    {
      question: 'How is my privacy protected?',
      answer: 'Your images are processed securely and are automatically deleted after translation.',
    },
  ];

  return (
    <>
      <SEO
        title={pageConfig.title}
        description={pageConfig.description}
        keywords={pageConfig.keywords}
        canonicalUrl={pageConfig.canonicalUrl}
        structuredData={imageTranslatorStructuredData}
      />

      <div className="min-h-screen bg-white">
        {/* Editor / Hero Section */}
        <section className={`relative pt-6 pb-8 transition-all duration-500 ${file ? 'bg-gray-50 min-h-[calc(100vh-64px)]' : 'bg-gradient-to-b from-sky-50 to-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header Content (Only show when no file is selected) */}
            {!file && (
              <div className="text-center mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 bg-sky-100 rounded-full mb-3">
                  <Languages className="w-3 h-3 text-sky-600" />
                  <span className="text-xs font-medium text-sky-700">
                    AI-Powered Translation
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  {pageConfig.subheading} <span className="text-sky-600">Instantly</span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 mb-4 max-w-xl mx-auto">
                  Translate text in images from any language. Perfect for manga, comics, and documents.
                </p>
              </div>
            )}

            {/* Main Application Area */}
            <div className={`mx-auto transition-all duration-500 ${file ? 'max-w-6xl' : 'max-w-3xl'}`}>

              {!file ? (
                // Upload Zone (Landing State)
                <div className="flex flex-col gap-3">
                  {/* Model & Language Selector placed above upload zone */}
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    {/* Model Selector */}
                    {models.length > 0 && (
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
                    )}

                    {/* Language Selector */}
                    <div className="bg-white p-1.5 rounded-lg border border-sky-100 shadow-sm flex items-center gap-2">
                      <select
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-gray-700"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                      <span className="text-gray-300">→</span>
                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-sky-600"
                      >
                        {SUPPORTED_LANGUAGES.filter(l => l.code !== 'auto').map((lang) => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Image</h3>
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

                    <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                      {/* Model Selector */}
                      {models.length > 0 && (
                        <select
                          value={modelId}
                          onChange={(e) => setModelId(e.target.value)}
                          disabled={isProcessing}
                          className="text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer"
                        >
                          {models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.display_name} {m.credits_per_use === 0 ? "(Free)" : `(${m.credits_per_use} credits)`}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Language Selector */}
                      <div className="flex-1 sm:flex-none flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                        <select
                          value={sourceLang}
                          onChange={(e) => setSourceLang(e.target.value)}
                          disabled={isProcessing}
                          className="bg-transparent text-sm border-none focus:ring-0 p-1 text-gray-700 font-medium cursor-pointer"
                        >
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                        <span className="text-gray-400">→</span>
                        <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          disabled={isProcessing}
                          className="bg-transparent text-sm border-none focus:ring-0 p-1 text-sky-600 font-medium cursor-pointer"
                        >
                          {SUPPORTED_LANGUAGES.filter(l => l.code !== 'auto').map((lang) => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleTranslate}
                        disabled={isProcessing || isCompleted}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-sky-200 ${
                          isProcessing
                            ? 'bg-sky-100 text-sky-400 cursor-not-allowed'
                            : isCompleted
                            ? 'bg-green-500 text-white cursor-default'
                            : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-300 hover:-translate-y-0.5'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Translating...
                          </>
                        ) : isCompleted ? (
                          <>
                            <Check className="w-4 h-4" />
                            Done
                          </>
                        ) : (
                          <>
                            <Languages className="w-4 h-4" />
                            Translate
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Canvas Area */}
                  <div className="grid md:grid-cols-2 gap-px bg-gray-100 h-[600px] relative">

                    {/* Error Overlay */}
                    {(taskError || currentTask?.error_message) && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
                        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg border border-red-100 max-w-md">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm font-medium">{taskError || currentTask?.error_message}</p>
                          <button onClick={clearError} className="ml-auto hover:bg-red-100 p-1 rounded-full">
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

                      {isProcessing ? (
                         <div className="flex flex-col items-center gap-4 text-sky-600 animate-pulse">
                           <div className="relative">
                             <div className="w-16 h-16 border-4 border-sky-200 rounded-full animate-spin"></div>
                             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-sky-600 rounded-full animate-spin border-t-transparent"></div>
                           </div>
                           <p className="text-sm font-medium">Translating text...</p>
                         </div>
                      ) : (isCompleted && currentTask?.output_url) ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                          <img
                            src={currentTask.output_url}
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
                          <p className="text-sm">Translated image will appear here</p>
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
                  <p className="text-gray-600">Three simple steps to translate images</p>
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
