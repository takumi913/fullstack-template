import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Calendar, ArrowRight } from "lucide-react";

export const blogPosts = [
  {
    slug: "how-ai-watermark-removers-work",
    title: "How AI Watermark Removers Work: A Deep Dive",
    excerpt: "Discover the technology behind AI watermark removal. Learn how deep learning models detect and reconstruct image data to seamlessly erase unwanted elements.",
    date: "2024-03-20",
    author: "AI Research Team",
    image: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?auto=format&fit=crop&q=80&w=800",
    category: "Technology"
  }
];

export default function BlogPage() {
  return (
    <>
      <SEO
        title="Blog - AI Image Tools Insights"
        description="Latest news, tutorials, and insights about AI image processing technology."
        canonicalUrl="/blog"
      />
      
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Insights</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the future of AI image editing with our latest articles, tutorials, and research updates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.slug} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-sky-600 transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs">
                        {post.author[0]}
                      </div>
                      {post.author}
                    </div>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1"
                    >
                      Read more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
