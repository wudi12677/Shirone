<script lang="ts">
/**
 * 解压气泡交互视图（StressRelief.astro 的水合岛）。
 * 20 个可点击气泡，捏破后凹陷；全部捏完显示完成文案，可一键重新铺满。
 */
const TOTAL = 20;

let popped = $state<boolean[]>(Array.from({ length: TOTAL }, () => false));
const count = $derived(popped.filter(Boolean).length);
const done = $derived(count === TOTAL);

/** 首次点击时才创建，避免无交互时的音频资源占用。 */
let audioContext: AudioContext | null = null;

/** 合成一声短促的「啵」，不依赖任何音频文件。 */
function playPop(): void {
	const AudioContextCtor =
		window.AudioContext ??
		(window as Window & { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext;
	if (!AudioContextCtor) return;

	audioContext ??= new AudioContextCtor();
	if (audioContext.state === "suspended") void audioContext.resume();

	const now = audioContext.currentTime;
	const oscillator = audioContext.createOscillator();
	const gain = audioContext.createGain();
	oscillator.type = "sine";
	oscillator.frequency.setValueAtTime(720, now);
	oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.09);
	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.exponentialRampToValueAtTime(0.14, now + 0.008);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
	oscillator.connect(gain).connect(audioContext.destination);
	oscillator.start(now);
	oscillator.stop(now + 0.13);
	oscillator.addEventListener("ended", () => {
		oscillator.disconnect();
		gain.disconnect();
	});
}

function pop(index: number): void {
	if (popped[index]) return;
	popped[index] = true;
	playPop();
	navigator.vibrate?.(12);
}

function reset(): void {
	popped = Array.from({ length: TOTAL }, () => false);
}
</script>

<div class="stress-relief">
	<p class="stress-relief__hint">
		{done ? "舒服了～全部捏完啦" : "戳破气泡，把今天的压力一起捏掉"}
	</p>

	<div class="stress-relief__grid" role="group" aria-label="解压气泡">
		{#each popped as isPopped, index (index)}
			<button
				type="button"
				class="stress-relief__bubble"
				class:is-popped={isPopped}
				aria-pressed={isPopped}
				aria-label={`气泡 ${index + 1}`}
				disabled={isPopped}
				onclick={() => pop(index)}
			></button>
		{/each}
	</div>

	<div class="stress-relief__footer">
		<span class="stress-relief__count">已捏 {count} / {TOTAL}</span>
		<button type="button" class="stress-relief__reset" onclick={reset}>
			重新铺满
		</button>
	</div>
</div>

<style>
	.stress-relief {
		display: flex;
		flex-direction: column;
		gap: var(--m3e-space-3);
	}

	.stress-relief__hint {
		margin: 0;
		color: var(--on-surface-variant);
		font: var(--m3e-type-body-small);
	}

	.stress-relief__grid {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: var(--m3e-space-2);
	}

	.stress-relief__bubble {
		aspect-ratio: 1;
		width: 100%;
		padding: 0;
		border: none;
		border-radius: var(--shape-corner-full);
		cursor: pointer;
		background: radial-gradient(
			circle at 32% 28%,
			color-mix(in oklab, var(--primary) 38%, var(--surface)),
			color-mix(in oklab, var(--primary) 16%, var(--surface))
		);
		box-shadow:
			inset 0 -2px 6px color-mix(in oklab, var(--primary) 20%, transparent),
			inset 0 2px 4px rgb(255 255 255 / 0.45);
		transition:
			transform var(--m3e-duration-short) var(--m3e-easing-emphasized),
			background var(--m3e-duration-short) var(--m3e-easing-standard),
			box-shadow var(--m3e-duration-short) var(--m3e-easing-standard);
	}

	.stress-relief__bubble:hover:not(:disabled) {
		transform: scale(1.06);
	}

	.stress-relief__bubble:active:not(:disabled) {
		transform: scale(0.9);
	}

	.stress-relief__bubble:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.stress-relief__bubble.is-popped {
		cursor: default;
		transform: scale(0.86);
		background: color-mix(in oklab, var(--surface-container-high) 90%, transparent);
		box-shadow: inset 0 1px 2px color-mix(in oklab, var(--outline) 35%, transparent);
	}

	.stress-relief__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--m3e-space-2);
	}

	.stress-relief__count {
		color: var(--on-surface-variant);
		font: var(--m3e-type-label-medium);
		font-variant-numeric: tabular-nums;
	}

	.stress-relief__reset {
		padding: 0.25rem 0.75rem;
		border: none;
		border-radius: var(--shape-corner-full);
		cursor: pointer;
		color: var(--primary);
		background: transparent;
		font: var(--m3e-type-label-large);
		transition: background var(--m3e-duration-short) var(--m3e-easing-standard);
	}

	.stress-relief__reset:hover {
		background: color-mix(in oklab, var(--primary) 10%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.stress-relief__bubble {
			transition: none;
		}
	}
</style>
