/**
 * Performance Monitor - Phase 3 Testing & Optimization
 * 
 * COMPREHENSIVE PERFORMANCE TRACKING:
 * - Real-time performance metrics collection
 * - Network efficiency monitoring
 * - Memory usage tracking
 * - User experience metrics (Core Web Vitals)
 * - Load testing simulation
 * - Performance regression detection
 * 
 * Benefits:
 * - Real-time performance insights
 * - Automatic performance regression alerts
 * - Detailed optimization impact measurement
 * - Production-ready monitoring
 */

import { getConfig } from './config.js';

/**
 * Performance Metrics Collector
 */
class PerformanceMetricsCollector {
  constructor() {
    this.config = getConfig();
    this.metrics = {
      // Network metrics
      network: {
        totalRequests: 0,
        failedRequests: 0,
        totalBytes: 0,
        averageLatency: 0,
        requestsPerMinute: 0,
        compressionRatio: 0
      },
      
      // Memory metrics
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        cacheSize: 0,
        memoryLeaks: []
      },
      
      // User experience metrics
      userExperience: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0
      },
      
      // Application-specific metrics
      application: {
        messagesLoaded: 0,
        conversationsLoaded: 0,
        cacheHitRate: 0,
        websocketUptime: 0,
        pollingFrequency: 0
      },
      
