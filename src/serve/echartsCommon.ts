import { onMounted, getCurrentInstance, ComponentInternalInstance, Ref } from 'vue';
import { ECharts, EChartsOption, DataZoomComponentOption } from 'echarts';

export type MyEChartsOption = EChartsOption & { currentIndex: number };

export const getInstance = (): ComponentInternalInstance => {
	return getCurrentInstance() as ComponentInternalInstance;
};

//使用主题初始化
export const initChart = (
	chart: ECharts,
	lineChart: Ref,
	instance?: ComponentInternalInstance,
): ECharts => {
	let { proxy } = instance || getInstance();
	let dom = lineChart.value;
	let echarts = proxy?.$echarts as ECharts & { init: any };
	chart = echarts.init(dom);
	window.addEventListener('resize', function () {
		// 让我们的图表调用 resize这个方法
		chart && chart.resize();
	});
	return chart;
};

// tooltip自动轮询
export const dynamic = (
	timer: NodeJS.Timer | null,
	chart: ECharts,
	_op: EChartsOption,
	sec: number,
) => {
	let op = _op as MyEChartsOption;
	op.currentIndex = -1;
	const fn = () => {
		if (op.series) {
			const series = op.series as any[];
			let dataLen = series[0].data.length;
			if (dataLen <= 0) return;
			// 取消之前高亮的图形
			chart?.dispatchAction({
				type: 'downplay',
				seriesIndex: 0,
				dataIndex: op.currentIndex,
			});
			op.currentIndex = (op.currentIndex + 1) % dataLen;
			// 高亮当前图形
			chart?.dispatchAction({
				type: 'highlight',
				seriesIndex: 0,
				dataIndex: op.currentIndex,
			});
			// 显示 tooltip
			chart?.dispatchAction({
				type: 'showTip',
				seriesIndex: 0,
				dataIndex: op.currentIndex,
			});
			timer && clearTimeout(timer);
			timer = setTimeout(fn, sec);
		}
	};
	timer = setTimeout(fn, sec);
};
// 当 line  bar 数据过多是启动轮询
export const updateChart = (
	chart: ECharts,
	option: EChartsOption,
	xAxisData: string[],
	dataZoomLength: number,
	zoomLoop: NodeJS.Timer | null,
	dataZoomTime: number,
) => {
	let fn = () => {
		if (xAxisData.length <= dataZoomLength + 1) {
			zoomLoop && clearTimeout(zoomLoop);
			return;
		}
		// 每次向后滚动一个，最后一个从头开始。
		let zoom = option.dataZoom as DataZoomComponentOption[];
		if ((zoom[0].endValue as number) >= xAxisData.length - 1) {
			zoom[0].endValue = dataZoomLength;
			zoom[0].startValue = 0;
		} else {
			zoom[0].endValue = (zoom[0].endValue as number) + 1;
			zoom[0].startValue = (zoom[0].startValue as number) + 1;
		}
		chart?.setOption(option as any);
		zoomLoop && clearTimeout(zoomLoop);
		zoomLoop = setTimeout(fn, dataZoomTime);
	};
	// 启动
	setTimeout(fn, dataZoomTime);
};
