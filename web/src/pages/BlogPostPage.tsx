import { useParams, Navigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { blogPosts } from "./BlogPage";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <SEO
        title={`${post.title} - AI Tools Blog`}
        description={post.excerpt}
        canonicalUrl={`/blog/${post.slug}`}
        ogImage={post.image}
      />
      
      <article className="min-h-screen bg-white pt-24 pb-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-medium">
              {post.category}
            </span>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              5 min read
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between py-6 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {post.author[0]}
              </div>
              <div>
                <div className="font-medium text-gray-900">{post.author}</div>
                <div className="text-sm text-gray-500">{post.date}</div>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg prose-sky max-w-none text-gray-600">
            <p className="lead text-xl text-gray-900 font-medium mb-8">
              {post.excerpt}
            </p>
            
            <h2>Understanding the Challenge</h2>
            <p>
              Watermarks are designed to be difficult to remove. They often contain semi-transparent overlays, complex patterns, or text that blends with the underlying image features. Traditional tools like the Clone Stamp require manual effort and often leave visible artifacts.
            </p>

            <h2>How AI Approaches the Problem</h2>
            <p>
              Modern AI watermark removers use a type of deep learning architecture called <strong>Generative Adversarial Networks (GANs)</strong> or <strong>Diffusion Models</strong>. These models are trained on millions of pairs of images: one with a watermark and one without.
            </p>
            
            <div className="bg-sky-50 border-l-4 border-sky-500 p-6 my-8 rounded-r-xl">
              <h4 className="text-sky-900 font-bold mb-2">Key Concept: Inpainting</h4>
              <p className="text-sky-800 m-0 text-base">
                Inpainting is the process of reconstructing lost or deteriorated parts of an image. The AI analyzes the surrounding pixels to predict what should exist behind the watermark.
              </p>
            </div>

            <h3>The Process Step-by-Step</h3>
            <ol>
              <li><strong>Detection:</strong> The AI first identifies the region containing the watermark.</li>
              <li><strong>Context Analysis:</strong> It analyzes textures, colors, and patterns in the surrounding area.</li>
              <li><strong>Reconstruction:</strong> The model generates new pixels to fill the gap, ensuring consistency with the rest of the image.</li>
              <li><strong>Refinement:</strong> A final pass smooths out edges and corrects lighting artifacts.</li>
            </ol>

            <h2>Why It Matters</h2>
            <p>
              This technology isn't just for removing logos. It's used in:
            </p>
            <ul>
              <li>Restoring old, damaged photographs</li>
              <li>Removing distracting objects from vacation photos</li>
              <li>Cleaning up scanned documents</li>
            </ul>

            <p>
              As these models continue to evolve, we can expect even higher precision and the ability to handle more complex occlusions with ease.
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
