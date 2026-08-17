import React, { useState, useEffect } from 'react';
import { useBookingWizard } from './hooks/useBookingWizard';
import { useTenantTheme } from './hooks/useTenantTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopNav } from './components/ui/TopNav';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { TenantHeader } from './components/ui/TenantHeader';
import { StepProgress } from './components/ui/StepProgress';
import { SidebarSummary } from './components/ui/SidebarSummary';
import { TenantSwitcherModal } from './components/ui/TenantSwitcherModal';
import { RestrictedAccessView } from './components/ui/RestrictedAccessView';
import { ProductLandingPage } from './features/landing/ProductLandingPage';
import { Step1Services } from './features/booking/Step1Services';
import { Step2Staff } from './features/booking/Step2Staff';
import { Step3DateTime } from './features/booking/Step3DateTime';
import { Step4CustomerForm } from './features/booking/Step4CustomerForm';
import { Step5Success } from './features/booking/Step5Success';
import { CustomerPortal } from './features/customer/CustomerPortal';
import { StaffPortal } from './features/staff/StaffPortal';
import { AdminPortal } from './features/admin/AdminPortal';
import { SuperAdminPortal } from './features/super-admin/SuperAdminPortal';
import { LoginModal } from './features/auth/LoginModal';
import { GlobalFooter } from './components/ui/GlobalFooter';
import { MOCK_TENANTS } from './services/mockData';
import { PortalView } from './types';
import { Shield, ArrowLeft } from 'lucide-react';
import { isDedicatedSubdomain } from './services/domainHelper';

