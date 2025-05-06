
import React from 'react';
import Navbar from '@/components/Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Navbar />
      <div className="pt-24 px-4">
        <div className="container mx-auto">
          {title && <h1 className="text-3xl font-bold mb-8">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
