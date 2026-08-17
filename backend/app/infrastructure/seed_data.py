from app.domain.entities import (
    Tenant, TenantTheme, BusinessHours, ServiceCategory,
    Service, Staff, StaffShift, BlockedSlot
)

# 1. Aura Barber Club (Barbearia Corporativa e Cuidados Masculinos)
TENANT_BARBER = Tenant(
    id="tnt-aura-barber",
    slug="barbearia-vintage",
    name="Aura Barber Club",
    slogan="Excelência em Visagismo, Barbearia Clássica e Estilo Masculino",
    description="Ambiente corporativo e sofisticado com atendimento sob medida, profissionais especializados e estrutura de alto padrão para executivos e cavalheiros exigentes.",
    category="barbearia",
    logo_url="https://placehold.co/200x200/18181b/f59e0b?text=Aura+Barber",
    banner_url="https://placehold.co/1200x400/18181b/f59e0b?text=Aura+Barber+Club+Executive",
    phone="(11) 3456-7890",
    whatsapp="5511999998888",
    email="contato@aurabarber.com.br",
    address="Avenida Paulista, 1842, Conjunto 401, Bela Vista, São Paulo - SP",
    instagram="@aurabarberclub",
    features=["Wi-Fi Corporativo", "Ar-Condicionado", "Café Premium e Bebidas", "Estacionamento Valet"],
    plan_name="Plano Enterprise Pro",
    trial_days_total=30,
    trial_days_remaining=26,
    trial_status="active",
    trial_ends_at="2026-09-11",
    monthly_revenue=18450.00,
    theme=TenantTheme(
        primary_color="#f59e0b",
        secondary_color="#18181b",
        accent_color="#d97706",
        background_mode="dark",
        surface_glass_opacity=0.70,
        glow_color="rgba(245, 158, 11, 0.25)",
        font_heading="Outfit",
        font_body="Inter",
        badge_text="Parceiro Oficial Adminic"
    ),
    business_hours=BusinessHours(
        days_open=[0, 1, 2, 3, 4, 5],
        open_time="09:00",
        close_time="20:00",
        slot_interval_minutes=30,
        lunch_break_start="12:00",
        lunch_break_end="13:00"
    )
)

CATEGORIES_BARBER = [
    ServiceCategory(id="cat-cabelo", tenant_id="tnt-aura-barber", name="Cabelo e Visagismo", icon="scissors", display_order=1),
    ServiceCategory(id="cat-barba", tenant_id="tnt-aura-barber", name="Barboterapia e Cuidados", icon="sparkles", display_order=2),
    ServiceCategory(id="cat-combos", tenant_id="tnt-aura-barber", name="Combos Corporativos", icon="crown", display_order=3),
]

SERVICES_BARBER = [
    Service(
        id="srv-corte-degrade",
        tenant_id="tnt-aura-barber",
        category_id="cat-cabelo",
        name="Corte Degradê e Visagismo",
        description="Corte de alta precisão com consultoria de estilo, lavagem especial, finalização personalizada e alinhamento do contorno facial.",
        duration_minutes=45,
        price=75.00,
        image_url="https://placehold.co/400x300/18181b/f59e0b?text=Corte+Degrade",
        is_featured=True
    ),
    Service(
        id="srv-corte-tesoura",
        tenant_id="tnt-aura-barber",
        category_id="cat-cabelo",
        name="Corte Tradicional na Tesoura",
        description="Modelagem clássica 100% na tesoura para homens que prezam por linhas fluidas, acabamento natural e discrição.",
        duration_minutes=45,
        price=85.00,
        image_url="https://placehold.co/400x300/18181b/f59e0b?text=Corte+Tesoura",
        is_featured=False
    ),
    Service(
        id="srv-barba-terapia",
        tenant_id="tnt-aura-barber",
        category_id="cat-barba",
        name="Barboterapia com Toalha Quente",
        description="Ritual com vapor de ozônio, toalha quente aromática, óleos essenciais, massagem facial e hidratação profunda para os fios da barba.",
        duration_minutes=40,
        price=65.00,
        image_url="https://placehold.co/400x300/18181b/f59e0b?text=Barboterapia",
        is_featured=True
    ),
    Service(
        id="srv-combo-executivo",
        tenant_id="tnt-aura-barber",
        category_id="cat-combos",
        name="Combo Executivo Completo",
        description="Corte estilizado + Barboterapia completa com toalha quente + higienização capilar refrescante e alinhamento de sobrancelhas.",
        duration_minutes=75,
        price=130.00,
        image_url="https://placehold.co/400x300/18181b/f59e0b?text=Combo+Executivo",
        is_featured=True
    )
]

