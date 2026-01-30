import React from 'react';
import { Link } from "react-router-dom";
import { Github, Twitter, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const toolLinks = [
    { label: "Remove Watermark", path: "/remove-watermark" },
    { label: "Translate Image", path: "/translate-image" },
  ];

  const resourceLinks = [
    { label: "Pricing", path: "/pricing" },
    { label: "FAQ", path: "/faq" },
    { label: "Changelog", path: "/changelog" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", path: "/legal/privacy-policy" },
    { label: "Terms of Service", path: "/legal/terms" },
    { label: "Refund Policy", path: "/legal/refund-policy" },
  ];

  const socialLinks = [
    {
      label: "GitHub",
      href: "https://github.com/zaunist",
      icon: Github,
    },
    {
      label: "Twitter",
      href: "https://twitter.com/mdzz",
      icon: Twitter,
    },
    {
      label: "Email",
      href: "mailto:support@mdzz.uk",
      icon: Mail,
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-semibold text-slate-900 text-lg">MDZZ</span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 max-w-xs leading-relaxed">
              AI-powered image tools for creators. Remove watermarks, translate
              manga, and more — all in your browser.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-sky-50 flex items-center justify-center transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                </a>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Tools
            </h3>
            <ul className="mt-4 space-y-3">
              {toolLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-sky-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-sky-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-sky-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} MDZZ Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <span>Made with</span>
              <span className="text-red-400">♥</span>
              <span>for creators worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
