/**
 * 技能页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/skillsConfig.ts 控制。
 */
import type { SkillItem } from "@/types/skillsConfig";

export const skillsData: SkillItem[] = [
	{
		name: "HTML",
		description: "语义化结构与可访问的页面骨架。",
		icon: "simple-icons:html5",
		category: "frontend",
		level: "intermediate",
	},
	{
		name: "CSS",
		description: "布局、响应式适配与视觉还原。",
		icon: "simple-icons:css",
		category: "frontend",
		level: "intermediate",
	},
	{
		name: "JavaScript",
		description: "浏览器交互逻辑与异步数据处理。",
		icon: "simple-icons:javascript",
		category: "frontend",
		level: "intermediate",
	},
	{
		name: "Vue",
		description: "组件化开发与单页应用实践。",
		icon: "simple-icons:vuedotjs",
		category: "frontend",
		level: "intermediate",
	},
];

/** 获取所有技能数据列表 */
export function getSkillsList(): SkillItem[] {
	return skillsData;
}
