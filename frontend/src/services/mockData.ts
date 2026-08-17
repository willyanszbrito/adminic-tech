import { Tenant, CatalogResponse, Staff } from '../types';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tnt-barbearia-campelo',
    slug: 'barbearia-campelo',
    name: 'Barbearia Campelo',
    slogan: 'Corte, Barba e Estilo no Zumbi dos Palmares',
    description: 'Atendimento profissional e exclusivo com o barbeiro Julio Sousa. Cortes modernos e clássicos, barba, pigmentação e tratamentos capilares completos.',
    category: 'barbearia',
    logo_url: '/logos/logo_campelo.jpg',
    banner_url: 'https://placehold.co/1200x400/121212/d4af37?text=Barbearia+Campelo',
    phone: '(92) 98489-9955',
    whatsapp: '5592984899955',
    email: 'sofiaheufrosina@gmail.com',
    address: 'Av. Cosme Ferreira, 6340 - Zumbi dos Palmares, Manaus - AM',
    instagram: '@campelobarbearia_',
    is_active: true,
    features: ['Ambiente Climatizado', 'Wi-Fi Gratuito', 'Música Ambiente', 'Atendimento Personalizado'],
    plan_name: 'Plano Enterprise Pro',
    trial_days_remaining: 30,
    trial_status: 'active',
    trial_ends_at: '2026-09-16',
    monthly_revenue: 8900.0,
    theme: {
      primary_color: '#d4af37',
      secondary_color: '#121212',
      accent_color: '#b8860b',
      background_mode: 'dark',
      surface_glass_opacity: 0.7,
      glow_color: 'rgba(212, 175, 55, 0.25)',
      font_heading: 'Outfit',
      font_body: 'Inter',
      badge_text: 'Barbearia Oficial Homologada'
    },
    business_hours: {
      days_open: [0, 1, 2, 3, 4, 5],
      open_time: '10:00',
      close_time: '20:00',
      slot_interval_minutes: 30,
      lunch_break_start: '13:00',
      lunch_break_end: '14:00'
    }
  },
  {
    id: 'tnt-segredos-do-corte',
    slug: 'segredos-do-corte',
    name: 'Segredos do Corte',
    slogan: 'A Arte do Degradê e Barboterapia de Alto Nível',
    description: 'Barbearia conceito comandada por Jefferson Mendonça (Jefinho). Especialistas em degradê na régua, barboterapia relaxante e cortes modernos.',
    category: 'barbearia',
    logo_url: '/logos/logo_segredosdocorte.png',
    banner_url: 'https://placehold.co/1200x400/0f172a/38bdf8?text=Segredos+do+Corte',
    phone: '(92) 98489-9955',
    whatsapp: '5592984899955',
    email: 'sofiaheufrosina@gmail.com',
    address: 'Manaus - AM',
    instagram: '@segredosdocorte_jefinho',
    is_active: true,
    features: ['Ambiente Climatizado', 'Wi-Fi de Alta Velocidade', 'Café Cortesia', 'Atendimento com Hora Marcada'],
    plan_name: 'Plano Enterprise Pro',
    trial_days_remaining: 30,
    trial_status: 'active',
    trial_ends_at: '2026-09-16',
    monthly_revenue: 7800.0,
    theme: {
      primary_color: '#38bdf8',
      secondary_color: '#0f172a',
      accent_color: '#0284c7',
      background_mode: 'dark',
      surface_glass_opacity: 0.7,
      glow_color: 'rgba(56, 189, 248, 0.25)',
      font_heading: 'Montserrat',
      font_body: 'Inter',
      badge_text: 'Barbearia Conceito Manaus'
    },
    business_hours: {
      days_open: [0, 1, 2, 3, 4, 5],
      open_time: '09:00',
      close_time: '19:00',
      slot_interval_minutes: 30,
      lunch_break_start: '12:00',
      lunch_break_end: '13:00'
    }
  },
  {
    id: 'tnt-aura-barber',
    slug: 'barbearia-vintage',
    name: 'Aura Barber Club',
    slogan: 'Excelência em Visagismo, Barbearia Clássica e Estilo Masculino',
    description: 'Ambiente corporativo e sofisticado com atendimento sob medida, profissionais especializados e estrutura de alto padrão para executivos e cavalheiros exigentes.',
    category: 'barbearia',
    logo_url: 'https://placehold.co/200x200/18181b/f59e0b?text=Aura+Barber',
    banner_url: 'https://placehold.co/1200x400/18181b/f59e0b?text=Aura+Barber+Club+Executive',
    phone: '(11) 3456-7890',
    whatsapp: '5511999998888',
    email: 'contato@aurabarber.com.br',
    address: 'Avenida Paulista, 1842, Conjunto 401, Bela Vista, São Paulo - SP',
    instagram: '@aurabarberclub',
    is_active: true,
    features: ['Wi-Fi Corporativo', 'Ar-Condicionado', 'Café Premium e Bebidas', 'Estacionamento Valet'],
    plan_name: 'Plano Enterprise Pro',
    trial_days_remaining: 26,
    trial_status: 'active',
    trial_ends_at: '2026-09-11',
    monthly_revenue: 18450.0,
    theme: {
      primary_color: '#f59e0b',
      secondary_color: '#18181b',
      accent_color: '#d97706',
      background_mode: 'dark',
      surface_glass_opacity: 0.7,
      glow_color: 'rgba(245, 158, 11, 0.25)',
      font_heading: 'Outfit',
      font_body: 'Inter',
      badge_text: 'Parceiro Oficial Adminic'
    },
    business_hours: {
      days_open: [0, 1, 2, 3, 4, 5],
      open_time: '09:00',
      close_time: '20:00',
      slot_interval_minutes: 30,
      lunch_break_start: '12:00',
      lunch_break_end: '13:00'
    }
  }
];

