
import React, { useState, useEffect } from 'react';
import { Role, View, Language, SchoolData, GradeGroup, User } from './types';
import { TRANSLATIONS } from './constants';
import Chatbot from './components/Chatbot';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AboutUs from './components/AboutUs';
import HelpCenter from './components/HelpCenter';
import SchoolOnboardingModal from './components/SchoolOnboardingModal';
import LoginModal from './components/LoginModal';
import { Wifi, Coins } from 'lucide-react';
import { offlineStorage } from './services/offlineStorage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LegalPage, PrivacyPolicy, TermsOfService } from './components/Legal';
import { authService } from './services/authService';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentOnboarding } from './components/StudentOnboarding';
import { MaintenancePage } from './components/MaintenancePage';
import { adminService } from './services/adminMockService';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(Role.GUEST);
  const [view, setView] = useState<View>(View.LANDING);
  const [language, setLanguage] = useState<Language>('en');
  const [studentGrade, setStudentGrade] = useState<GradeGroup>('9-12');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showGradeSelection, setShowGradeSelection] = useState(false);
  const [coinToast, setCoinToast] = useState<{ amount: number, reason: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [onboardingFormOpen, setOnboardingFormOpen] = useState(false);
  const [currentLegalPage, setCurrentLegalPage] = useState<'privacy' | 'terms' | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem('kalvi_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
    
    const init = async () => {
        // 1. Initial user check
        const user = await authService.getCurrentUser();
        if (user) handleLoginSuccess(user);
        
        // 2. Auth State Listener (Critical for Google Redirects)
        if (supabase) {
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const u: User = {
                id: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: (session.user.user_metadata?.role as Role) || Role.STUDENT,
                avatarUrl: session.user.user_metadata?.avatar_url
              };
              handleLoginSuccess(u);
            } else if (event === 'SIGNED_OUT') {
              setCurrentUser(null);
              setRole(Role.GUEST);
              setView(View.LANDING);
            }
          });
        }
        
        checkMaintenance();
    };
    init();
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkMaintenance = async () => {
      try {
          const settings = await adminService.getSystemSettings();
          setMaintenanceMode(settings.maintenanceMode);
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
     if (currentUser) {
       const canAccess = authService.canAccessView(currentUser.role, view);
       if (!canAccess) {
         setView(currentUser.role === Role.SUPER_ADMIN ? View.ADMIN_DASHBOARD : View.STUDENT_DASHBOARD);
       }
     } else if (![View.LANDING, View.ABOUT, View.HELP].includes(view)) {
        setView(View.LANDING);
     }
  }, [view, currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setRole(user.role);
    setLoginModalOpen(false);
    
    if (user.role === Role.SUPER_ADMIN) {
        setView(View.ADMIN_DASHBOARD);
    } else {
        const savedGrade = localStorage.getItem(`kalvi_grade_${user.id}`);
        if (savedGrade) {
            setStudentGrade(savedGrade as GradeGroup);
            setShowGradeSelection(false);
        } else {
            if (user.role === Role.STUDENT) setShowGradeSelection(true);
        }
        setView(View.STUDENT_DASHBOARD);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setRole(Role.GUEST);
    setView(View.LANDING);
    setShowGradeSelection(false);
  };

  if (maintenanceMode && currentUser && currentUser.role !== Role.SUPER_ADMIN) {
      return <MaintenancePage onLogout={handleLogout} onRefresh={() => window.location.reload()} />;
  }

  if (currentUser?.role === Role.STUDENT && showGradeSelection) {
      return <StudentOnboarding language={language} onSelect={(g) => { 
          setStudentGrade(g); 
          setShowGradeSelection(false);
          localStorage.setItem(`kalvi_grade_${currentUser.id}`, g);
      }} />;
  }

  return (
    <ErrorBoundary>
        <div className={theme}>
            <div className="min-h-screen font-sans bg-gray-50 text-gray-900 dark:bg-[#0B0F19] dark:text-gray-100 transition-colors duration-300">
            <Navbar 
                currentUser={currentUser} language={language} setLanguage={setLanguage}
                view={view} setView={setView} t={t}
                handleLoginClick={() => setLoginModalOpen(true)}
                handleLogout={handleLogout}
                setOnboardingFormOpen={setOnboardingFormOpen}
                setCurrentLegalPage={setCurrentLegalPage}
                theme={theme} toggleTheme={() => {
                  const next = theme === 'light' ? 'dark' : 'light';
                  setTheme(next);
                  localStorage.setItem('kalvi_theme', next);
                }}
            />

            {currentLegalPage === 'privacy' && <LegalPage title={t.privacyPolicy} content={<PrivacyPolicy language={language} />} onClose={() => setCurrentLegalPage(null)} />}
            {currentLegalPage === 'terms' && <LegalPage title={t.termsOfService} content={<TermsOfService language={language} />} onClose={() => setCurrentLegalPage(null)} />}
            
            {!currentLegalPage && (
                <>
                    {view === View.LANDING && <LandingPage language={language} t={t} handleLoginClick={() => setLoginModalOpen(true)} setOnboardingFormOpen={setOnboardingFormOpen} openLegal={setCurrentLegalPage as any} setView={setView} />}
                    {view === View.ABOUT && <AboutUs language={language} setView={setView} openLegal={setCurrentLegalPage as any} handleLoginClick={() => setLoginModalOpen(true)} setOnboardingFormOpen={setOnboardingFormOpen} />}
                    {view === View.HELP && <HelpCenter language={language} setView={setView} openLegal={setCurrentLegalPage as any} handleLoginClick={() => setLoginModalOpen(true)} setOnboardingFormOpen={setOnboardingFormOpen} />}
                    {view === View.STUDENT_DASHBOARD && <StudentDashboard language={language} onLogout={handleLogout} studentGrade={studentGrade} setStudentGrade={setStudentGrade} currentUser={currentUser} />}
                    {view === View.ADMIN_DASHBOARD && <AdminDashboard language={language} schools={schools} onApproveSchool={(id) => {}} onLogout={handleLogout} />}
                </>
            )}

            {!currentUser && !maintenanceMode && <Chatbot appLanguage={language} />}
            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLogin={handleLoginSuccess} language={language} />
            {onboardingFormOpen && <SchoolOnboardingModal language={language} onClose={() => setOnboardingFormOpen(false)} onSubmit={() => setOnboardingFormOpen(false)} />}
            </div>
        </div>
    </ErrorBoundary>
  );
};

export default App;
