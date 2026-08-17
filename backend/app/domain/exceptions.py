class DomainException(Exception):
    """Base domain exception"""
    pass

class TenantNotFoundException(DomainException):
    def __init__(self, slug: str):
        super().__init__(f"Tenant with slug '{slug}' not found.")
        self.slug = slug

class ServiceNotFoundException(DomainException):
    def __init__(self, service_id: str):
        super().__init__(f"Service with id '{service_id}' not found.")
        self.service_id = service_id

class StaffNotFoundException(DomainException):
    def __init__(self, staff_id: str):
        super().__init__(f"Staff member with id '{staff_id}' not found.")
        self.staff_id = staff_id

class StaffNotQualifiedException(DomainException):
    def __init__(self, staff_id: str, service_id: str):
        super().__init__(f"Staff '{staff_id}' is not qualified for service '{service_id}'.")
        self.staff_id = staff_id
        self.service_id = service_id

class SlotUnavailableException(DomainException):
    def __init__(self, time_slot: str, reason: str = "Slot is already booked or outside working hours."):
        super().__init__(f"Time slot '{time_slot}' is not available: {reason}")
        self.time_slot = time_slot
        self.reason = reason

class AppointmentNotFoundException(DomainException):
    def __init__(self, code: str):
        super().__init__(f"Appointment with code/id '{code}' not found.")
        self.code = code
