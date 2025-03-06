/**
 * Client IP Proxy API
 * 
 * This module provides a server-side API endpoint that can be used to fetch
 * the client's IP address without running into Content Security Policy issues
 * that may occur when calling external APIs directly from the client.
 * 
 * The API endpoint is designed to be called from the client-side application
 * and will proxy the request to ipify.org or similar services, then return
 * the result to the client.
 */

// Default IP address to use when the actual IP cannot be determined
const DEFAULT_IP = '0.0.0.0';

/**
 * Fetches the client's IP address through the server-side API
 * @returns Promise resolving to an object containing the IP address
 */
export const getClientIpThroughProxy = async (): Promise<{ ip: string }> => {
  try {
    // First try our own API endpoint
    const response = await fetch('/api/get-client-ip');
    
    if (response.ok) {
      const data = await response.json();
      return { ip: data.ip || DEFAULT_IP };
    }
    
    throw new Error(`Failed to fetch IP: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.warn('Error fetching IP through proxy:', error);
    return { ip: DEFAULT_IP };
  }
};

/**
 * This is a mock implementation that can be used during development
 * when the actual API endpoint is not available.
 * 
 * In a real application, this would be implemented as a server-side
 * API endpoint that handles the actual IP fetching.
 */
export const mockGetClientIp = async (): Promise<{ ip: string }> => {
  try {
    // In a real deployment, this would be implemented as a server endpoint
    // that directly reads the IP from the request headers
    
    // For development, we'll use a random IP to simulate the real behavior
    const octets = Array(4).fill(0).map(() => Math.floor(Math.random() * 256));
    const mockIp = octets.join('.');
    
    return { ip: mockIp };
  } catch (error) {
    console.warn('Error in mock IP function:', error);
    return { ip: DEFAULT_IP };
  }
}; 