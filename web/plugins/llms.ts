/**
 * Vite 插件：构建时自动生成 llms.txt
 *
 * llms.txt 是一种新兴标准，帮助 AI 爬虫快速了解网站内容
 * 参考: https://llmstxt.org/
 */

import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

export interface LlmsPage {
  path: string;
  title: string;
  description: string;
}

export interface LlmsTool {
  name: string;
  path: string;
  description: string;
  features: string[];
}

export interface LlmsPluginOptions {
  siteName: string;
  tagline: string;
  description: string;
  hostname: string;
  coreFeatures: string[];
  tools: LlmsTool[];
  pages: LlmsPage[];
  techStack?: {
    frontend?: string;
    backend?: string;
    deployment?: string;
  };
}

export function llmsPlugin(options: LlmsPluginOptions): Plugin {
  const {
    siteName,
    tagline,
    hostname,
    description,
    coreFeatures,
    tools,
    pages,
    techStack,
  } = options;

  return {
    name: "vite-plugin-llms",
    apply: "build",
    closeBundle() {
      const lines: string[] = [];

      // Header
      lines.push(`# ${siteName}`);
      lines.push("");
      lines.push(`> ${tagline}`);
      lines.push("");
      lines.push(description);
      lines.push("");

      // Core Features
      lines.push("## Core Features");
      lines.push("");
      for (const feature of coreFeatures) {
        lines.push(`- ${feature}`);
      }
      lines.push("");

      // Tools
      lines.push("## Available Tools");
      lines.push("");
      for (const tool of tools) {
        lines.push(`### ${tool.name}`);
        lines.push(`- **URL**: ${hostname}${tool.path}`);
        lines.push(`- **Description**: ${tool.description}`);
        lines.push("- **Features**:");
        for (const feature of tool.features) {
          lines.push(`  - ${feature}`);
        }
        lines.push("");
      }

      // Pages
      lines.push("## Pages");
      lines.push("");
      for (const page of pages) {
        lines.push(`- ${hostname}${page.path}: ${page.title} - ${page.description}`);
      }
      lines.push("");

      // Tech Stack
      if (techStack) {
        lines.push("## Technical Stack");
        lines.push("");
        if (techStack.frontend) {
          lines.push(`- **Frontend**: ${techStack.frontend}`);
        }
        if (techStack.backend) {
          lines.push(`- **Backend**: ${techStack.backend}`);
        }
        if (techStack.deployment) {
          lines.push(`- **Deployment**: ${techStack.deployment}`);
        }
        lines.push("");
      }

      // Footer
      lines.push("## Contact");
      lines.push("");
      lines.push(`For questions or support, please visit ${hostname}`);
      lines.push("");

      const content = lines.join("\n");

      // 输出到 dist 目录
      const distPath = path.resolve(process.cwd(), "dist");
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
      }

      fs.writeFileSync(path.join(distPath, "llms.txt"), content);
      console.log("✅ llms.txt generated successfully");
    },
  };
}
