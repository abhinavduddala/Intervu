import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-white font-sans text-center">
      <h1 className="text-5xl font-mono text-[#7c3aed] mb-4">404</h1>
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-zinc-400 mb-6">The requested path does not exist on Intervu.</p>
      <Link to="/" className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] rounded text-sm font-semibold transition-all">
        Return Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