export const MOCK_CATALOGS: Record<string, CatalogResponse> = {
  'barbearia-campelo': {
    tenant_slug: 'barbearia-campelo',
    total_services: 6,
    categories: [
      { id: 'cat-campelo-cortes', tenant_id: 'tnt-barbearia-campelo', name: 'Cortes e Acabamentos', icon: 'scissors', display_order: 1 },
      { id: 'cat-campelo-barba', tenant_id: 'tnt-barbearia-campelo', name: 'Barba e Estética', icon: 'sparkles', display_order: 2 },
      { id: 'cat-campelo-combos', tenant_id: 'tnt-barbearia-campelo', name: 'Tratamentos e Combos', icon: 'crown', display_order: 3 }
    ],
    services: [
      {
        id: 'srv-campelo-corte',
        tenant_id: 'tnt-barbearia-campelo',
        category_id: 'cat-campelo-cortes',
        name: 'Corte',
        description: 'Corte masculino clássico ou degradê moderno com acabamento impecável.',
        duration_minutes: 30,
        price: 30.0,
        image_url: '/logos/logo_campelo.jpg',
        is_featured: true,
        is_active: true
      },
      {
        id: 'srv-campelo-barba',
        tenant_id: 'tnt-barbearia-campelo',
        category_id: 'cat-campelo-barba',
        name: 'Barba',
        description: 'Design e alinhamento completo de barba na navalha com hidratação.',
        duration_minutes: 20,
        price: 15.0,
        image_url: '/logos/logo_campelo.jpg',
        is_featured: true,
        is_active: true
      },
      {
        id: 'srv-campelo-pigmentacao',
        tenant_id: 'tnt-barbearia-campelo',
        category_id: 'cat-campelo-barba',
        name: 'Pigmentação',
        description: 'Pigmentação suave e de alta definição para realce do desenho capilar e barba.',
        duration_minutes: 15,
        price: 5.0,
        image_url: '/logos/logo_campelo.jpg',
        is_featured: false,
        is_active: true
      },
      {
        id: 'srv-campelo-sobrancelha',
        tenant_id: 'tnt-barbearia-campelo',
        category_id: 'cat-campelo-cortes',
        name: 'Sobrancelha',
        description: 'Alinhamento e limpeza de sobrancelha na navalha.',
        duration_minutes: 10,
        price: 5.0,
        image_url: '/logos/logo_campelo.jpg',
        is_featured: false,
        is_active: true
      },
      {
        id: 'srv-campelo-pezinho',
        tenant_id: 'tnt-barbearia-campelo',
        category_id: 'cat-campelo-cortes',
        name: 'Pézinho',
        description: 'Acabamento e contorno preciso da nuca e costeletas.',
        duration_minutes: 15,
        price: 10.0,
        image_url: '/logos/logo_campelo.jpg',
        is_featured: false,
        is_active: true
      },
      {
        id: 'srv-campelo-completo',
        tenant_id: 'tnt-barbearia-campelo',
        category_id: 'cat-campelo-combos',
        name: 'Corte Completo + Lavagem + Hidratação',
        description: 'Combo completo: corte de cabelo estilizado, lavatório refrescante e hidratação capilar profunda.',
        duration_minutes: 60,
        price: 70.0,
        image_url: '/logos/logo_campelo.jpg',
        is_featured: true,
        is_active: true
      }
    ]
  },
  'barbearia-vintage': {
    tenant_slug: 'barbearia-vintage',
    total_services: 1,
    categories: [
      { id: 'cat-cabelo', tenant_id: 'tnt-aura-barber', name: 'Cabelo e Visagismo', icon: 'scissors', display_order: 1 },
      { id: 'cat-barba', tenant_id: 'tnt-aura-barber', name: 'Barboterapia e Cuidados', icon: 'sparkles', display_order: 2 },
      { id: 'cat-combos', tenant_id: 'tnt-aura-barber', name: 'Combos Corporativos', icon: 'crown', display_order: 3 }
    ],
    services: [
      {
        id: 'srv-corte-degrade',
        tenant_id: 'tnt-aura-barber',
        category_id: 'cat-cabelo',
        name: 'Corte Degradê e Visagismo',
        description: 'Corte de alta precisão com consultoria de estilo, lavagem especial e finalização.',
        duration_minutes: 45,
        price: 75.0,
        image_url: 'https://placehold.co/400x300/18181b/f59e0b?text=Corte+Degrade',
        is_featured: true,
        is_active: true
      }
    ]
  }
};