STAFF_BARBER = [
    Staff(
        id="stf-marcus-barber",
        tenant_id="tnt-aura-barber",
        name="Marcus Aurelius Silva",
        role="Master Barber e Consultor de Visagismo",
        bio="Mais de 12 anos de experiência internacional em cortes clássicos masculinos, visagismo e cuidados com a barba.",
        avatar_url="https://placehold.co/200x200/18181b/f59e0b?text=Marcus+Aurelius",
        rating=4.9,
        total_reviews=218,
        specialty_service_ids=["srv-corte-degrade", "srv-corte-tesoura", "srv-barba-terapia", "srv-combo-executivo"],
        shifts=[StaffShift(day_of_week=i, start_time="09:00", end_time="19:00", lunch_start="12:00", lunch_end="13:00") for i in range(6)],
        blocked_slots=[
            BlockedSlot(id="blk-1", date="2026-08-18", start_time="16:00", end_time="17:00", reason="Reunião de Alinhamento Técnico")
        ]
    ),
    Staff(
        id="stf-lucius-barber",
        tenant_id="tnt-aura-barber",
        name="Lucius Mendes",
        role="Especialista em Degradê e Cortes Urbanos",
        bio="Especialista em técnicas de Fade, textura e finalização moderna com pomadas premium.",
        avatar_url="https://placehold.co/200x200/18181b/f59e0b?text=Lucius+Mendes",
        rating=4.8,
        total_reviews=164,
        specialty_service_ids=["srv-corte-degrade", "srv-combo-executivo"],
        shifts=[StaffShift(day_of_week=i, start_time="10:00", end_time="20:00", lunch_start="13:00", lunch_end="14:00") for i in range(6)],
        blocked_slots=[]
    ),
    Staff(
        id="stf-valerius-barber",
        tenant_id="tnt-aura-barber",
        name="Valerius Vinícius",
        role="Terapeuta Capilar e Mestre em Barboterapia",
        bio="Focado em saúde capilar masculina, tratamentos antiqueda e barboterapia relaxante de alta performance.",
        avatar_url="https://placehold.co/200x200/18181b/f59e0b?text=Valerius+V",
        rating=4.9,
        total_reviews=142,
        specialty_service_ids=["srv-barba-terapia", "srv-combo-executivo", "srv-corte-tesoura"],
        shifts=[StaffShift(day_of_week=i, start_time="09:00", end_time="18:00", lunch_start="12:00", lunch_end="13:00") for i in range(6)],
        blocked_slots=[]
    )
]

# 2. Veritas Clínica Dermatológica (Saúde, Bem-Estar e Dermatologia Estética)
TENANT_CLINIC = Tenant(
    id="tnt-veritas-clinic",
    slug="clinica-renova",
    name="Veritas Clínica Dermatológica",
    slogan="Medicina Estética Avançada e Saúde Integrada da Pele",
    description="Corpo clínico altamente qualificado, infraestrutura moderna e protocolos dermatológicos baseados em evidências científicas.",
    category="clinica",
    logo_url="https://placehold.co/200x200/0f172a/06b6d4?text=Veritas+Med",
    banner_url="https://placehold.co/1200x400/0f172a/06b6d4?text=Veritas+Clinica+Dermatologica",
    phone="(11) 4004-9988",
    whatsapp="5511988887777",
    email="atendimento@veritasclinica.med.br",
    address="Rua Oscar Freire, 920, 5º Andar, Jardins, São Paulo - SP",
    instagram="@veritasdermatologia",
    features=["Consultórios Climatizados", "Equipamentos de Última Geração", "Estacionamento com Manobrista", "Acessibilidade Universal"],
    plan_name="Plano Enterprise Pro",
    trial_days_total=30,
    trial_days_remaining=21,
    trial_status="active",
    trial_ends_at="2026-09-06",
    monthly_revenue=34200.00,
    theme=TenantTheme(
        primary_color="#06b6d4",
        secondary_color="#0f172a",
        accent_color="#10b981",
        background_mode="light",
        surface_glass_opacity=0.75,
        glow_color="rgba(6, 182, 212, 0.25)",
        font_heading="Outfit",
        font_body="Inter",
        badge_text="Corpo Clínico Certificado"
    ),
    business_hours=BusinessHours(
        days_open=[0, 1, 2, 3, 4],
        open_time="08:00",
        close_time="18:00",
        slot_interval_minutes=45,
        lunch_break_start="12:30",
        lunch_break_end="13:30"
    )
)

