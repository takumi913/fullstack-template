import { runSeoPreflight } from "../src/seo/preflight";

const { strict, siteUrl, resolvedSite } = runSeoPreflight(process.env);

console.log(
  `SEO preflight passed (${strict ? "strict" : "development"}): ${resolvedSite.name} -> ${siteUrl}`,
);
