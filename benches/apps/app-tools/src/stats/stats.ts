import { getFPS, type Measurement, measure } from '@sim/bench-tools';
import './stats.css';

type Stats = Record<string, () => any>;

export function initStats(extras?: Stats) {
	const measurementRef = { current: { delta: 0, average: 0 } as Measurement };
	const fpsRef = { current: 0 };

	const updates: (() => void)[] = [];

	const stats = {
		FPS: () => fpsRef.current.toFixed(3),
		'Frame time': () => `${measurementRef.current.average.toFixed(3)}ms`,
		...extras,
	};

	let ele: HTMLElement | null = null;

	const reset = () => {
		measurementRef.current = { delta: 0, average: 0 };
		fpsRef.current = 0;
		updateStats();
	};

	const create = () => {
		ele = document.createElement('div');
		document.body.appendChild(ele);
		ele.classList.add('stats');

		for (const [label, value] of Object.entries(stats)) {
			const { div, update } = createStat(label, value);
			ele.appendChild(div);
			updates.push(update);
		}

		// Add reset button
		const resetButton = document.createElement('button');
		resetButton.textContent = 'Reset';
		resetButton.onclick = (e) => {
			e.preventDefault();
			reset();
		};
		ele.appendChild(resetButton);
	};

	const updateStats = () => {
		getFPS(fpsRef);
		for (const update of updates) {
			update();
		}
	};

	return {
		updateStats,
		measure: async (fn: (...args: any[]) => any) => await measure(fn, measurementRef),
		destroy: () => ele?.remove(),
		create,
	};
}

function createStat(label: string, getValue: () => any) {
	const div = document.createElement('div');
	div.classList.add('stat');
	div.innerHTML = `${label}: 0`;

	function update() {
		div.innerHTML = `${label}: ${getValue()}`;
	}

	return { div, update };
}
