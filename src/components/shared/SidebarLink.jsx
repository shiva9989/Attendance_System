// import React from 'react';

// const SidebarLink = ({ isActive, icon: Icon, onClick, children }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//         isActive 
//           ? 'bg-blue-100 text-blue-700' 
//           : 'text-gray-600 hover:bg-gray-100'
//       }`}
//     >
//       <Icon size={20} />
//       <span className="font-medium">{children}</span>
//     </button>
//   );
// };

// export default SidebarLink;
import React from 'react';

const SidebarLink = ({ isActive, icon: Icon, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{children}</span>
    </button>
  );
};

export default SidebarLink;
