// import React from 'react';

// export const PageContainer = ({ children, isSidebarOpen, isMobile }) => (
//   <div 
//     className={`min-h-screen bg-gray-50 ${
//       isMobile ? 'ml-0' : 'ml-64'
//     } transition-margin duration-300 ease-in-out`}
//   >
//     <main className="max-w-7xl mx-auto px-4 py-8">
//       {children}
//     </main>
//   </div>
// );
import React from 'react';

export const PageContainer = ({ children, isSidebarOpen, isMobile }) => (
  <div 
    className={`min-h-screen bg-gray-50 ${
      isMobile ? 'ml-0' : 'ml-64'
    } transition-margin duration-300 ease-in-out`}
  >
    <main className="max-w-7xl mx-auto px-4 py-8">
      {children}
    </main>
  </div>
);


