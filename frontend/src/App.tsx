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
import { PortalView } from './types';
import { Shield, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  // 1. Initial Theme Mode: Default Light, auto-detect OS preference
  const getInitialTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  };

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(getInitialTheme);
  const { isLoginModalOpen, closeLoginModal, targetRoleForLogin } = useAuth();

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

  // 2. Initial Portal View: Check URL path or query params
  const getInitialView = (): PortalView => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as PortalView;
    if (viewParam && ['booking', 'customer', 'staff', 'admin', 'super-admin'].includes(viewParam)) {
      return viewParam;
    }

    const path = window.location.pathname.toLowerCase();
    if (path.includes('meus-agendamentos') || path.includes('cliente')) return 'customer';
    if (path.includes('colaborador') || path.includes('staff')) return 'staff';
    if (path.includes('gestao') || path.includes('admin') && !path.includes('super-admin')) return 'admin';
    if (path.includes('super-admin')) return 'super-admin';

    return 'booking';
  };

  const [currentView, setCurrentView] = useState<PortalView>(getInitialView);

  const wizard = useBookingWizard();
  useTenantTheme(wizard.tenant, themeMode);

  const handleSelectView = (view: PortalView) => {
    setCurrentView(view);
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url.toString());
  };

  const handleImpersonate = (targetSlug: string) => {
    wizard.handleSwitchTenant(targetSlug);
    handleSelectView('booking');
  };

  // Render Light/Dark Loading Spinner
  if (wizard.isLoading) {
    return <LoadingSpinner slug={wizard.slug} />;
  }

  // Error / Not Found State
  if (wizard.error && !wizard.tenant) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08080a] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md glass-panel rounded-3xl p-8 border border-rose-500/30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Estabelecimento Não Encontrado</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Não localizamos nenhum parceiro ativo com o identificador <span className="text-brand-primary font-mono font-bold">"{wizard.slug}"</span>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => wizard.handleSwitchTenant('barbearia-vintage')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 transition-opacity cursor-pointer"
            >
              Abrir Aura Barber Club (Demonstração)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tenant = wizard.tenant!;

  return (
    <div className="min-h-screen relative selection:bg-brand-primary/30 selection:text-brand-primary pb-20">
      {/* Background Ambient Glows */}
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />

      {/* Global Top Navbar with Portal Switcher */}
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
        {/* VIEW 1: PUBLIC BOOKING FLOW */}
        {currentView === 'booking' && (
          <div className="space-y-8">
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
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar para etapa anterior</span>
                    </button>
                  )}

                  {wizard.currentStep === 1 && wizard.catalog && (
                    <Step1Services
                      categories={wizard.catalog.categories}
                      services={wizard.catalog.services}
                      selectedService={wizard.selectedService}
                      onSelectService={wizard.handleSelectService}
                    />
                  )}

                  {wizard.currentStep === 2 && (
                    <Step2Staff
                      staffList={wizard.staffList}
                      selectedService={wizard.selectedService}
                      selectedStaff={wizard.selectedStaff}
                      isAnyStaff={wizard.isAnyStaff}
                      onSelectStaff={wizard.handleSelectStaff}
                    />
                  )}

                  {wizard.currentStep === 3 && (
                    <Step3DateTime
                      selectedDate={wizard.selectedDate}
                      onSelectDate={wizard.handleSelectDate}
                      availability={wizard.availability}
                      isLoadingAvailability={wizard.isLoadingAvailability}
                      selectedSlot={wizard.selectedSlot}
                      onSelectSlot={wizard.handleSelectSlot}
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

        {/* VIEW 3: STAFF PORTAL */}
        {currentView === 'staff' && (
          <StaffPortal
            tenant={tenant}
            staffList={wizard.staffList}
            services={wizard.catalog?.services || []}
            onRefreshStaff={() => wizard.handleSwitchTenant(tenant.slug)}
          />
        )}

        {/* VIEW 4: PARTNER ADMIN PORTAL */}
        {currentView === 'admin' && (
          <AdminPortal
            tenant={tenant}
            categories={wizard.catalog?.categories || []}
            services={wizard.catalog?.services || []}
            staffList={wizard.staffList}
            onRefreshTenant={() => wizard.handleSwitchTenant(tenant.slug)}
          />
        )}

        {/* VIEW 5: SUPER ADMIN PORTAL */}
        {currentView === 'super-admin' && (
          <SuperAdminPortal
            onImpersonateTenant={handleImpersonate}
            onRefreshEcosystem={() => wizard.handleSwitchTenant(tenant.slug)}
          />
        )}
      </main>

      {/* Multi-Tenant Switcher Modal */}
      <TenantSwitcherModal
        isOpen={wizard.isSwitcherOpen}
        onClose={() => wizard.setIsSwitcherOpen(false)}
        tenants={wizard.allTenants}
        currentSlug={wizard.slug}
        onSelectTenant={wizard.handleSwitchTenant}
      />

      {/* Unified Google One Tap & Auth Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        targetRole={targetRoleForLogin}
        targetSlug={tenant.slug}
      />

      {/* Modern Footer */}
      <footer className="mt-20 pt-8 pb-12 border-t border-black/10 dark:border-white/10 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-bold font-heading text-slate-900 dark:text-white">Adminic Smart Booking</span>
          <span>•</span>
          <span>Arquitetura Multi-Tenant com Zero Hardcode</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Frontend acessível via <span className="font-mono text-slate-600 dark:text-slate-400">ia.adminic.com.br/:slug</span> | API centralizada em <span className="font-mono text-slate-600 dark:text-slate-400">api.adminic.com.br</span>
        </p>
      </footer>
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

