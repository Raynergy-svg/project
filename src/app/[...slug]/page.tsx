import { notFound } from 'next/navigation';

// This is a catch-all route handler that will attempt to return the content
// for a path if it exists, or fall back to a 404 page if it doesn't.
export default function CatchAllRoute() {
  // For all catch-all routes, redirect to the not-found page
  notFound();
}