export const MOCK_STAFF: Record<string, Staff[]> = {
  'barbearia-campelo': [
    {
      id: 'stf-julio-sousa',
      tenant_id: 'tnt-barbearia-campelo',
      name: 'Julio Sousa',
      role: 'Barbeiro e Fundador',
      bio: 'Profissional experiente e dedicado, especialista em visagismo, degradês e acabamentos na navalha na Barbearia Campelo.',
      avatar_url: '/logos/logo_campelo.jpg',
      phone: '(92) 98489-9955',
      email: 'sofiaheufrosina@gmail.com',
      rating: 5.0,
      total_reviews: 142,
      is_active: true,
      specialty_service_ids: [
        'srv-campelo-corte',
        'srv-campelo-barba',
        'srv-campelo-pigmentacao',
        'srv-campelo-sobrancelha',
        'srv-campelo-pezinho',
        'srv-campelo-completo'
      ],
      shifts: [0, 1, 2, 3, 4, 5].map(i => ({
        day_of_week: i,
        start_time: '10:00',
        end_time: '20:00',
        lunch_start: '13:00',
        lunch_end: '14:00'
      })),
      blocked_slots: []
    }
  ],
  'barbearia-vintage': [
    {
      id: 'stf-marcus-barber',
      tenant_id: 'tnt-aura-barber',
      name: 'Marcus Aurelius Silva',
      role: 'Master Barber e Consultor de Visagismo',
      bio: 'Mais de 12 anos de experiência em cortes clássicos e visagismo.',
      avatar_url: 'https://placehold.co/200x200/18181b/f59e0b?text=Marcus+Aurelius',
      rating: 4.9,
      total_reviews: 218,
      is_active: true,
      specialty_service_ids: ['srv-corte-degrade'],
      shifts: [0, 1, 2, 3, 4, 5].map(i => ({
        day_of_week: i,
        start_time: '09:00',
        end_time: '19:00',
        lunch_start: '12:00',
        lunch_end: '13:00'
      })),
      blocked_slots: []
    }
  ]
};
