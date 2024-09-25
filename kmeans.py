import numpy as np

class KMeans:
    def __init__(self, k=3, max_iters=100, init_method='random'):
        self.k = k
        self.max_iters = max_iters
        self.init_method = init_method
        self.centroids = None

    def initialize_centroids(self, X):
        if self.init_method == 'random':
            indices = np.random.choice(X.shape[0], self.k, replace=False)
            return X[indices]
        elif self.init_method == 'farthest_first':
            return self.farthest_first_init(X)
        elif self.init_method == 'kmeans++':
            return self.kmeans_plus_plus_init(X)
        # Manual will be handled by frontend input

    def fit(self, X):
        self.centroids = self.initialize_centroids(X)
        for _ in range(self.max_iters):
            clusters = self.create_clusters(X)
            old_centroids = self.centroids
            self.centroids = self.calculate_new_centroids(clusters, X)
            if np.all(old_centroids == self.centroids):
                break
        return self.centroids

    def create_clusters(self, X):
        clusters = [[] for _ in range(self.k)]
        for idx, point in enumerate(X):
            closest_centroid = np.argmin(np.linalg.norm(point - self.centroids, axis=1))
            clusters[closest_centroid].append(idx)
        return clusters

    def calculate_new_centroids(self, clusters, X):
        return np.array([X[cluster].mean(axis=0) for cluster in clusters])

    # Initialization Methods: KMeans++ and Farthest First
    def kmeans_plus_plus_init(self, X):
        # Implementation of KMeans++ initialization
        pass

    def farthest_first_init(self, X):
        # Implementation of Farthest First initialization
        pass
