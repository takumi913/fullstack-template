import { Link } from "react-router-dom";
import { ArrowLeft, ScrollText } from "lucide-react";
import SEO from "@/components/SEO";

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Read the Terms of Service for MDZZ Toolbox. Understand our usage guidelines and policies for our free online image tools."
        canonicalUrl="/terms"
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
              <ScrollText className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using our services, you agree to be bound by
                these Terms of Service. If you do not agree to these terms,
                please do not use our services.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                2. Service Description
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We provide online watermark removal and image processing
                services. We reserve the right to modify, suspend, or terminate
                any part of the service at any time without prior notice.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                3. User Responsibilities
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>As a user, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate registration information</li>
                  <li>Maintain the security of your account</li>
                  <li>Not use the service for illegal purposes</li>
                  <li>Respect intellectual property rights of others</li>
                  <li>Not upload malicious content or viruses</li>
                </ul>
              </div>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                4. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, trademarks, and intellectual property of the
                service belong to us or our licensors. Without explicit
                authorization, you may not copy, modify, distribute, or use any
                content.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                5. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The service is provided "as is" without any express or implied
                warranties. We shall not be liable for any direct, indirect,
                incidental, or consequential damages arising from your use of
                the service.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                6. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Modified
                terms will be posted on this page. Continued use of the service
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="modern-card p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                7. Contact Us
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  If you have any questions about these Terms, please contact
                  us:
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