CATEGORIES_CLINIC = [
    ServiceCategory(id="cat-facial", tenant_id="tnt-veritas-clinic", name="Procedimentos Faciais", icon="sparkles", display_order=1),
    ServiceCategory(id="cat-dermo", tenant_id="tnt-veritas-clinic", name="Consultas Dermatológicas", icon="stethoscope", display_order=2),
]

SERVICES_CLINIC = [
    Service(
        id="srv-limpeza-profunda",
        tenant_id="tnt-veritas-clinic",
        category_id="cat-facial",
        name="Limpeza de Pele Profunda com Fototerapia",
        description="Higienização profunda com extração por sucção, peeling ultrassônico, máscara calmante e aplicação de LED para estímulo de colágeno.",
        duration_minutes=60,
        price=220.00,
        image_url="https://placehold.co/400x300/0f172a/06b6d4?text=Limpeza+Profunda",
        is_featured=True
    ),
    Service(
        id="srv-peeling-quimico",
        tenant_id="tnt-veritas-clinic",
        category_id="cat-facial",
        name="Peeling Químico Renovador",
        description="Tratamento dermatológico para clareamento de manchas solares, controle de oleosidade e renovação celular da epiderme.",
        duration_minutes=45,
        price=320.00,
        image_url="https://placehold.co/400x300/0f172a/06b6d4?text=Peeling+Quimico",
        is_featured=False
    ),
    Service(
        id="srv-consulta-dermatologia",
        tenant_id="tnt-veritas-clinic",
        category_id="cat-dermo",
        name="Consulta Dermatológica Especializada",
        description="Avaliação clínica completa da saúde da pele, mapeamento corporal de lesões e prescrição de tratamentos clínicos personalizados.",
        duration_minutes=45,
        price=380.00,
        image_url="https://placehold.co/400x300/0f172a/06b6d4?text=Consulta+Medica",
        is_featured=True
    )
]

STAFF_CLINIC = [
    Staff(
        id="stf-cornelia-clinic",
        tenant_id="tnt-veritas-clinic",
        name="Dra. Cornélia Albuquerque",
        role="Médica Dermatologista (CRM/SP 148920)",
        bio="Membro titular da Sociedade Brasileira de Dermatologia, especializada em cosmiatria e procedimentos clínicos não invasivos.",
        avatar_url="https://placehold.co/200x200/0f172a/06b6d4?text=Dra+Cornelia",
        rating=5.0,
        total_reviews=189,
        specialty_service_ids=["srv-consulta-dermatologia", "srv-peeling-quimico"],
        shifts=[StaffShift(day_of_week=i, start_time="08:00", end_time="17:00", lunch_start="12:00", lunch_end="13:00") for i in range(5)],
        blocked_slots=[]
    ),
    Staff(
        id="stf-helena-clinic",
        tenant_id="tnt-veritas-clinic",
        name="Helena Ramos",
        role="Fisioterapeuta Dermato-Funcional",
        bio="Especialista em terapias de rejuvenescimento, drenagem facial e protocolos avançados de higienização cutânea.",
        avatar_url="https://placehold.co/200x200/0f172a/06b6d4?text=Helena+Ramos",
        rating=4.9,
        total_reviews=135,
        specialty_service_ids=["srv-limpeza-profunda", "srv-peeling-quimico"],
        shifts=[StaffShift(day_of_week=i, start_time="09:00", end_time="18:00", lunch_start="13:00", lunch_end="14:00") for i in range(5)],
        blocked_slots=[]
    )
]

