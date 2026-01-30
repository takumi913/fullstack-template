import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import SEO from "@/components/SEO";

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Learn how MDZZ Toolbox protects your privacy. All image processing is done locally in your browser - we never upload or store your files."
        canonicalUrl="/privacy"
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                1. Information Collection
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  We collect information you provide when using our services,
                  including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (username, email address, etc.)</li>
                  <li>Usage data (access logs, operation records, etc.)</li>
                  <li>Device information (IP address, browser type, etc.)</li>
                </ul>
              </div>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                2. Information Usage
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>We use the collected information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and improve our services</li>
                  <li>Process your requests and transactions</li>
                  <li>Send important notifications and updates</li>
                  <li>Ensure service security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                3. Information Protection
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We employ industry-standard security measures to protect your
                personal information, including encrypted storage, access
                control, and regular security audits. We do not sell, trade, or
                transfer your personal information to third parties.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                4. Cookie Usage
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use Cookies and similar technologies to improve user
                experience, analyze website usage, and provide personalized
                content. You can control the use of Cookies through your browser
                settings.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                5. Your Rights
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and related data</li>
                  <li>Restrict or object to certain data processing</li>
                  <li>Data portability</li>
                </ul>
              </div>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                6. Contact Us
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  If you have any questions about this Privacy Policy or need to
                  exercise your rights, please contact us via:
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
