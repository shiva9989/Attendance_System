import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar, PageContainer } from './components/layout';
import AttendancePage from './pages/AttendancePage';
import StudentPage from './pages/StudentName';
import ConnectionPage from './pages/Connection';
import ImagePage from './pages/ImageFromDatabase';
import WebcamPage from './pages/WebcamComponent';
import DutyForm from './pages/DutyForm';
import DutyApproval from './pages/DutyApproval';
import DutyStatus from './pages/DutyStatus';
import { authService } from './Services/authServices';
import { UserCircle, Calendar, Database, Image, Camera, Users, FileText, CheckSquare, Clock } from 'lucide-react';
import './styles/custom.css';

const App = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const adminItems = [
      { id: 1, label: 'Attendance', path: '/attendance', icon: <Calendar size={24} /> },
      { id: 2, label: 'Students', path: '/students', icon: <Users size={24} /> },
      { id: 3, label: 'Connection', path: '/connection', icon: <Database size={24} /> },
      { id: 4, label: 'Images', path: '/images', icon: <Image size={24} /> },
      { id: 5, label: 'Approve Duties', path: '/duty-approval', icon: <CheckSquare size={24} /> },
      { id: 6, label: 'Duty Status', path: '/duty-status', icon: <Clock size={24} /> }
    ];

    const userItems = [
      { id: 1, label: 'Attendance', path: '/attendance', icon: <Calendar size={24} /> },
      { id: 2, label: 'Webcam', path: '/webcam', icon: <Camera size={24} /> },
      { id: 3, label: 'Duty Form', path: '/duty', icon: <FileText size={24} /> },
      { id: 4, label: 'Duty Status', path: '/duty-status', icon: <Clock size={24} /> }
    ];

    setIsAdmin(user?.role === 'admin');
    setMenuItems(user?.role === 'admin' ? adminItems : userItems);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isAdmin={isAdmin} 
        menuItems={menuItems}
        onNavigate={handleNavigate}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        
        onLogout={handleLogout} 
      />
      <PageContainer isSidebarOpen={isSidebarOpen} isMobile={isMobile}>
        <div className="page-transition">
          <Routes>
            <Route path="/" element={<AttendancePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            {isAdmin && (
              <>
                <Route path="/students" element={<StudentPage />} />
                <Route path="/connection" element={<ConnectionPage />} />
                <Route path="/images" element={<ImagePage />} />
              </>
            )}
            <Route path="/webcam" element={<WebcamPage />} />
            <Route path="/duty" element={<DutyForm />} />
            {isAdmin && (
              <Route path="/duty-approval" element={<DutyApproval />} />
            )}
            <Route path="/duty-status" element={<DutyStatus />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </PageContainer>
    </div>
  );
};

export default App;