# 3. Studio Elegance Estética e Beleza
TENANT_BEAUTY = Tenant(
    id="tnt-elegance-studio",
    slug="studio-elegance",
    name="Studio Elegance Estética e Beleza",
    slogan="Estética Integrada, Saúde Capilar e Experiências Exclusivas",
    description="Espaço de bem-estar dedicado a cuidados corporais, design facial e estética humanizada com tecnologia de ponta.",
    category="estetica",
    logo_url="https://placehold.co/200x200/271744/ec4899?text=Studio+Elegance",
    banner_url="https://placehold.co/1200x400/271744/ec4899?text=Studio+Elegance+Estetica",
    phone="(11) 5055-1234",
    whatsapp="5511977776666",
    email="contato@studioelegance.com.br",
    address="Alameda Lorena, 1420, Jardins, São Paulo - SP",
    instagram="@studioelegancebr",
    features=["Ambiente Sofisticado", "Espaço Relaxamento", "Produtos Importados", "Valet Cortesia"],
    plan_name="Plano Enterprise Pro",
    trial_days_total=30,
    trial_days_remaining=28,
    trial_status="active",
    trial_ends_at="2026-09-13",
    monthly_revenue=22100.00,
    theme=TenantTheme(
        primary_color="#ec4899",
        secondary_color="#2e1065",
        accent_color="#a855f7",
        background_mode="dark",
        surface_glass_opacity=0.70,
        glow_color="rgba(236, 72, 153, 0.25)",
        font_heading="Outfit",
        font_body="Inter",
        badge_text="Espaço Premium Certificado"
    ),
    business_hours=BusinessHours(
        days_open=[1, 2, 3, 4, 5, 6],
        open_time="09:00",
        close_time="19:00",
        slot_interval_minutes=45,
        lunch_break_start="12:00",
        lunch_break_end="13:00"
    )
)

CATEGORIES_BEAUTY = [
    ServiceCategory(id="cat-sobrancelhas", tenant_id="tnt-elegance-studio", name="Design Facial e Sobrancelhas", icon="eye", display_order=1),
    ServiceCategory(id="cat-cilios", tenant_id="tnt-elegance-studio", name="Extensão e Cuidados", icon="sparkles", display_order=2),
]

SERVICES_BEAUTY = [
    Service(
        id="srv-design-henna",
        tenant_id="tnt-elegance-studio",
        category_id="cat-sobrancelhas",
        name="Design de Sobrancelhas com Henna Orgânica",
        description="Mapeamento geométrico facial, epilação precisa com linha egípcia e aplicação de henna orgânica de longa duração.",
        duration_minutes=45,
        price=85.00,
        image_url="https://placehold.co/400x300/271744/ec4899?text=Design+Sobrancelhas",
        is_featured=True
    ),
    Service(
        id="srv-lash-lifting",
        tenant_id="tnt-elegance-studio",
        category_id="cat-cilios",
        name="Lash Lifting com Tratamento Nutritivo",
        description="Curvatura natural e hidratação profunda dos cílios naturais com queratina e pigmentação escura de longa durabilidade.",
        duration_minutes=60,
        price=150.00,
        image_url="https://placehold.co/400x300/271744/ec4899?text=Lash+Lifting",
        is_featured=True
    )
]

