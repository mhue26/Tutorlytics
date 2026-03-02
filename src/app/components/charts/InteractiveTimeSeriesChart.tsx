"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

interface ChartPoint {
	label: string;
	value: number;
}

interface InteractiveTimeSeriesChartProps {
	data: ChartPoint[];
	mode: "lineArea" | "bar";
	yAxisLabel?: string;
	valueSuffix?: string;
	metricLabel?: string;
	color?: string;
	areaColor?: string;
	height?: number;
	hideYTickLabels?: boolean;
	hideHorizontalGridLines?: boolean;
	hideYAxisName?: boolean;
	scrollWindowPoints?: number;
}

export default function InteractiveTimeSeriesChart({
	data,
	mode,
	yAxisLabel = "Value",
	valueSuffix = "",
	metricLabel = "Value",
	color = "#f59e0b",
	areaColor = "rgba(245,158,11,0.12)",
	height = 180,
	hideYTickLabels = false,
	hideHorizontalGridLines = false,
	hideYAxisName = false,
	scrollWindowPoints,
}: InteractiveTimeSeriesChartProps) {
	const xData = data.map((d) => d.label);
	const yData = data.map((d) => d.value);
	const hasData = yData.some((v) => v > 0);
	const yMax = hasData ? undefined : 1;
	const canScroll =
		typeof scrollWindowPoints === "number" &&
		scrollWindowPoints > 0 &&
		data.length > scrollWindowPoints;

	const startValue = canScroll ? Math.max(0, data.length - scrollWindowPoints) : 0;
	const endValue = canScroll ? data.length - 1 : data.length - 1;

	const option: EChartsOption = {
		animation: true,
		grid: {
			left: 8,
			right: 4,
			top: 8,
			bottom: canScroll ? 20 : 0,
			containLabel: true,
		},
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "line",
				snap: true,
				lineStyle: {
					color: "#9ca3af",
					width: 1,
					type: "solid",
				},
			},
			backgroundColor: "rgba(17,24,39,0.92)",
			borderWidth: 0,
			textStyle: {
				color: "#f9fafb",
				fontSize: 12,
			},
			formatter: (params: any) => {
				const first = Array.isArray(params) ? params[0] : params;
				const axisLabel = first?.axisValueLabel ?? "";
				const value = Number(first?.data ?? 0);
				return `${axisLabel}<br/>${metricLabel}: <strong>${value}${valueSuffix}</strong>`;
			},
		},
		xAxis: {
			type: "category",
			data: xData,
			boundaryGap: mode === "bar" ? true : ["2%", "6%"],
			axisTick: { show: false },
			axisLine: { lineStyle: { color: "#e5e7eb" } },
			axisLabel: {
				color: "#9ca3af",
				fontSize: 10,
				margin: 0,
			},
		},
		yAxis: {
			type: "value",
			name: hideYAxisName ? "" : yAxisLabel,
			nameLocation: "middle",
			nameGap: 24,
			min: 0,
			max: yMax,
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: {
				show: !hideHorizontalGridLines,
				lineStyle: {
					color: "#f3f4f6",
				},
			},
			axisLabel: {
				show: !hideYTickLabels,
				color: "#9ca3af",
				fontSize: 10,
				formatter: `{value}${valueSuffix}`,
				margin: 8,
			},
			nameTextStyle: {
				color: "#6b7280",
				fontSize: 10,
			},
		},
		series: [
			mode === "lineArea"
				? {
						type: "line",
						data: yData,
						smooth: true,
						showSymbol: true,
						symbolSize: 4,
						lineStyle: {
							color,
							width: 3,
						},
						itemStyle: {
							color,
						},
						areaStyle: {
							color: areaColor,
						},
						emphasis: {
							focus: "series",
						},
				  }
				: {
						type: "bar",
						data: yData,
						barMaxWidth: 24,
						itemStyle: {
							color,
							borderRadius: [6, 6, 0, 0],
						},
						emphasis: {
							itemStyle: {
								color,
								opacity: 0.9,
							},
						},
				  },
		],
		dataZoom: canScroll
			? [
					{
						type: "inside",
						xAxisIndex: 0,
						startValue,
						endValue,
						filterMode: "none",
						moveOnMouseMove: true,
						moveOnMouseWheel: true,
						zoomOnMouseWheel: false,
					},
					{
						type: "slider",
						xAxisIndex: 0,
						startValue,
						endValue,
						height: 12,
						bottom: 2,
						borderColor: "#e5e7eb",
						fillerColor: "rgba(156,163,175,0.15)",
						backgroundColor: "rgba(0,0,0,0)",
						handleSize: 12,
						showDetail: false,
						moveHandleSize: 0,
					},
			  ]
			: undefined,
	};

	return (
		<ReactECharts
			option={option}
			style={{ height, width: "100%" }}
			notMerge
			lazyUpdate
		/>
	);
}

