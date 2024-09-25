from flask import Flask, render_template, jsonify, request
import numpy as np
from kmeans import KMeans

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/step', methods=['POST'])
def step():
    # Receive data and perform one step of KMeans clustering
    # Return updated centroids and cluster assignments
    pass

@app.route('/converge', methods=['POST'])
def converge():
    # Run KMeans to convergence
    pass

if __name__ == '__main__':
    app.run(debug=True, port=3000)