STAFF_BEAUTY = [
    Staff(
        id="stf-beatriz-beauty",
        tenant_id="tnt-elegance-studio",
        name="Beatriz Fontes",
        role="Master Lash e Especialista em Visagismo Facial",
        bio="Certificação internacional em visagismo facial e harmonização do olhar com mais de 7 anos de atuação no mercado de luxo.",
        avatar_url="https://placehold.co/200x200/271744/ec4899?text=Beatriz+Fontes",
        rating=4.9,
        total_reviews=176,
        specialty_service_ids=["srv-design-henna", "srv-lash-lifting"],
        shifts=[StaffShift(day_of_week=i, start_time="09:00", end_time="19:00", lunch_start="12:00", lunch_end="13:00") for i in [1, 2, 3, 4, 5, 6]],
        blocked_slots=[]
    ),
    Staff(
        id="stf-larissa-beauty",
        tenant_id="tnt-elegance-studio",
        name="Larissa Prado",
        role="Esteticista e Micropigmentadora",
        bio="Especialista em micropigmentação hiper-realista, design personalizado e tratamentos para cílios.",
        avatar_url="https://placehold.co/200x200/271744/ec4899?text=Larissa+Prado",
        rating=4.8,
        total_reviews=112,
        specialty_service_ids=["srv-design-henna", "srv-lash-lifting"],
        shifts=[StaffShift(day_of_week=i, start_time="10:00", end_time="19:00", lunch_start="13:00", lunch_end="14:00") for i in [1, 2, 3, 4, 5, 6]],
        blocked_slots=[]
    )
]

# 4. Apex Detail Studio Automotivo
TENANT_AUTO = Tenant(
    id="tnt-apex-auto",
    slug="auto-detail-pro",
    name="Apex Detail Studio Automotivo",
    slogan="Estética Automotiva de Alta Precisão e Proteção Cerâmica",
    description="Centro técnico especializado em lavagem detalhada, polimento técnico, vitrificação e conservação de veículos premium.",
    category="automotivo",
    logo_url="https://placehold.co/200x200/0f172a/3b82f6?text=Apex+Auto",
    banner_url="https://placehold.co/1200x400/0f172a/3b82f6?text=Apex+Detail+Studio",
    phone="(11) 2233-4455",
    whatsapp="5511966665555",
    email="contato@apexautodetail.com.br",
    address="Avenida Hélio Pellegrino, 780, Vila Nova Conceição, São Paulo - SP",
    instagram="@apexautodetail",
    features=["Box Climatizado", "Sala VIP para Espera", "Produtos Importados Gyeon", "Seguro Total de Pátio"],
    plan_name="Plano Enterprise Pro",
    trial_days_total=30,
    trial_days_remaining=14,
    trial_status="active",
    trial_ends_at="2026-08-30",
    monthly_revenue=42800.00,
    theme=TenantTheme(
        primary_color="#3b82f6",
        secondary_color="#0f172a",
        accent_color="#60a5fa",
        background_mode="dark",
        surface_glass_opacity=0.75,
        glow_color="rgba(59, 130, 246, 0.25)",
        font_heading="Outfit",
        font_body="Inter",
        badge_text="Centro Técnico Homologado"
    ),
    business_hours=BusinessHours(
        days_open=[0, 1, 2, 3, 4, 5],
        open_time="08:00",
        close_time="18:00",
        slot_interval_minutes=60,
        lunch_break_start="12:00",
        lunch_break_end="13:00"
    )
)

CATEGORIES_AUTO = [
    ServiceCategory(id="cat-lavagem", tenant_id="tnt-apex-auto", name="Detalhamento e Lavagem Técnica", icon="car", display_order=1),
    ServiceCategory(id="cat-protecao", tenant_id="tnt-apex-auto", name="Proteção e Vitrificação", icon="shield", display_order=2),
]

SERVICES_AUTO = [
    Service(
        id="srv-lavagem-detalhada",
        tenant_id="tnt-apex-auto",
        category_id="cat-lavagem",
        name="Lavagem Técnica Detalhada com Cera Premium",
        description="Limpeza minuciosa de caixa de rodas, descontaminação de pintura com clay bar, higienização dos emblemas com pincéis de cerdas naturais e aplicação de cera sintética.",
        duration_minutes=90,
        price=180.00,
        image_url="https://placehold.co/400x300/0f172a/3b82f6?text=Lavagem+Tecnica",
        is_featured=True
    ),
    Service(
        id="srv-polimento-comercial",
        tenant_id="tnt-apex-auto",
        category_id="cat-protecao",
        name="Polimento Técnico e Proteção de Pintura",
        description="Eliminação de micro-riscos superficiais (swirls), realce do brilho original da pintura e selamento com cera de carnaúba de alta durabilidade.",
        duration_minutes=180,
        price=550.00,
        image_url="https://placehold.co/400x300/0f172a/3b82f6?text=Polimento+Tecnico",
        is_featured=True
    )
]

