// Function to update the Plotly graph
function updatePlot() {
  let trace = {
      x: data.map(d => d[0]),
      y: data.map(d => d[1]),
      mode: 'markers',
      marker: { size: 8 }
  };
  
  let layout = {
      title: 'KMeans Clustering with Negative Values',
      xaxis: { title: 'X-Axis', range: [-10, 10] },
      yaxis: { title: 'Y-Axis', range: [-10, 10] },
      showlegend: false
  };
  
  Plotly.newPlot('plot', [trace], layout);
}

// Generate random dataset with values between -1 and 1
function generateRandomDataset() {
  let dataset = [];
  for (let i = 0; i < 500; i++) {
      let x = Math.random() * 2 - 1; // Generates a value between -1 and 1
      let y = Math.random() * 2 - 1; // Generates a value between -1 and 1
      dataset.push([x, y]);
  }
  return dataset;
}
