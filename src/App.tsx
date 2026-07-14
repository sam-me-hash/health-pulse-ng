import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { FacilityTrackerPage } from './pages/FacilityTrackerPage';
import { Header } from './components/Header';
import { getTranslation, Language } from './lib/i18n';
import { useHealthFacilities } from './hooks/useHealthFacilities';
import { LoginModal } from './components/LoginModal';

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [userRole, setUserRole] = useState<'Super Admin' | 'Facility Admin' | null>(null);
  const [managedFacilityId, setManagedFacilityId] = useState<string | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  
  const { facilities } = useHealthFacilities();
  const t = getTranslation(language);

  const handleLogin = (role: 'Super Admin' | 'Facility Admin', facilityId?: string) => {
    setUserRole(role);
    if (facilityId) {
      setManagedFacilityId(facilityId);
    }
    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    setManagedFacilityId(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header 
          language={language} 
          setLanguage={setLanguage} 
          userRole={userRole} 
          handleLogout={handleLogout} 
          setLoginModalOpen={setLoginModalOpen} 
          t={t}        
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/facilities" 
              element={
                <FacilityTrackerPage 
                  language={language} 
                  userRole={userRole}
                  managedFacilityId={managedFacilityId}
                  setLoginModalOpen={setLoginModalOpen}
                />
              } 
            />
          </Routes>
        </main>
        <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setLoginModalOpen(false)} 
            facilities={facilities} 
            language={language} 
            onLogin={handleLogin}
        />
      </div>
    </Router>
  );
}

export default App;