STAFF_AUTO = [
    Staff(
        id="stf-alexandre-auto",
        tenant_id="tnt-apex-auto",
        name="Alexandre Costa",
        role="Detailer Master e Instrutor Certificado",
        bio="Certificação internacional em polimento técnico, correção de verniz e vitrificação cerâmica de alta durabilidade.",
        avatar_url="https://placehold.co/200x200/0f172a/3b82f6?text=Alexandre+Costa",
        rating=5.0,
        total_reviews=148,
        specialty_service_ids=["srv-lavagem-detalhada", "srv-polimento-comercial"],
        shifts=[StaffShift(day_of_week=i, start_time="08:00", end_time="18:00", lunch_start="12:00", lunch_end="13:00") for i in range(6)],
        blocked_slots=[]
    )
]

# ==============================================================================
# 5. Barbearia Campelo (Julio Sousa - Manaus/AM)
# ==============================================================================
TENANT_CAMPELO = Tenant(
    id="tnt-barbearia-campelo",
    slug="barbearia-campelo",
    name="Barbearia Campelo",
    slogan="Corte, Barba e Estilo no Zumbi dos Palmares",
    description="Atendimento profissional e exclusivo com o barbeiro Julio Sousa. Cortes modernos e clássicos, barba, pigmentação e tratamentos capilares completos.",
    category="barbearia",
    logo_url="/logos/logo_campelo.jpg",
    banner_url="https://placehold.co/1200x400/121212/d4af37?text=Barbearia+Campelo",
    phone="(92) 98489-9955",
    whatsapp="5592984899955",
    email="sofiaheufrosina@gmail.com",
    address="Av. Cosme Ferreira, 6340 - Zumbi dos Palmares, Manaus - AM",
    instagram="@campelobarbearia_",
    features=["Ambiente Climatizado", "Wi-Fi Gratuito", "Música Ambiente", "Atendimento Personalizado"],
    plan_name="Plano Enterprise Pro",
    trial_days_total=30,
    trial_days_remaining=30,
    trial_status="active",
    trial_ends_at="2026-09-16",
    monthly_revenue=0.00,
    pix_enabled=True,
    pix_mode="test_penny",
    pix_penny_price=0.01,
    theme=TenantTheme(
        primary_color="#d4af37",
        secondary_color="#121212",
        accent_color="#b8860b",
        background_mode="dark",
        surface_glass_opacity=0.70,
        glow_color="rgba(212, 175, 55, 0.25)",
        font_heading="Outfit",
        font_body="Inter",
        badge_text="Barbearia Oficial Homologada"
    ),
    business_hours=BusinessHours(
        days_open=[0, 1, 2, 3, 4, 5],
        open_time="10:00",
        close_time="20:00",
        slot_interval_minutes=30,
        lunch_break_start="13:00",
        lunch_break_end="14:00"
    )
)

CATEGORIES_CAMPELO = [
    ServiceCategory(id="cat-campelo-cortes", tenant_id="tnt-barbearia-campelo", name="Cortes e Acabamentos", icon="scissors", display_order=1),
    ServiceCategory(id="cat-campelo-barba", tenant_id="tnt-barbearia-campelo", name="Barba e Estética", icon="sparkles", display_order=2),
    ServiceCategory(id="cat-campelo-combos", tenant_id="tnt-barbearia-campelo", name="Tratamentos e Combos", icon="crown", display_order=3),
]