const AppContent: React.FC = () => {
  // 1. Initial Theme Mode
  const getInitialTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  };

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(getInitialTheme);
  const { user, isAuthenticated, isLoginModalOpen, openLoginModal, closeLoginModal, targetRoleForLogin } = useAuth();
  const isDedicated = isDedicatedSubdomain();

  // Listen to OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeMode(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Initial Portal View: Landing page default for root, direct booking for subdomains/slugs
  const getInitialView = (): PortalView | 'landing' => {
    if (typeof window === 'undefined') return 'landing';

    // Se for subdomínio dedicado de um parceiro (ex: campelo.adminic.com.br ou segredosdocorte.adminic.com.br)
    if (isDedicated) {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as PortalView;
      if (viewParam && ['booking', 'customer', 'staff', 'admin'].includes(viewParam)) {
        return viewParam;
      }
      return 'booking';
    }

    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as PortalView | 'landing';
    if (viewParam && ['landing', 'booking', 'customer', 'staff', 'admin', 'super-admin'].includes(viewParam)) {
      return viewParam;
    }

    const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    if (path.includes('meus-agendamentos') || path.includes('cliente')) return 'customer';
    if (path.includes('colaborador') || path.includes('staff')) return 'staff';
    if (path.includes('gestao') || (path.includes('admin') && !path.includes('super-admin'))) return 'admin';
    if (path.includes('super-admin')) return 'super-admin';

    // Se houver um slug de parceiro na URL (ex: /barbearia-campelo)
    if (path && !['meus-agendamentos', 'cliente', 'colaborador', 'staff', 'gestao', 'admin', 'super-admin'].includes(path)) {
      return 'booking';
    }

    // Se houver query param explícito de parceiro
    if (params.get('slug') || params.get('tenant')) {
      return 'booking';
    }

    // Padrão: Landing Page Institucional / Comercial da IA Adminic
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<PortalView | 'landing'>(getInitialView);

  const wizard = useBookingWizard();
  useTenantTheme(wizard.tenant, themeMode);

  // Dynamic Title per subdomain
  useEffect(() => {
    if (isDedicated && wizard.tenant) {
      document.title = `${wizard.tenant.name} | Agendamento Online`;
    } else {
      document.title = 'IA Adminic | Plataforma de Agendamento Inteligente';
    }
  }, [isDedicated, wizard.tenant]);

  const handleSelectView = (view: PortalView | 'landing') => {
    if (isDedicated && view === 'landing') {
      setCurrentView('booking');
      return;
    }
    setCurrentView(view);
    const url = new URL(window.location.href);
    if (view === 'landing') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', view);
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleImpersonate = (targetSlug: string) => {
    wizard.handleSwitchTenant(targetSlug);
    handleSelectView('booking');
  };

  // Render Loading Spinner
  if (wizard.isLoading && currentView === 'booking') {
    return <LoadingSpinner slug={wizard.slug} />;
  }

  // Error / Not Found State for Partner Page
  if (wizard.error && !wizard.tenant && currentView === 'booking') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08080a] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md glass-panel rounded-3xl p-8 border border-rose-500/30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Estabelecimento Não Encontrado</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Não foi possível carregar os dados do parceiro solicitado.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => wizard.handleSwitchTenant(wizard.slug || 'barbearia-campelo')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 text-black hover:opacity-90 transition-opacity cursor-pointer"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => handleSelectView('landing')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Voltar para a Página Inicial
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tenant = wizard.tenant || (wizard.allTenants.length > 0 ? wizard.allTenants[0] : MOCK_TENANTS[0]);

  return (
    <div className="min-h-screen relative selection:bg-brand-primary/30 selection:text-brand-primary pb-20">
      {/* Background Ambient Glows */}
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />

      {/* Global Top Navbar with RBAC Switcher */}
      <TopNav
        currentView={currentView}
        onSelectView={handleSelectView}
        tenant={tenant}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        onOpenSwitcher={() => wizard.setIsSwitcherOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {/* VIEW 0: INSTITUTIONAL & COMMERCIAL PRODUCT LANDING PAGE */}
        {currentView === 'landing' && (
          <ProductLandingPage
            tenants={wizard.allTenants.length > 0 ? wizard.allTenants : MOCK_TENANTS}
            onSelectTenant={(selectedSlug) => {
              wizard.handleSwitchTenant(selectedSlug);
              handleSelectView('booking');
            }}
            onOpenLogin={() => openLoginModal()}
          />
        )}

        {/* VIEW 1: PUBLIC BOOKING FLOW (No login required for customers) */}
        {currentView === 'booking' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Dynamic Tenant Profile Header */}
            <TenantHeader
              tenant={tenant}
              onOpenSwitcher={() => wizard.setIsSwitcherOpen(true)}
            />

            {/* Stepper Progress Bar */}
            {wizard.currentStep < 5 && (
              <StepProgress
                currentStep={wizard.currentStep}
                onStepClick={wizard.handleStepClick}
                maxStepReached={wizard.maxStepReached}
              />
            )}

            {/* Wizard Main Grid */}
            {wizard.currentStep < 5 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                  {wizard.currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => wizard.handleStepClick((wizard.currentStep - 1) as any)}
                      className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para etapa anterior</span>
                    </button>
                  )}

                  {wizard.currentStep === 1 && (
                    <Step1Services
                      categories={wizard.catalog?.categories || []}
                      services={wizard.catalog?.services || []}
                      selectedService={wizard.selectedService}
                      onSelectService={wizard.handleSelectService}
                    />
                  )}

                  {wizard.currentStep === 2 && (
                    <Step2Staff
                      staffList={wizard.staffList}
                      selectedStaff={wizard.selectedStaff}
                      isAnyStaff={wizard.isAnyStaff}
                      onSelectStaff={wizard.handleSelectStaff}
                      selectedService={wizard.selectedService}
                    />
                  )}

                  {wizard.currentStep === 3 && (
                    <Step3DateTime
                      selectedDate={wizard.selectedDate}
                      onSelectDate={wizard.handleSelectDate}
                      availability={wizard.availability}
                      selectedSlot={wizard.selectedSlot}
                      onSelectSlot={wizard.handleSelectSlot}
                      isLoadingAvailability={wizard.isLoadingAvailability}
                    />
                  )}

                  {wizard.currentStep === 4 && (
                    <Step4CustomerForm
                      customerName={wizard.customerName}
                      setCustomerName={wizard.setCustomerName}
                      customerPhone={wizard.customerPhone}
                      setCustomerPhone={wizard.setCustomerPhone}
                      customerEmail={wizard.customerEmail}
                      setCustomerEmail={wizard.setCustomerEmail}
                      notes={wizard.notes}
                      setNotes={wizard.setNotes}
                      paymentMethod={wizard.paymentMethod}
                      setPaymentMethod={wizard.setPaymentMethod}
                      agreeTerms={wizard.agreeTerms}
                      setAgreeTerms={wizard.setAgreeTerms}
                      error={wizard.error}
                    />
                  )}
                </div>

                {/* Right Sticky Sidebar */}
                <div className="lg:col-span-4">
                  <SidebarSummary
                    currentStep={wizard.currentStep}
                    selectedService={wizard.selectedService}
                    selectedStaff={wizard.selectedStaff}
                    isAnyStaff={wizard.isAnyStaff}
                    selectedDate={wizard.selectedDate}
                    selectedSlot={wizard.selectedSlot}
                    slotEndTime={wizard.slotEndTime}
                    paymentMethod={wizard.paymentMethod}
                    onProceed={wizard.handleProceed}
                    canProceed={wizard.canProceed()}
                    isSubmitting={wizard.isSubmitting}
                  />
                </div>
              </div>
            ) : (
              /* Step 5: Success e Voucher */
              wizard.confirmedAppointment && (
                <Step5Success
                  appointment={wizard.confirmedAppointment}
                  tenant={tenant}
                  onNewBooking={wizard.handleNewBooking}
                  onAppointmentUpdated={wizard.setConfirmedAppointment}
                />
              )
            )}
          </div>
        )}

        {/* VIEW 2: CUSTOMER PORTAL */}
        {currentView === 'customer' && (
          <CustomerPortal
            tenant={tenant}
            onNavigateToBooking={() => handleSelectView('booking')}
          />
        )}

        {/* VIEW 3: STAFF PORTAL (Protected Guard) */}
        {currentView === 'staff' && (
          isAuthenticated && user && (user.role === 'staff' || user.role === 'partner_admin' || user.role === 'super_admin') ? (
            <StaffPortal
              tenant={tenant}
              staffList={wizard.staffList}
              services={wizard.catalog?.services || []}
              onRefreshStaff={() => wizard.handleSwitchTenant(tenant.slug)}
            />
          ) : (
            <RestrictedAccessView
              moduleName="Portal do Colaborador"
              requiredRoleName="Profissional ou Gestor Credenciado"
              onOpenLogin={() => openLoginModal('staff')}
              onGoHome={() => handleSelectView('landing')}
            />
          )
        )}

        {/* VIEW 4: PARTNER ADMIN PORTAL (Protected Guard) */}
        {currentView === 'admin' && (
          isAuthenticated && user && (user.role === 'partner_admin' || user.role === 'super_admin') ? (
            <AdminPortal
              tenant={tenant}
              categories={wizard.catalog?.categories || []}
              services={wizard.catalog?.services || []}
              staffList={wizard.staffList}
              onRefreshTenant={() => wizard.handleSwitchTenant(tenant.slug)}
            />
          ) : (
            <RestrictedAccessView
              moduleName="Gestão do Estabelecimento Parceiro"
              requiredRoleName="Gestor / Administrador do Parceiro"
              onOpenLogin={() => openLoginModal('partner_admin')}
              onGoHome={() => handleSelectView('landing')}
            />
          )
        )}

        {/* VIEW 5: SUPER ADMIN PORTAL (Protected Guard) */}
        {currentView === 'super-admin' && (
          isAuthenticated && user && user.role === 'super_admin' ? (
            <SuperAdminPortal
              onImpersonateTenant={handleImpersonate}
              onRefreshEcosystem={() => wizard.handleSwitchTenant(tenant.slug)}
            />
          ) : (
            <RestrictedAccessView
              moduleName="Governança Global do Ecossistema"
              requiredRoleName="Super Administrador Master"
              onOpenLogin={() => openLoginModal('super_admin')}
              onGoHome={() => handleSelectView('landing')}
            />
          )
        )}
      </main>

      {/* Multi-Tenant Switcher Modal - Only accessible on central portal */}
      {!isDedicated && (
        <TenantSwitcherModal
          isOpen={wizard.isSwitcherOpen}
          onClose={() => wizard.setIsSwitcherOpen(false)}
          tenants={wizard.allTenants}
          currentSlug={wizard.slug}
          onSelectTenant={wizard.handleSwitchTenant}
        />
      )}

      {/* Unified Google One Tap & Auth Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        targetRole={targetRoleForLogin}
        targetSlug={tenant.slug}
      />

      {/* Global Legal & Security Footer */}
      <GlobalFooter />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
