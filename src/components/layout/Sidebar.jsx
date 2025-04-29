import React from 'react';
import { LogOut } from 'lucide-react';

export const Sidebar = ({ 
  isAdmin, 
  menuItems, 
  onNavigate, 
  isMobile, 
  isOpen, 
  onToggle 
}) => {
  // Handle logout function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          ${isMobile ? 'w-64' : 'w-64'}
        `}
      >
        {/* Logo/Header Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.path)}
                    className={`
                      w-full px-4 py-2 rounded-lg flex items-center space-x-3
                      transition-colors duration-200
                      hover:bg-gray-100 hover:text-blue-600
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded-lg flex items-center space-x-3 
                text-red-600 hover:bg-red-50 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut size={24} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 p-2 rounded-lg bg-white shadow-lg z-50
            hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;



// import React from 'react';
// import { UserCircle, Calendar, Database, Image, Camera, Users, Menu, X, FileText } from 'lucide-react';
// import SidebarLink from '../shared/SidebarLink';

// export const Sidebar = ({ isAdmin, currentPage, onNavigate, isMobile, isOpen, onToggle }) => {
//   const sidebarClasses = `
//     fixed top-0 left-0 h-full bg-white border-r shadow-sm z-50
//     transition-transform duration-300 ease-in-out
//     ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
//     ${isMobile ? 'w-64' : 'w-64'}
//   `;

//   return (
//     <>
//       {isMobile && isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={onToggle}
//         />
//       )}

//       {isMobile && (
//         <button 
//           onClick={onToggle}
//           className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100"
//         >
//           {isOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       )}

//       <div className={sidebarClasses}>
//         <div className="p-4">
//           <div className="flex items-center gap-3 mb-8">
//             <UserCircle className="h-8 w-8 text-blue-600" />
//             <span className="text-xl font-semibold text-gray-900">
//               Attendance
//             </span>
//           </div>

//           <div className="space-y-2">
//             {isAdmin ? (
//               <>
//                 <SidebarLink 
//                   icon={Calendar}
//                   isActive={currentPage === 'attendance'}
//                   onClick={() => onNavigate('attendance')}
//                 >
//                   Attendance
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Users}
//                   isActive={currentPage === 'student'}
//                   onClick={() => onNavigate('student')}
//                 >
//                   Students
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Database}
//                   isActive={currentPage === 'connection'}
//                   onClick={() => onNavigate('connection')}
//                 >
//                   Database
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Image}
//                   isActive={currentPage === 'image'}
//                   onClick={() => onNavigate('image')}
//                 >
//                   Images
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Camera}
//                   isActive={currentPage === 'webcam'}
//                   onClick={() => onNavigate('webcam')}
//                 >
//                   Webcam
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={FileText}
//                   isActive={currentPage === 'duty-approval'}
//                   onClick={() => onNavigate('duty-approval')}
//                 >
//                   Duty Approval
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={FileText}
//                   isActive={currentPage === 'duty-status'}
//                   onClick={() => onNavigate('duty-status')}
//                 >
//                   Duty Status
//                 </SidebarLink>
//               </>
//             ) : (
//               <>
//                 <SidebarLink 
//                   icon={Calendar}
//                   isActive={currentPage === 'attendance'}
//                   onClick={() => onNavigate('attendance')}
//                 >
//                   Attendance
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Camera}
//                   isActive={currentPage === 'webcam'}
//                   onClick={() => onNavigate('webcam')}
//                 >
//                   Webcam
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={FileText}
//                   isActive={currentPage === 'duty'}
//                   onClick={() => onNavigate('duty')}
//                 >
//                   Duty Form
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={FileText}
//                   isActive={currentPage === 'duty-status'}
//                   onClick={() => onNavigate('duty-status')}
//                 >
//                   Duty Status
//                 </SidebarLink>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// import React from 'react';
// import { 
//   UserCircle, 
//   Calendar, 
//   Database, 
//   Image, 
//   Camera, 
//   Users,
//   Menu,
//   X
// } from 'lucide-react';
// import SidebarLink from '../shared/SidebarLink';

// const Sidebar = ({ isAdmin, currentPage, onNavigate, isMobile, isOpen, onToggle }) => {
//   const sidebarClasses = `
//     fixed top-0 left-0 h-full bg-white border-r shadow-sm z-50
//     transition-transform duration-300 ease-in-out
//     ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
//     ${isMobile ? 'w-64' : 'w-64'}
//   `;

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobile && isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={onToggle}
//         />
//       )}

//       {/* Mobile Toggle Button */}
//       {isMobile && (
//         <button 
//           onClick={onToggle}
//           className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100"
//         >
//           {isOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       )}

//       {/* Sidebar */}
//       <div className={sidebarClasses}>
//         <div className="p-4">
//           <div className="flex items-center gap-3 mb-8">
//             <UserCircle className="h-8 w-8 text-blue-600" />
//             <span className="text-xl font-semibold text-gray-900">
//               Attendance
//             </span>
//           </div>

//           <div className="space-y-2">
//             {isAdmin ? (
//               <>
//                 <SidebarLink 
//                   icon={Calendar}
//                   isActive={currentPage === 'attendance'}
//                   onClick={() => onNavigate('attendance')}
//                 >
//                   Attendance
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Users}
//                   isActive={currentPage === 'student'}
//                   onClick={() => onNavigate('student')}
//                 >
//                   Students
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Database}
//                   isActive={currentPage === 'connection'}
//                   onClick={() => onNavigate('connection')}
//                 >
//                   Database
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Image}
//                   isActive={currentPage === 'image'}
//                   onClick={() => onNavigate('image')}
//                 >
//                   Images
//                 </SidebarLink>
//                 <SidebarLink 
//                   icon={Camera}
//                   isActive={currentPage === 'webcam'}
//                   onClick={() => onNavigate('webcam')}
//                 >
//                   Webcam
//                 </SidebarLink>
//               </>
//             ) : (
//               <SidebarLink 
//                 icon={Camera}
//                 isActive={currentPage === 'webcam'}
//                 onClick={() => onNavigate('webcam')}
//               >
//                 Webcam
//               </SidebarLink>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;
// import React from 'react';
// import { UserCircle, Calendar, Database, Image, Camera, Users, Menu, X } from 'lucide-react';

// export const Sidebar = ({ isAdmin, menuItems, currentPage, onNavigate, isMobile, isOpen, onToggle }) => {
//   return (
//     <div className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
//       <button onClick={onToggle} className="p-2">
//         {isOpen ? <X size={24} /> : <Menu size={24} />}
//       </button>
//       <ul className="mt-4">
//         {menuItems.map((item) => (
//           <li 
//             key={item.id} 
//             className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-200 ${currentPage === item.page ? 'bg-gray-300' : ''}`}
//             onClick={() => onNavigate(item.page)}
//           >
//             {item.icon}
//             {isOpen && <span>{item.label}</span>}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;



