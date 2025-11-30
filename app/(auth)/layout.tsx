import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex items-stretch bg-linear-to-br from-orange-500 to-orange-300">
      {children}
    </div>
  );
};

export default Layout;
