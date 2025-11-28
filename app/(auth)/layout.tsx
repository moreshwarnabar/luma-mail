import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-screen flex gap-2 items-stretch">{children}</div>;
};

export default Layout;
