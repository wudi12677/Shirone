import { argbFromRgb, Hct } from "@material/material-color-utilities";
import { setHue } from "@utils/setting-utils";
import { siteConfig } from "@/config";

const SAMPLE_SIZE = 48;
const MIN_SATURATION = 0.18;
const MIN_LIGHTNESS = 0.1;
const MAX_LIGHTNESS = 0.9;

/**
 * 从横幅图片估算主色相（HCT 0-360）。
 * 按饱和度与中间明度加权平均彩色像素，忽略近黑、近白与灰阶像素；
 * 没有有效彩色像素（如纯黑/纯白图片）时返回 null。
 */
export function extractHueFromImage(image: HTMLImageElement): number | null {
	const canvas = document.createElement("canvas");
	canvas.width = SAMPLE_SIZE;
	canvas.height = SAMPLE_SIZE;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return null;

	try {
		ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
	} catch {
		return null;
	}

	const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
	let r = 0;
	let g = 0;
	let b = 0;
	let weightSum = 0;

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < 200) continue;
		const red = data[i];
		const green = data[i + 1];
		const blue = data[i + 2];
		const max = Math.max(red, green, blue);
		const min = Math.min(red, green, blue);
		const saturation = max === 0 ? 0 : (max - min) / max;
		const lightness = (max + min) / 510;
		if (
			saturation < MIN_SATURATION ||
			lightness < MIN_LIGHTNESS ||
			lightness > MAX_LIGHTNESS
		) {
			continue;
		}
		const weight = saturation * (1 - Math.abs(lightness - 0.5));
		r += red * weight;
		g += green * weight;
		b += blue * weight;
		weightSum += weight;
	}

	if (weightSum < 1) return null;

	const hue = Hct.fromInt(
		argbFromRgb(
			Math.round(r / weightSum),
			Math.round(g / weightSum),
			Math.round(b / weightSum),
		),
	).hue;
	return Math.round(hue) % 360;
}

function applyHue(image: HTMLImageElement): void {
	const hue = extractHueFromImage(image);
	if (hue === null) return;
	setHue(hue);
}

/**
 * 首页横幅加载后，从当前横幅图片提取主色相并应用为站点主题色。
 * 关闭 `themeColor.extractFromBanner` 时不执行。
 */
export function applyBannerHue(): void {
	if (!siteConfig.themeColor.extractFromBanner) return;

	const image = document.querySelector<HTMLImageElement>(
		".banner-stage__image--active, .banner-stage__image",
	);
	if (!image) return;

	// 延后到下一轮事件循环，确保 Layout 的色相初始化先完成。
	const run = () => window.setTimeout(() => applyHue(image), 0);
	if (image.complete && image.naturalWidth > 0) {
		run();
	} else {
		image.addEventListener("load", run, { once: true });
	}
}