SERVICES_CAMPELO = [
    Service(
        id="srv-campelo-corte",
        tenant_id="tnt-barbearia-campelo",
        category_id="cat-campelo-cortes",
        name="Corte",
        description="Corte masculino clássico ou degradê moderno com acabamento impecável.",
        duration_minutes=30,
        price=30.00,
        image_url="/logos/logo_campelo.jpg",
        is_featured=True
    ),
    Service(
        id="srv-campelo-barba",
        tenant_id="tnt-barbearia-campelo",
        category_id="cat-campelo-barba",
        name="Barba",
        description="Design e alinhamento completo de barba na navalha com hidratação.",
        duration_minutes=20,
        price=15.00,
        image_url="/logos/logo_campelo.jpg",
        is_featured=True
    ),
    Service(
        id="srv-campelo-pigmentacao",
        tenant_id="tnt-barbearia-campelo",
        category_id="cat-campelo-barba",
        name="Pigmentação",
        description="Pigmentação suave e de alta definição para realce do desenho capilar e barba.",
        duration_minutes=15,
        price=5.00,
        image_url="/logos/logo_campelo.jpg",
        is_featured=False
    ),
    Service(
        id="srv-campelo-sobrancelha",
        tenant_id="tnt-barbearia-campelo",
        category_id="cat-campelo-cortes",
        name="Sobrancelha",
        description="Alinhamento e limpeza de sobrancelha na navalha.",
        duration_minutes=10,
        price=5.00,
        image_url="/logos/logo_campelo.jpg",
        is_featured=False
    ),
    Service(
        id="srv-campelo-pezinho",
        tenant_id="tnt-barbearia-campelo",
        category_id="cat-campelo-cortes",
        name="Pézinho",
        description="Acabamento e contorno preciso da nuca e costeletas.",
        duration_minutes=15,
        price=10.00,
        image_url="/logos/logo_campelo.jpg",
        is_featured=False
    ),
    Service(
        id="srv-campelo-completo",
        tenant_id="tnt-barbearia-campelo",
        category_id="cat-campelo-combos",
        name="Corte Completo + Lavagem + Hidratação",
        description="Combo completo: corte de cabelo estilizado, lavatório refrescante e hidratação capilar profunda.",
        duration_minutes=60,
        price=70.00,
        image_url="/logos/logo_campelo.jpg",
        is_featured=True
    )
]

STAFF_CAMPELO = [
    Staff(
        id="stf-julio-sousa",
        tenant_id="tnt-barbearia-campelo",
        name="Julio Sousa",
        role="Barbeiro e Fundador",
        bio="Profissional experiente e dedicado, especialista em visagismo, degradês e acabamentos na navalha na Barbearia Campelo.",
        avatar_url="/logos/logo_campelo.jpg",
        phone="(92) 98489-9955",
        email="sofiaheufrosina@gmail.com",
        rating=5.0,
        total_reviews=0,
        specialty_service_ids=[
            "srv-campelo-corte",
            "srv-campelo-barba",
            "srv-campelo-pigmentacao",
            "srv-campelo-sobrancelha",
            "srv-campelo-pezinho",
            "srv-campelo-completo"
        ],
        shifts=[StaffShift(day_of_week=i, start_time="10:00", end_time="20:00", lunch_start="13:00", lunch_end="14:00") for i in range(6)],
        blocked_slots=[]
    )
]


