import { expect, test } from "@playwright/test";
import { registerPersistentShellSync } from "./feature-page";

const SKILL_COUNT = 4;

test.describe("技能页", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/skills/");
		await expect(page.locator(".skill-card")).toHaveCount(SKILL_COUNT);
	});

	test("渲染配置技能与离散熟练度", async ({ page }) => {
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"skills",
		);
		await expect(page.locator(".page-header__title")).toHaveText("技能");
		await expect(page.locator(".skills-section__count")).toHaveText(
			"4 项技能",
		);

		const vue = page.locator(".skill-card", { hasText: "Vue" });
		await expect(vue).toContainText("熟悉");
		await expect(vue.getByRole("meter")).toHaveAttribute(
			"aria-valuenow",
			"2",
		);
		await expect(vue.locator(".skill-card__segment--active")).toHaveCount(2);
	});

	test("侧栏页面过滤与直接加载导航高亮正确", async ({ page }) => {
		await expect(
			page.locator('widget-layout[data-id="categories"]'),
		).toBeVisible();
		await expect(page.locator('widget-layout[data-id="tags"]')).toBeVisible();
		await expect(
			page.locator('[data-nav-key="skills"]').first(),
		).toHaveAttribute("aria-current", "page");
	});
});

test.describe("技能页 Swup 导航", () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	registerPersistentShellSync("从持久顶栏进入后同步页面、导航与侧栏状态", {
		key: "skills",
		fromPath: "/games/",
		toPath: /\/skills\/$/,
		cardSelector: "skill-card",
		cardCount: SKILL_COUNT,
	});
});
