import { Link } from "react-router-dom";
import {
  ArrowRight,
  ImageOff,
  FileImage,
  Sparkles,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { memo } from "react";
import SEO from "@/components/SEO";

// 首页 SEO 结构化数据
const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MDZZ Toolbox",
  url: "https://toolbox.mdzz.studio",
  description:
    "Free online tools for image processing. Watermark remover, image converter, and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://toolbox.mdzz.studio/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

// 工具卡片组件
const ToolCard = memo(function ToolCard({
  icon: Icon,
  title,
  description,
  path,
  isNew,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  path: string;
  isNew?: boolean;
}) {
  return (
    <Link to={path} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block h-full group relative overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>
          {isNew && (
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-600 text-xs font-medium">
              New
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-4 flex items-center text-sm font-medium text-sky-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Try it now <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
});

// 特性卡片
const FeatureItem = memo(function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="mb-4 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600">
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{description}</p>
    </div>
  );
});

// 静态数据
const tools = [
  {
    icon: ImageOff,
    title: "Remove Watermark",
    description:
      "Remove watermarks, logos, text, and unwanted objects from images using advanced AI technology.",
    path: "/remove-watermark",
    isNew: true,
  },
  {
    icon: FileImage,
    title: "Translate Image",
    description:
      "Translate text within images while preserving the original visual layout and style.",
    path: "/translate-image",
    isNew: true,
  },
];

const features = [
  {
    icon: Sparkles,
    title: "100% Free",
    description: "Completely free access to all tools. No hidden costs or subscriptions.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "All processing happens locally in your browser. Your files never leave your device.",
  },
  {
    icon: Zap,
    title: "No Registration",
    description: "Start using our tools instantly. No account creation or login required.",
  },
  {
    icon: Clock,
    title: "Lightning Fast",
    description: "Optimized performance ensures your tasks are completed in seconds.",
  },
];

export default function HomePage() {
  return (
    <>
      <SEO
        title="MDZZ Toolbox - Free Online Image Tools"
        description="Free online tools for image processing. Remove watermarks, convert image formats, and more. 100% free, no registration required, all processing done locally in your browser."
        keywords="free image tools, watermark remover, image converter, online tools, no registration, privacy, browser-based"
        canonicalUrl="/"
        structuredData={homeStructuredData}
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white py-24 md:py-32">
          {/* Decorative blurs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 text-xs font-medium text-sky-700 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Free Online Tools
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Creative Tools for <br className="hidden md:block" />
              <span className="text-sky-600">Everyone</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              A collection of free, privacy-focused online tools for your daily needs.
              No registration required, just open and use.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a href="#tools" className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-sky-200">
                Explore Tools
              </a>
              <a href="https://github.com/mdzz-studio" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors">
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Available Tools</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Powerful utilities designed to simplify your workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <ToolCard key={index} {...tool} />
              ))}

              {/* Coming Soon Card */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 opacity-70 flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-500">More Coming Soon</h3>
                <p className="text-sm text-gray-400 mt-1">We are building more tools</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-sky-50/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Why Use MDZZ Toolbox?</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600">Simple steps to get your work done.</p>
            </div>

            <div className="relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-sky-100 -z-10 transform -translate-y-1/2" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  {
                    step: "01",
                    title: "Select Tool",
                    desc: "Choose the tool that fits your needs from our collection.",
                  },
                  {
                    step: "02",
                    title: "Upload & Process",
                    desc: "Upload your files. Processing happens locally on your device.",
                  },
                  {
                    step: "03",
                    title: "Download",
                    desc: "Get your results instantly. Secure and fast.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center bg-sky-50/50 md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none">
                    <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-sky-200 z-10">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
