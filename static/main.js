let chart1;
let chart2;
let chart3;
let chart4;

function stackedArea(traces) {
	for(let i=1; i<traces.length; i++) {
		for(let j=0; j<(Math.min(traces[i]['y'].length, traces[i-1]['y'].length)); j++) {
			traces[i]['y'][j] += traces[i-1]['y'][j];
		}
	}
	return traces;
}

$(function () {

	$.getJSON('/debug/charts/data?callback=?', function (data) {
		let pDataChart0 = [{x: [], y: [], type: "scattergl"}];

		for (i = 0; i < data.RPS.length; i++) {
			let d = moment(data.RPS[i].Ts).format('YYYY-MM-DD HH:mm:ss');
			pDataChart0[0].x.push(d);
			pDataChart0[0].y.push(data.RPS[i].Value);
		}

		chart1 = Plotly.newPlot('container0', pDataChart0, {
			title: "RPS",
			xaxis: {
				type: "date"
			},
			yaxis: {
				title: "RPS"
			}
		});

		let pDataChart1 = [{x: [], y: [], type: "scattergl"}];

		for (i = 0; i < data.GcPauses.length; i++) {
			let d = moment(data.GcPauses[i].Ts).format('YYYY-MM-DD HH:mm:ss');
			pDataChart1[0].x.push(d);
			pDataChart1[0].y.push(data.GcPauses[i].Value);
		}

		chart1 = Plotly.newPlot('container1', pDataChart1, {
			title: "GC Pauses",
			xaxis: {
				type: "date"
			},
			yaxis: {
				title: "Nanoseconds"
			}
		});

		let pDataChart2 = [{x: [], y: [], type: "scattergl"}];

		for (i = 0; i < data.BytesAllocated.length; i++) {
			let d = moment(data.BytesAllocated[i].Ts).format('YYYY-MM-DD HH:mm:ss');
			pDataChart2[0].x.push(d);
			pDataChart2[0].y.push(data.BytesAllocated[i].Value);
		}

		chart2 = Plotly.newPlot('container2', pDataChart2, {
			title: "Memory Allocated",
			xaxis: {
				type: "date"
			},
			yaxis: {
				title: "Bytes"
			}
		});

		let pDataChart3 = [
			{x: [], y: [], fill: 'tozeroy', name: 'sys', hoverinfo: 'none', type: "scattergl"},
			{x: [], y: [], fill: 'tonexty', name: 'user', hoverinfo: 'none', type: "scattergl"}
		];

		for (i = 0; i < data.CPUUsage.length; i++) {
			let d = moment(data.CPUUsage[i].Ts).format('YYYY-MM-DD HH:mm:ss');
			pDataChart3[0].x.push(d);
			pDataChart3[1].x.push(d);
			pDataChart3[0].y.push(data.CPUUsage[i].Sys);
			pDataChart3[1].y.push(data.CPUUsage[i].User);
		}

		pDataChart3 = stackedArea(pDataChart3);

		chart3 = Plotly.newPlot('container3', pDataChart3, {
			title: "CPU Usage",
			xaxis: {
				type: "date"
			},
			yaxis: {
				title: "Seconds"
			}
		});

		let pprofList = ["Block", "Goroutine", "Heap", "Mutex", "ThreadCreate"];
		let pDataChart4 = []
		for (i = 0; i < pprofList.length; i++) {
			pDataChart4.push({x: [], y: [], name: pprofList[i].toLowerCase()})
		}

		for (i = 0; i < data.Pprof.length; i++) {
			let d = moment(data.Pprof[i].Ts).format('YYYY-MM-DD HH:mm:ss');
			for (j = 0; j < pprofList.length; j++) {
				pDataChart4[j].x.push(d);
				pDataChart4[j].y.push(data.Pprof[i][pprofList[j]])
			}
		}

		chart4 = Plotly.newPlot('container4', pDataChart4, {
			title: "PPROF",
			xaxis: {
				type: "date",
			},
			yaxis: {
				title: "Count"
			}
		});
	});

	function wsurl() {
		let l = window.location;
		return ((l.protocol === "https:") ? "wss://" : "ws://") + l.hostname + (((l.port != 80) && (l.port != 443)) ? ":" + l.port : "") + "/debug/charts/data-feed";
	}

	ws = new WebSocket(wsurl());
	ws.onopen = function () {
		ws.onmessage = function (evt) {
			let data = JSON.parse(evt.data);
			let d = moment(data.Ts).format('YYYY-MM-DD HH:mm:ss');
			if (data.RPS != 0) {
				Plotly.extendTraces('container0', {x:[[d]],y:[[data.RPS]]}, [0], 86400);
			}
			if (data.GcPause != 0) {
				Plotly.extendTraces('container1', {x:[[d]],y:[[data.GcPause]]}, [0], 86400);
			}
			Plotly.extendTraces('container2', {x:[[d]],y:[[data.BytesAllocated]]}, [0], 86400);
			Plotly.extendTraces('container3', {x:[[d], [d]],y:[[data.CPUSys], [data.CPUUser]]}, [0, 1], 86400);
			Plotly.extendTraces('container4', {x:[[d], [d], [d], [d], [d]],y:[[data.Block], [data.Goroutine], [data.Heap], [data.Mutex], [data.Threadcreate]]}, [0, 1, 2, 3, 4], 86400); 
		}
	};
})
