import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
