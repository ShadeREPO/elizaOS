/**
 * Authenticated API Utility
 * 
 * Provides a centralized way to make authenticated API calls to ElizaOS
 * with proper headers, API key authentication, and error handling.
 */

import { getConfig } from './config.js';

/**
 * Create headers for authenticated API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object with authentication and defaults
 */
export function createAuthHeaders(additionalHeaders = {}) {
  const config = getConfig();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'application/json',
    ...additionalHeaders
  };
  
  // Add API key for production authentication
  if (config.API_KEY) {
    headers['X-API-Key'] = config.API_KEY;
  }
  
  return headers;
}

/**
 * Make an authenticated GET request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export async function authenticatedGet(url, options = {}) {
  const headers = createAuthHeaders(options.headers);
  
  return fetch(url, {
    method: 'GET',
    headers,
    ...options
  });
}

/**
 * Make an authenticated POST request
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export async function authenticatedPost(url, data, options = {}) {
  const headers = createAuthHeaders(options.headers);
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Make an authenticated request with custom method
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The request body data (optional)
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export async function authenticatedRequest(method, url, data = null, options = {}) {
  const headers = createAuthHeaders(options.headers);
  
  const requestOptions = {
    method,
    headers,
    ...options
  };
  
  if (data && (method !== 'GET' && method !== 'HEAD')) {
    requestOptions.body = JSON.stringify(data);
  }
  
  return fetch(url, requestOptions);
}

/**
 * Helper to build API URLs with the correct base URL
 * @param {string} endpoint - The API endpoint path (e.g., '/api/agents')
 * @returns {string} Complete API URL
 */
export function buildApiUrl(endpoint) {
  const config = getConfig();
  const baseUrl = config.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Enhanced error handling for API responses
 * @param {Response} response - The fetch response
 * @param {string} context - Context for error logging
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} Enhanced error with context
 */
export async function handleApiResponse(response, context = 'API call') {
  if (!response.ok) {
    let errorMessage = `${context} failed: ${response.status} ${response.statusText}`;
    
    // Add specific error details for common status codes
    switch (response.status) {
      case 401:
        errorMessage += ' - Authentication required. Check your API key.';
        break;
      case 403:
        errorMessage += ' - Access forbidden. Verify API key and permissions.';
        break;
      case 429:
        errorMessage += ' - Rate limit exceeded. Please wait before retrying.';
        break;
      case 500:
        errorMessage += ' - Server error. Please try again later.';
        break;
    }
    
    // Try to get error details from response body
    try {
      const errorData = await response.json();
      if (errorData.error || errorData.message) {
        errorMessage += ` Details: ${errorData.error || errorData.message}`;
      }
    } catch (e) {
      // Response body is not JSON, ignore
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}
