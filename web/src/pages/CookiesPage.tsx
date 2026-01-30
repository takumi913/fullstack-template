import { Link } from "react-router-dom";
import { ArrowLeft, Cookie } from "lucide-react";
import SEO from "@/components/SEO";

export default function CookiesPage() {
  return (
    <>
      <SEO
        title="Cookie Policy"
        description="Learn about how MDZZ Toolbox uses cookies. We use minimal cookies to improve your experience."
        canonicalUrl="/cookies"
      />
      <div className="min-h-screen pt-[66px] pb-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <div className="mb-8 pt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Page Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
              <Cookie className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Cookie Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                What are Cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device when you
                visit a website. They are widely used to make websites work or
                work more efficiently, as well as to provide information to the
                owners of the site.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                How We Use Cookies
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>We use Cookies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Keep you logged in</li>
                  <li>Remember your preferences</li>
                  <li>Analyze website usage</li>
                  <li>Improve user experience</li>
                  <li>Provide personalized content</li>
                </ul>
              </div>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Types of Cookies
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    Essential Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These Cookies are necessary for the basic functioning of the
                    website, including user authentication and security
                    features.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These Cookies allow the website to remember your choices and
                    provide enhanced personalized features.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These Cookies help us understand how visitors interact with
                    the website by collecting and reporting information
                    anonymously.
                  </p>
                </div>
              </div>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Managing Cookies
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>You can control and manage Cookies in the following ways:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Delete or block Cookies through browser settings</li>
                  <li>Set your browser to notify you before setting Cookies</li>
                  <li>Use browser's privacy mode</li>
                  <li>Use third-party Cookie management tools</li>
                </ul>
                <p className="mt-4 text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  Please note that disabling certain Cookies may affect the
                  functionality of the website.
                </p>
              </div>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Contact Us
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  If you have any questions about our Cookie Policy, please
                  contact us:
                </p>
                <p className="mt-4 font-medium text-foreground">Email: support@mdzz.uk</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
