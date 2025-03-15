/**
 * CSP Report Endpoint
 * This endpoint receives Content Security Policy violation reports
 * and logs them for analysis.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Log CSP violation report
    console.warn('CSP Violation:', req.body);

    // Add more sophisticated logging here if needed
    // (e.g., to a monitoring service)

    return res.status(204).end();
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Configure CORS for this endpoint
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100kb',
    },
    externalResolver: false,
  },
}; 