import React, { Suspense, lazy, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';

const WelcomeHero = lazy(() => import('./pages/WelcomeHero'));
const AIHub = lazy(() => import('./components/ai/AIHub'));
const LiveJobFeed = lazy(() => import('./components/internships/LiveJobFeed'));
const HackathonsPortal = lazy(() => import('./pages/HackathonsPortal'));
const CodingPlatform = lazy(() => import('./components/coding/CodingPlatform'));
const BlogView = lazy(() => import('./pages/BlogView'));
const UserDashboard = lazy(() => import('./components/dashboard/UserDashboard'));
const PricingPage = lazy(() => import('./components/pricing/PricingPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const PageLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <WelcomeHero onGetStarted={() => setActiveTab('assistant')} onShowAI={() => setActiveTab('assistant')} />;
      case 'assistant': return <AIHub />;
      case 'internships': return <LiveJobFeed />;
      case 'hackathons': return <HackathonsPortal />;
      case 'coding': return <CodingPlatform />;
      case 'blog': return <BlogView />;
      case 'dashboard': return <UserDashboard />;
      case 'pricing': return <PricingPage />;
      case 'admin': return <AdminPanel />;
      default: return <WelcomeHero onGetStarted={() => setActiveTab('assistant')} onShowAI={() => setActiveTab('assistant')} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 md:pb-8">
          <Suspense fallback={<PageLoader />}>
            {renderTab()}
          </Suspense>
        </main>
      </div>
    </AuthProvider>
  );
}