# ==============================================================================
# 6. Segredos do Corte (Jefferson Mendonça / Jefinho - Manaus/AM)
# ==============================================================================
TENANT_SEGREDOS = Tenant(
    id="tnt-segredos-do-corte",
    slug="segredos-do-corte",
    name="Segredos do Corte",
    slogan="A Arte do Degradê e Barboterapia de Alto Nível",
    description="Barbearia conceito comandada por Jefferson Mendonça (Jefinho). Especialistas em degradê na régua, barboterapia relaxante e cortes modernos.",
    category="barbearia",
    logo_url="/logos/logo_segredosdocorte.png",
    banner_url="https://placehold.co/1200x400/0f172a/38bdf8?text=Segredos+do+Corte",
    phone="(92) 98489-9955",
    whatsapp="5592984899955",
    email="sofiaheufrosina@gmail.com",
    address="Manaus - AM",
    instagram="@segredosdocorte_jefinho",
    features=["Ambiente Climatizado", "Wi-Fi de Alta Velocidade", "Café Cortesia", "Atendimento com Hora Marcada"],
    plan_name="Plano Enterprise Pro",
    trial_days_total=30,
    trial_days_remaining=30,
    trial_status="active",
    trial_ends_at="2026-09-16",
    monthly_revenue=0.00,
    pix_enabled=True,
    pix_mode="test_penny",
    pix_penny_price=0.01,
    theme=TenantTheme(
        primary_color="#38bdf8",
        secondary_color="#0f172a",
        accent_color="#0284c7",
        background_mode="dark",
        surface_glass_opacity=0.70,
        glow_color="rgba(56, 189, 248, 0.25)",
        font_heading="Outfit",
        font_body="Inter",
        badge_text="Barbearia Homologada Adminic"
    ),
    business_hours=BusinessHours(
        days_open=[0, 1, 2, 3, 4, 5],
        open_time="09:00",
        close_time="20:00",
        slot_interval_minutes=30,
        lunch_break_start="12:00",
        lunch_break_end="13:00"
    )
)

CATEGORIES_SEGREDOS = [
    ServiceCategory(id="cat-segredos-cortes", tenant_id="tnt-segredos-do-corte", name="Cortes e Estilos", icon="scissors", display_order=1),
    ServiceCategory(id="cat-segredos-barba", tenant_id="tnt-segredos-do-corte", name="Barboterapia e Cuidados", icon="sparkles", display_order=2),
]

SERVICES_SEGREDOS = [
    Service(
        id="srv-segredos-degrade",
        tenant_id="tnt-segredos-do-corte",
        category_id="cat-segredos-cortes",
        name="Corte Degradê na Régua",
        description="Degradê impecável (Skin Fade, Taper Fade ou Low Fade) com visagismo e finalização premium.",
        duration_minutes=35,
        price=35.00,
        image_url="/logos/logo_segredosdocorte.png",
        is_featured=True
    ),
    Service(
        id="srv-segredos-barba",
        tenant_id="tnt-segredos-do-corte",
        category_id="cat-segredos-barba",
        name="Barba Desenhada e Modelada",
        description="Barba desenhada com toalha quente, navalha descartável e hidratação com óleo essencial.",
        duration_minutes=25,
        price=20.00,
        image_url="/logos/logo_segredosdocorte.png",
        is_featured=True
    ),
    Service(
        id="srv-segredos-combo",
        tenant_id="tnt-segredos-do-corte",
        category_id="cat-segredos-cortes",
        name="Combo Cabelo + Barba + Sobrancelha",
        description="Visual completo e alinhado: corte estilizado, barboterapia e design de sobrancelha.",
        duration_minutes=55,
        price=55.00,
        image_url="/logos/logo_segredosdocorte.png",
        is_featured=True
    )
]

STAFF_SEGREDOS = [
    Staff(
        id="stf-jefferson-mendonca",
        tenant_id="tnt-segredos-do-corte",
        name="Jefferson Mendonça (Jefinho)",
        role="Master Barber e Fundador",
        bio="Especialista renomado em degradês e cortes de alta precisão. Criador da Segredos do Corte.",
        avatar_url="/logos/logo_segredosdocorte.png",
        phone="(92) 98489-9955",
        email="sofiaheufrosina@gmail.com",
        rating=5.0,
        total_reviews=0,
        specialty_service_ids=[
            "srv-segredos-degrade",
            "srv-segredos-barba",
            "srv-segredos-combo"
        ],
        shifts=[StaffShift(day_of_week=i, start_time="09:00", end_time="20:00", lunch_start="12:00", lunch_end="13:00") for i in range(6)],
        blocked_slots=[]
    )
]

ALL_SEED_TENANTS = [TENANT_CAMPELO, TENANT_SEGREDOS]
ALL_SEED_CATEGORIES = CATEGORIES_CAMPELO + CATEGORIES_SEGREDOS
ALL_SEED_SERVICES = SERVICES_CAMPELO + SERVICES_SEGREDOS
ALL_SEED_STAFF = STAFF_CAMPELO + STAFF_SEGREDOS

