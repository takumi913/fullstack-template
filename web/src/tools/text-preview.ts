import type { TextMode } from "../content/toolsmith-catalog";

export const textSamples = {
  zh: "远程办公在过去几年里迅速普及。很多团队发现，员工不必每天通勤，节省下来的时间可以用于专注工作和休息，整体效率反而有所提升。但与此同时，沟通成本上升、新人融入困难、工作与生活边界模糊等问题也随之出现。越来越多的公司开始尝试混合办公：每周固定两到三天到岗，其余时间远程，以在灵活性与协作之间找到平衡。",
  en: "Remote work has spread rapidly over the past few years. Many teams found that without a daily commute, people could spend the saved time on focused work and rest, and overall productivity actually went up. At the same time, new problems emerged: higher communication overhead, harder onboarding for new hires, and blurred lines between work and life. More and more companies are now trying hybrid setups — two or three fixed office days a week, remote the rest — to balance flexibility with collaboration.",
};
// The supplied design uses fixture responses; these stay separate from any production AI client.
export const textPreviewResults: Record<"en" | "zh", Record<TextMode, string>> = {
  zh: {
    rewrite:
      "过去几年，远程办公迅速走进了大多数团队。省去通勤后，员工能把更多时间留给深度工作与休息，整体产出不降反升。不过，它也带来了新的挑战：沟通更费力，新同事更难融入，工作与生活的界线也越来越模糊。因此，不少公司转向混合办公——每周固定到岗两三天，其余时间远程——在灵活与协作之间寻找平衡点。",
    summarize:
      "• 远程办公普及，省去通勤后效率有所提升\n• 随之而来：沟通成本高、新人融入难、工作生活边界模糊\n• 趋势：每周到岗 2–3 天的混合办公，兼顾灵活与协作",
    translate:
      "Remote work has become widespread over the past few years. Many teams have found that without a daily commute, employees can spend the time saved on focused work and rest, and overall efficiency has actually improved. At the same time, problems such as rising communication costs, difficulty integrating new hires, and blurred boundaries between work and life have emerged. More and more companies are trying hybrid work: two to three fixed office days a week, remote the rest, to strike a balance between flexibility and collaboration.",
  },
  en: {
    rewrite:
      "Over the last few years, remote work has gone mainstream. Without the daily commute, people reinvest that time in deep work and rest — and output has often risen, not fallen. But it brings new friction: communication takes more effort, new hires struggle to settle in, and the line between work and home gets fuzzy. That is why many companies are moving to hybrid: two or three set office days a week, remote the rest, balancing flexibility with collaboration.",
    summarize:
      "• Remote work is widespread; skipping the commute has lifted productivity\n• Downsides: more communication overhead, harder onboarding, blurred work–life lines\n• Trend: hybrid schedules with 2–3 office days to balance flexibility and teamwork",
    translate:
      "过去几年，远程办公迅速普及。许多团队发现，没有了每天的通勤，员工可以把节省的时间用于专注工作和休息，整体效率反而提高了。与此同时，新的问题也出现了：沟通成本上升、新员工融入更难、工作与生活的界限变得模糊。越来越多的公司开始尝试混合办公——每周固定两三天到办公室，其余时间远程——在灵活性与协作之间取得平衡。",
  },
};
export const textOptions = {
  rewrite: {
    zh: ["正式", "轻松", "简洁"],
    en: ["Formal", "Casual", "Concise"],
  },
  summarize: {
    zh: ["一句话", "要点", "段落"],
    en: ["One line", "Bullets", "Paragraph"],
  },
  translate: {
    zh: ["English", "日本語", "Español"],
    en: ["中文", "日本語", "Español"],
  },
};
