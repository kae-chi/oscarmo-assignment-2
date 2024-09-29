document.addEventListener('DOMContentLoaded', () => {
	const plotArea = document.getElementById('plot-area');
	const numClustersInput = document.getElementById('num-clusters');
	const initMethodSelect = document.getElementById('init-method');

	let dataset = generateRandomDataset();
	let centroids = [];
	let assignments = [];
	let previousCentroids = [];
	let manualInitMode = false;
	let manualCentroidCount = 0;

	initMethodSelect.addEventListener('change', handleInitMethodChange);
	document.getElementById('new-dataset').addEventListener('click', handleNewDataset);
	document.getElementById('step').addEventListener('click', handleStep);
	document.getElementById('converge').addEventListener('click', handleConverge);
	document.getElementById('reset').addEventListener('click', handleReset);
	plotArea.addEventListener('click', handlePlotAreaClick);

	function handleInitMethodChange() {
		const initMethod = initMethodSelect.value;
		if (initMethod === 'manual') {
			activateManualMode();
		} else {
			manualInitMode = false;
		}
	}

	function handleNewDataset() {
		dataset = generateRandomDataset();
		resetState();
		drawPlot();
	}

	function handleStep() {
		if (centroids.length === 0) {
			initializeCentroids();
		} else {
			assignClusters();
			updateCentroids();
		}
		drawPlot();
	}

	function handleConverge() {
		if (centroids.length === 0) {
			initializeCentroids();
		}
		while (!isConverged()) {
			assignClusters();
			updateCentroids();
		}
		drawPlot();
	}

	function handleReset() {
		resetState();
		drawPlot();
	}

	function handlePlotAreaClick(event) {
		if (manualInitMode) {
			const k = parseInt(numClustersInput.value);
			if (manualCentroidCount < k) {
				addManualCentroid(event);
				if (manualCentroidCount === k) {
					manualInitMode = false;
					alert('All centroids selected, now proceed with clustering');
				}
				drawPlot();
			}
		}
	}

	function activateManualMode() {
		manualInitMode = true;
		manualCentroidCount = 0;
		alert('Click on the plot area to select centroids');
	}

	function resetState() {
		centroids = [];
		assignments = [];
		manualInitMode = false;
		manualCentroidCount = 0;
	}

	function addManualCentroid(event) {
		const rect = plotArea.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		centroids.push({ x: x, y: y });
		manualCentroidCount++;
	}

	function initializeCentroids() {
		const k = parseInt(numClustersInput.value);
		const initMethod = initMethodSelect.value;

		resetState();

		if (initMethod === 'manual') {
			activateManualMode();
		} else if (initMethod === 'farthest') {
			initializeFarthestFirst(k);
		} else if (initMethod === 'random') {
			initializeRandomCentroids(k);
		} else if (initMethod === 'kmeans++') {
			initializeKMeansPlusPlus(k);
		}

		drawPlot();
	}

	function initializeFarthestFirst(k) {
		const firstCentroid = dataset[Math.floor(Math.random() * dataset.length)];
		centroids.push({ ...firstCentroid });

		while (centroids.length < k) {
			let farthestPoint = null;
			let maxDistance = -Infinity;

			dataset.forEach(point => {
				const minDistanceToCentroid = centroids.reduce((minDist, centroid) => {
					const distance = calculateDistance(point, centroid);
					return Math.min(minDist, distance);
				}, Infinity);

				if (minDistanceToCentroid > maxDistance) {
					maxDistance = minDistanceToCentroid;
					farthestPoint = point;
				}
			});

			centroids.push({ ...farthestPoint });
		}
	}

	function initializeRandomCentroids(k) {
		for (let i = 0; i < k; i++) {
			const randomPoint = dataset[Math.floor(Math.random() * dataset.length)];
			centroids.push({ ...randomPoint });
		}
	}

	function initializeKMeansPlusPlus(k) {
		centroids.push(dataset[Math.floor(Math.random() * dataset.length)]);

		while (centroids.length < k) {
			const distances = dataset.map(point => {
				const minDistance = centroids.reduce((minDist, centroid) => {
					return Math.min(minDist, calculateDistance(point, centroid));
				}, Infinity);
				return minDistance;
			});

			const totalDistance = distances.reduce((sum, d) => sum + d, 0);
			const randomValue = Math.random() * totalDistance;
			let cumulativeDistance = 0;

			for (let i = 0; i < dataset.length; i++) {
				cumulativeDistance += distances[i];
				if (cumulativeDistance >= randomValue) {
					centroids.push({ ...dataset[i] });
					break;
				}
			}
		}
	}

	function generateRandomDataset() {
		const data = [];
		for (let i = 0; i < 500; i++) {
			data.push({
				x: Math.random() * plotArea.clientWidth - 1,
				y: Math.random() * plotArea.clientHeight - 1
			});
		}
		return data;
	}

	function assignClusters() {
		assignments = dataset.map(point => {
			let closestIndex = 0;
			let minDistance = Infinity;
			centroids.forEach((centroid, index) => {
				const distance = calculateDistance(point, centroid);
				if (distance < minDistance) {
					minDistance = distance;
					closestIndex = index;
				}
			});
			return closestIndex;
		});
	}

	function updateCentroids() {
		// Store the current centroids as previous centroids
		previousCentroids = copyCentroids(centroids);
	
		// Initialize an array to store the sum of points and counts per cluster
		const centroidSums = initializeCentroidSums(centroids.length);
	
		// Sum up all points for each cluster
		aggregateClusterPoints(centroidSums);
	
		// Calculate new centroids based on the average of points in each cluster
		recalculateCentroids(centroidSums);
	}
	
	// Creates a deep copy of the centroids array
	function copyCentroids(centroids) {
		return centroids.map(centroid => ({ ...centroid }));
	}
	
	// Initializes an array to hold sums of x, y coordinates and point counts for each centroid
	function initializeCentroidSums(k) {
		return Array(k).fill(0).map(() => ({ x: 0, y: 0, count: 0 }));
	}
	
	// Aggregates the sum of coordinates and counts for each cluster
	function aggregateClusterPoints(centroidSums) {
		dataset.forEach((point, index) => {
			const cluster = assignments[index];
			centroidSums[cluster].x += point.x;
			centroidSums[cluster].y += point.y;
			centroidSums[cluster].count += 1;
		});
	}
	
	// Recalculates centroid positions by averaging the coordinates of the points in each cluster
	function recalculateCentroids(centroidSums) {
		centroidSums.forEach((sum, index) => {
			if (sum.count > 0) {
				centroids[index].x = sum.x / sum.count;
				centroids[index].y = sum.y / sum.count;
			}
		});
	}
	

	function isConverged() {
		return centroids.every((centroid, index) => {
			const prev = previousCentroids[index];
			return centroid.x === prev.x && centroid.y === prev.y;
		});
	}

	function drawPlot() {
		plotArea.innerHTML = '';
		dataset.forEach((point, index) => {
			const dot = createDot(point.x, point.y, assignments[index] !== undefined ? `hsl(${assignments[index] * 360 / centroids.length}, 100%, 50%)` : 'black');
			plotArea.appendChild(dot);
		});
		centroids.forEach(centroid => {
			const center = createDot(centroid.x, centroid.y, 'red', '10px');
			plotArea.appendChild(center);
		});
	}

	function createDot(x, y, color, size = '5px') {
		const dot = document.createElement('div');
		dot.style.position = 'absolute';
		dot.style.width = size;
		dot.style.height = size;
		dot.style.backgroundColor = color;
		dot.style.borderRadius = '50%';
		dot.style.left = `${x}px`;
		dot.style.top = `${y}px`;
		return dot;
	}

	function calculateDistance(point1, point2) {
		return Math.hypot(point1.x - point2.x, point1.y - point2.y);
	}

	drawPlot();
});
