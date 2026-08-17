import { useState, useEffect, useCallback } from 'react';
import {
  Tenant,
  CatalogResponse,
  Staff,
  AvailabilityResponse,
  Service,
  TimeSlot,
  Appointment,
  WizardStep,
} from '../types';
import { api } from '../services/api';
import { isDedicatedSubdomain, getDedicatedSubdomainSlug, normalizeTenantSlug } from '../services/domainHelper';

const RESERVED_SYSTEM_ROUTES = [
  'meus-agendamentos',
  'cliente',
  'customer',
  'colaborador',
  'staff',
  'gestao',
  'admin',
  'super-admin',
  'dashboard',
  'docs',
  'api',
];

export function useBookingWizard() {
  const getInitialSlug = (): string => {
    // 0. Dedicated Subdomain: Top priority, strict isolation (e.g. campelo.adminic.com.br or segredosdocorte.adminic.com.br)
    if (isDedicatedSubdomain()) {
      const dedicated = getDedicatedSubdomainSlug();
      if (dedicated) {
        sessionStorage.setItem('adminic_active_tenant', dedicated);
        return dedicated;
      }
    }

    // 1. Check query param ?tenant=... or ?slug=...
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tenantParam = params.get('tenant') || params.get('slug');
      if (tenantParam) {
        const norm = normalizeTenantSlug(tenantParam);
        sessionStorage.setItem('adminic_active_tenant', norm);
        return norm;
      }

      // 2. Parse URL pathname
      const pathParts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

      if (pathParts.length > 0) {
        const firstSegment = pathParts[0].toLowerCase();

        // If the first segment is a partner slug (e.g. /segredos-do-corte or /barbearia-campelo)
        if (!RESERVED_SYSTEM_ROUTES.includes(firstSegment) && !firstSegment.includes('.')) {
          const norm = normalizeTenantSlug(firstSegment);
          sessionStorage.setItem('adminic_active_tenant', norm);
          return norm;
        }

        // If the first segment is a reserved portal (e.g. /meus-agendamentos/segredos-do-corte)
        if (pathParts.length > 1) {
          const secondSegment = pathParts[1].toLowerCase();
          if (!RESERVED_SYSTEM_ROUTES.includes(secondSegment)) {
            const norm = normalizeTenantSlug(secondSegment);
            sessionStorage.setItem('adminic_active_tenant', norm);
            return norm;
          }
        }
      }

      // 3. Check persistent storage from previous session
      const saved = sessionStorage.getItem('adminic_active_tenant');
      if (saved && saved.trim() !== '') {
        return normalizeTenantSlug(saved);
      }
    }

    // 4. Default fallback tenant
    return 'barbearia-campelo';
  };

  const [slug, setSlug] = useState<string>(getInitialSlug());
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);

  // Booking Flow State
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isAnyStaff, setIsAnyStaff] = useState<boolean>(true);
  
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slotEndTime, setSlotEndTime] = useState<string>('');

  // Customer Form
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'venue'>('pix');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Result
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const loadTenantData = useCallback(async (targetSlug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [tenantsList, tenantData, catalogData] = await Promise.all([
        api.getTenants(),
        api.getTenant(targetSlug),
        api.getCatalog(targetSlug),
      ]);

      setAllTenants(tenantsList);
      setTenant(tenantData);
      setCatalog(catalogData);
      sessionStorage.setItem('adminic_active_tenant', targetSlug);

      const staffData = await api.getStaff(targetSlug);
      setStaffList(staffData);

      setSelectedService(null);
      setSelectedStaff(null);
      setIsAnyStaff(true);
      setSelectedSlot('');
      setSlotEndTime('');
      setCurrentStep(1);
      setMaxStepReached(1);
      setConfirmedAppointment(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do estabelecimento parceiro.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenantData(slug);
  }, [slug, loadTenantData]);

  useEffect(() => {
    if (!tenant) return;
    const fetchStaffForService = async () => {
      try {
        const list = await api.getStaff(tenant.slug, selectedService?.id);
        setStaffList(list);
      } catch {
        // fallback
      }
    };
    fetchStaffForService();
  }, [tenant, selectedService]);

  const loadAvailability = useCallback(
    async (dateStr: string, staffId?: string, serviceId?: string) => {
      if (!tenant) return;
      setIsLoadingAvailability(true);
      try {
        const data = await api.getAvailability(tenant.slug, dateStr, staffId, serviceId);
        setAvailability(data);
      } catch (err: any) {
        setAvailability(null);
      } finally {
        setIsLoadingAvailability(false);
      }
    },
    [tenant]
  );

  useEffect(() => {
    if (currentStep === 3 && selectedDate) {
      loadAvailability(
        selectedDate,
        isAnyStaff ? undefined : selectedStaff?.id,
        selectedService?.id
      );
    }
  }, [currentStep, selectedDate, selectedStaff, isAnyStaff, selectedService, loadAvailability]);

  // Step 1 Navigation
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedSlot('');
    setSlotEndTime('');
    setCurrentStep(2);
    setMaxStepReached((prev) => Math.max(prev, 2));
  };

  // Step 2 Navigation
  const handleSelectStaff = (staff: Staff | null, anyStaff: boolean = false) => {
    setSelectedStaff(staff);
    setIsAnyStaff(anyStaff);
    setSelectedSlot('');
    setSlotEndTime('');
    setCurrentStep(3);
    setMaxStepReached((prev) => Math.max(prev, 3));
  };

  // Step 3 Navigation
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setSlotEndTime('');
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot.start_time);
    setSlotEndTime(slot.end_time);
  };

  const handleProceedToCustomerForm = () => {
    if (!selectedSlot) return;
    setCurrentStep(4);
    setMaxStepReached((prev) => Math.max(prev, 4));
  };

  // Step 4 Submit Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !selectedService || !selectedSlot) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const appointment = await api.createAppointment(tenant.slug, {
        service_id: selectedService.id,
        staff_id: isAnyStaff ? undefined : selectedStaff?.id,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notes: notes || undefined,
        payment_method: paymentMethod,
      });

      setConfirmedAppointment(appointment);
      setCurrentStep(5);
      setMaxStepReached(5);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch Partner / Tenant
  const handleSwitchTenant = (newSlug: string) => {
    setSlug(newSlug);
    setIsSwitcherOpen(false);
    sessionStorage.setItem('adminic_active_tenant', newSlug);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('slug', newSlug);
      window.history.pushState({}, '', url.toString());
    }
    loadTenantData(newSlug);
  };

  // Step jump
  const handleStepClick = (step: WizardStep) => {
    if (step <= maxStepReached && step < 5) {
      setCurrentStep(step);
    }
  };

  // Reset to initial booking state
  const handleNewBooking = () => {
    setSelectedService(null);
    setSelectedStaff(null);
    setIsAnyStaff(true);
    setSelectedDate(getTomorrowDate());
    setSelectedSlot('');
    setSlotEndTime('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setPaymentMethod('pix');
    setConfirmedAppointment(null);
    setCurrentStep(1);
    setMaxStepReached(1);
    setError(null);
  };

  const canProceed = () => {
    if (currentStep === 1) return !!selectedService;
    if (currentStep === 2) return isAnyStaff || !!selectedStaff;
    if (currentStep === 3) return !!selectedSlot;
    if (currentStep === 4)
      return (
        !!customerName.trim() &&
        !!customerPhone.trim() &&
        !!customerEmail.trim() &&
        customerEmail.includes('@') &&
        agreeTerms
      );
    return false;
  };

  const handleProceed = () => {
    if (currentStep === 1 && selectedService) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
    else if (currentStep === 3 && selectedSlot) handleProceedToCustomerForm();
    else if (currentStep === 4) handleSubmitBooking({ preventDefault: () => {} } as any);
  };

  return {
    slug,
    allTenants,
    tenant,
    catalog,
    staffList,
    availability,
    isLoading,
    isLoadingAvailability,
    isSubmitting,
    error,
    isSwitcherOpen,
    setIsSwitcherOpen,
    currentStep,
    maxStepReached,
    selectedService,
    selectedStaff,
    isAnyStaff,
    selectedDate,
    selectedSlot,
    slotEndTime,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerEmail,
    setCustomerEmail,
    notes,
    setNotes,
    paymentMethod,
    setPaymentMethod,
    agreeTerms,
    setAgreeTerms,
    confirmedAppointment,
    setConfirmedAppointment,
    handleSelectService,
    handleSelectStaff,
    handleSelectDate,
    handleSelectSlot,
    handleSubmitBooking,
    handleSwitchTenant,
    handleStepClick,
    handleNewBooking,
    canProceed,
    handleProceed,
  };
}