      // Optimization impact
      optimization: {
        dataTransferReduction: 0,
        loadTimeImprovement: 0,
        memoryUsageReduction: 0,
        requestReduction: 0
      }
    };
    
    this.baseline = null;
    this.samples = [];
    this.alerts = [];
    this.isMonitoring = false;
    
    // Performance observers
    this.observers = new Map();
    this.requestTimes = new Map();
    
    this.initializeObservers();
  }
  
  /**
   * Initialize performance observers
   */
  initializeObservers() {
    // Core Web Vitals observers
    if (typeof PerformanceObserver !== 'undefined') {
      // First Contentful Paint
      this.createObserver('paint', (entries) => {
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.userExperience.firstContentfulPaint = entry.startTime;
          }
        });
      });
      
      // Largest Contentful Paint
      this.createObserver('largest-contentful-paint', (entries) => {
        entries.forEach(entry => {
          this.metrics.userExperience.largestContentfulPaint = entry.startTime;
        });
      });
      
      // Cumulative Layout Shift
      this.createObserver('layout-shift', (entries) => {
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            this.metrics.userExperience.cumulativeLayoutShift += entry.value;
          }
        });
      });
      
      // First Input Delay
      this.createObserver('first-input', (entries) => {
        entries.forEach(entry => {
          this.metrics.userExperience.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
    }
    
    // Memory monitoring
    if (performance.memory) {
      setInterval(() => {
        this.updateMemoryMetrics();
      }, 5000); // Every 5 seconds
    }
  }
  
  /**
   * Create performance observer
   */
  createObserver(type, callback) {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ entryTypes: [type] });
      this.observers.set(type, observer);
    } catch (err) {
      console.warn(`⚠️ [PerformanceMonitor] Could not create observer for ${type}:`, err);
    }
  }
  
  /**
   * Start monitoring
   */
  startMonitoring(baselineData = null) {
    this.isMonitoring = true;
    this.baseline = baselineData;
    this.startTime = performance.now();
    
    console.log('🚀 [PerformanceMonitor] Monitoring started');
    
    // Start periodic sampling
    this.samplingInterval = setInterval(() => {
      this.takeSample();
    }, 10000); // Every 10 seconds
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
    }
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    console.log('🛑 [PerformanceMonitor] Monitoring stopped');
    
    return this.generateReport();
  }
  
  /**
   * Take performance sample
   */
  takeSample() {
    const sample = {
      timestamp: Date.now(),
      metrics: JSON.parse(JSON.stringify(this.metrics)),
      runtime: performance.now() - this.startTime
    };
    
    this.samples.push(sample);
    
    // Keep only last 100 samples
    if (this.samples.length > 100) {
      this.samples.shift();
    }
    
    // Check for performance regressions
    this.checkForRegressions(sample);
  }
  
  /**
   * Record network request
   */
  recordNetworkRequest(url, startTime, endTime, bytesTransferred = 0, compressed = false) {
    const latency = endTime - startTime;
    
    this.metrics.network.totalRequests++;
    this.metrics.network.totalBytes += bytesTransferred;
    this.metrics.network.averageLatency = 
      (this.metrics.network.averageLatency * (this.metrics.network.totalRequests - 1) + latency) / 
      this.metrics.network.totalRequests;
    
    if (compressed) {
      // Estimate compression ratio
      const estimatedUncompressed = bytesTransferred * 2.5; // Rough estimate
      this.metrics.network.compressionRatio = 
        ((estimatedUncompressed - bytesTransferred) / estimatedUncompressed) * 100;
    }
    
    // Track requests per minute
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requestTimes.set(now, true);
    
    // Clean old timestamps
    for (const [timestamp] of this.requestTimes) {
      if (timestamp < oneMinuteAgo) {
        this.requestTimes.delete(timestamp);
      }
    }
    
    this.metrics.network.requestsPerMinute = this.requestTimes.size;
    
    console.log(`📊 [PerformanceMonitor] Network: ${this.metrics.network.totalRequests} requests, ${Math.round(latency)}ms avg latency`);
  }
  
  /**
   * Record network failure
   */
  recordNetworkFailure(url, error) {
    this.metrics.network.failedRequests++;
    
    console.warn(`❌ [PerformanceMonitor] Network failure: ${url}`, error);
  }
  
  /**
   * Update memory metrics
   */
  updateMemoryMetrics() {
    if (performance.memory) {
      const memInfo = performance.memory;
      this.metrics.memory.heapUsed = memInfo.usedJSHeapSize;
      this.metrics.memory.heapTotal = memInfo.totalJSHeapSize;
      
      // Detect potential memory leaks
      if (this.samples.length > 10) {
        const recent = this.samples.slice(-10);
        const growth = recent[recent.length - 1].metrics.memory.heapUsed - recent[0].metrics.memory.heapUsed;
        const timeSpan = recent[recent.length - 1].runtime - recent[0].runtime;
        const growthRate = growth / timeSpan; // bytes per ms
        
        if (growthRate > 1000) { // More than 1KB/ms growth
          this.metrics.memory.memoryLeaks.push({
            timestamp: Date.now(),
            growthRate,
            heapSize: memInfo.usedJSHeapSize
          });
        }
      }
    }
  }
  
  /**
   * Record application metrics
   */
  recordApplicationMetric(type, value) {
    if (this.metrics.application.hasOwnProperty(type)) {
      this.metrics.application[type] = value;
    }
  }
  
  /**
   * Update optimization impact
   */
  updateOptimizationImpact(type, improvement) {
    this.metrics.optimization[type] = improvement;
  }
  
  /**
   * Check for performance regressions
   */
  checkForRegressions(sample) {
    if (!this.baseline || this.samples.length < 5) return;
    
    const alerts = [];
    
    // Check network performance
    if (sample.metrics.network.averageLatency > this.baseline.network.averageLatency * 1.5) {
      alerts.push({
        type: 'regression',
        metric: 'network_latency',
        message: `Network latency increased by ${Math.round(((sample.metrics.network.averageLatency / this.baseline.network.averageLatency) - 1) * 100)}%`,
        severity: 'warning'
      });
    }
    
    // Check memory usage
    if (sample.metrics.memory.heapUsed > this.baseline.memory.heapUsed * 2) {
      alerts.push({
        type: 'regression',
        metric: 'memory_usage',
        message: `Memory usage doubled since baseline`,
        severity: 'error'
      });
    }
    
    // Check request frequency
    if (sample.metrics.network.requestsPerMinute > this.baseline.network.requestsPerMinute * 1.3) {
      alerts.push({
        type: 'regression',
        metric: 'request_frequency',
        message: `Request frequency increased significantly`,
        severity: 'warning'
      });
    }
    
    if (alerts.length > 0) {
      this.alerts.push(...alerts);
      console.warn('⚠️ [PerformanceMonitor] Performance regressions detected:', alerts);
    }
  }
  
  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.recordApplicationMetric('backgroundTime', Date.now());
    } else {
      const backgroundTime = this.metrics.application.backgroundTime;
      if (backgroundTime) {
        const timeInBackground = Date.now() - backgroundTime;
        console.log(`🔄 [PerformanceMonitor] App was in background for ${Math.round(timeInBackground / 1000)}s`);
      }
    }
  }
  
  /**
   * Simulate load testing
   */
  async simulateLoad(concurrentUsers = 10, duration = 30000) {
    console.log(`🧪 [PerformanceMonitor] Starting load test: ${concurrentUsers} users for ${duration}ms`);
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.simulateUser(duration));
    }
    
    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    const loadTestResults = {
      duration: endTime - startTime,
      concurrentUsers,
      successful,
      failed,
      successRate: (successful / concurrentUsers) * 100,
      averageLatency: this.metrics.network.averageLatency,
      requestsPerSecond: (this.metrics.network.totalRequests / (duration / 1000)),
      memoryPeak: this.metrics.memory.heapUsed
    };
    
    console.log('📊 [PerformanceMonitor] Load test completed:', loadTestResults);
    
    return loadTestResults;
  }
  
  /**
   * Simulate single user behavior
   */
  async simulateUser(duration) {
    const endTime = Date.now() + duration;
    
    while (Date.now() < endTime) {
      // Simulate random user actions
      const actions = ['loadConversation', 'sendMessage', 'scrollPage', 'switchTab'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      switch (action) {
        case 'loadConversation':
          await this.simulateNetworkRequest('conversation', 200, 800);
          break;
        case 'sendMessage':
          await this.simulateNetworkRequest('message', 100, 500);
          break;
        case 'scrollPage':
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
          break;
        case 'switchTab':
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
          break;
      }
      
      // Random delay between actions
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 2000));
    }
  }
  
  /**
   * Simulate network request
   */
  async simulateNetworkRequest(type, minDuration, maxDuration) {
    const startTime = performance.now();
    const duration = minDuration + Math.random() * (maxDuration - minDuration);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    const endTime = performance.now();
    const bytesTransferred = 1000 + Math.random() * 5000; // Random bytes
    
    this.recordNetworkRequest(`simulate_${type}`, startTime, endTime, bytesTransferred, true);
  }
  
  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const runtime = performance.now() - this.startTime;
    
    const report = {
      summary: {
        runtime: Math.round(runtime),
        totalSamples: this.samples.length,
        alertsGenerated: this.alerts.length,
        monitoringPeriod: new Date(this.startTime).toISOString()
      },
      
      currentMetrics: this.metrics,
      
      trends: this.calculateTrends(),
      
      optimizationImpact: this.calculateOptimizationImpact(),
      
      recommendations: this.generateRecommendations(),
      
      alerts: this.alerts,
      
      samples: this.samples.slice(-10) // Last 10 samples
    };
    
    console.log('📋 [PerformanceMonitor] Performance Report Generated:', report);
    
    return report;
  }
  
  /**
   * Calculate performance trends
   */
  calculateTrends() {
    if (this.samples.length < 2) return {};
    
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    
    return {
      networkLatency: {
        start: first.metrics.network.averageLatency,
        end: last.metrics.network.averageLatency,
        change: last.metrics.network.averageLatency - first.metrics.network.averageLatency
      },
      memoryUsage: {
        start: first.metrics.memory.heapUsed,
        end: last.metrics.memory.heapUsed,
        change: last.metrics.memory.heapUsed - first.metrics.memory.heapUsed
      },
      requestFrequency: {
        start: first.metrics.network.requestsPerMinute,
        end: last.metrics.network.requestsPerMinute,
        change: last.metrics.network.requestsPerMinute - first.metrics.network.requestsPerMinute
      }
    };
  }
  
  /**
   * Calculate optimization impact
   */
  calculateOptimizationImpact() {
    if (!this.baseline) return {};
    
    const current = this.metrics;
    const baseline = this.baseline;
    
    return {
      requestReduction: baseline.network ? 
        Math.round(((baseline.network.requestsPerMinute - current.network.requestsPerMinute) / baseline.network.requestsPerMinute) * 100) : 0,
      latencyImprovement: baseline.network ? 
        Math.round(((baseline.network.averageLatency - current.network.averageLatency) / baseline.network.averageLatency) * 100) : 0,
      memoryReduction: baseline.memory ? 
        Math.round(((baseline.memory.heapUsed - current.memory.heapUsed) / baseline.memory.heapUsed) * 100) : 0,
      dataTransferReduction: current.network.compressionRatio || 0
    };
  }
  
  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Network recommendations
    if (this.metrics.network.averageLatency > 2000) {
      recommendations.push({
        category: 'network',
        priority: 'high',
        recommendation: 'Network latency is high. Consider enabling more aggressive caching or reducing payload sizes.'
      });
    }
    
    if (this.metrics.network.requestsPerMinute > 60) {
      recommendations.push({
        category: 'network',
        priority: 'medium',
        recommendation: 'High request frequency detected. Consider implementing request batching or increasing polling intervals.'
      });
    }
    
    // Memory recommendations
    if (this.metrics.memory.memoryLeaks.length > 0) {
      recommendations.push({
        category: 'memory',
        priority: 'high',
        recommendation: 'Potential memory leaks detected. Review component cleanup and cache management.'
      });
    }
    
    // User experience recommendations
    if (this.metrics.userExperience.largestContentfulPaint > 2500) {
      recommendations.push({
        category: 'ux',
        priority: 'medium',
        recommendation: 'Largest Contentful Paint is slow. Consider optimizing image loading and implementing progressive loading.'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Export performance data
   */
  exportData() {
    return {
      metrics: this.metrics,
      samples: this.samples,
      alerts: this.alerts,
      baseline: this.baseline,
      timestamp: new Date().toISOString()
    };
  }
}

// Global performance monitor instance
let globalPerformanceMonitor = null;

/**
 * Initialize global performance monitoring
 */
export function initializePerformanceMonitoring(baselineData = null) {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.stopMonitoring();
  }
  
  globalPerformanceMonitor = new PerformanceMetricsCollector();
  globalPerformanceMonitor.startMonitoring(baselineData);
  
  return globalPerformanceMonitor;
}

/**
 * Get global performance monitor
 */
export function getPerformanceMonitor() {
  return globalPerformanceMonitor;
}

/**
 * Record network request globally
 */
export function recordNetworkRequest(url, startTime, endTime, bytesTransferred, compressed) {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.recordNetworkRequest(url, startTime, endTime, bytesTransferred, compressed);
  }
}

/**
 * Record application metric globally
 */
export function recordApplicationMetric(type, value) {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.recordApplicationMetric(type, value);
  }
}

/**
 * Generate performance report
 */
export function generatePerformanceReport() {
  if (globalPerformanceMonitor) {
    return globalPerformanceMonitor.generateReport();
  }
  return null;
}

export default PerformanceMetricsCollector;
