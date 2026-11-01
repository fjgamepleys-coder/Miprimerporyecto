import { useState, useEffect } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useWallet, formatCOP } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { TopBar } from '@/components/TopBar';
import { RechargeModal } from '@/components/RechargeModal';
import { QuickActions } from '@/components/QuickActions';
import { FeaturedLocals } from '@/components/FeaturedLocals';
import { InstallBanner, InstallFab } from '@/components/InstallBanner';
import { BusinessOwnerPanel } from '@/components/BusinessOwnerPanel';
import { BusinessAuthModal, getStoredSession, clearStoredSession, type BusinessAuthSession } from '@/components/BusinessAuthModal';
import { Onboarding } from '@/components/Onboarding';
import { ExploreMap } from '@/components/ExploreMap';
import type { Municipio } from '@/data/appData';
import { MapPin, ShieldCheck } from 'lucide-react';

function App() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const wallet = useWallet();
  const auth = useAuth();
  const [municipio, setMunicipio] = useState<Municipio>('Sibundoy');
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [businessPanelOpen, setBusinessPanelOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [session, setSession] = useState<BusinessAuthSession | null>(null);

  // Check for persisted business auth on mount
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setSession(stored);
    }
  }, []);

  // Business owner / admin panel (shielded)
  if (businessPanelOpen && session) {
    return (
      <BusinessOwnerPanel
        session={session}
        onLogout={() => {
          clearStoredSession();
          setSession(null);
          setBusinessPanelOpen(false);
        }}
      />
    );
  }

  // Onboarding / auth gate — a business session takes priority over client auth
  if (session || !auth.isLoggedIn || (auth.isLoggedIn && !auth.isProfileComplete)) {
    return (
      <Onboarding
        onLogin={auth.login}
        onCompleteProfile={auth.completeProfile}
        loginMethod={auth.user?.loginMethod ?? null}
        businessSession={session}
        onBusinessAuthorized={() => {
          const s = getStoredSession();
          if (s) {
            setSession(s);
            setBusinessPanelOpen(true);
          }
        }}
        onBusinessLogout={() => {
          setSession(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-app min-h-screen flex flex-col relative">
        <TopBar
          municipio={municipio}
          onMunicipioChange={setMunicipio}
          formattedBalance={formatCOP(wallet.balance)}
          onRecharge={() => setRechargeOpen(true)}
          onLogout={() => {
            auth.logout();
            setMunicipio('Sibundoy');
          }}
        />

        {/* Install banner */}
        <InstallBanner
          canInstall={canInstall}
          isInstalled={isInstalled}
          onInstall={promptInstall}
        />

        {/* Scrollable content */}
        <main className="flex-1 px-0 py-3 pb-8 space-y-6 overflow-y-auto no-scrollbar">
          {/* Hero greeting */}
          <section className="px-4">
            <div className="card-surface rounded-2xl p-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/15">
                <MapPin size={22} className="text-emerald" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">¡Hola! Bienvenido a Moss</p>
                <p className="text-xs text-white/50 mt-0.5">Domicilios rápidos en el Valle de Sibundoy</p>
              </div>
            </div>
          </section>

          <QuickActions municipio={municipio} />

          <FeaturedLocals />

          <ExploreMap />

          {/* Footer info */}
          <footer className="px-4 pt-2 text-center space-y-2">
            <p className="text-xs text-white/30">Moss - Domicilios en Sibundoy, Putumayo</p>
            <p className="text-xs text-white/20">Saldo de prueba - sin pagos reales</p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-white/20 hover:text-gold-light/60 transition-colors mt-2"
            >
              <ShieldCheck size={11} />
              Portal de Comercios Aliados
            </button>
          </footer>
        </main>

        <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} wallet={wallet} />
        <InstallFab canInstall={canInstall} isInstalled={isInstalled} onInstall={promptInstall} />

        <BusinessAuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthorized={(s) => {
            setAuthModalOpen(false);
            setSession(s);
            setBusinessPanelOpen(true);
          }}
        />
      </div>
    </div>
  );
}

export default App;
