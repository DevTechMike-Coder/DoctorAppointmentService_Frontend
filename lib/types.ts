export type Role = "PATIENT" | "DOCTOR" | "ADMIN";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  role: Role;
}

/** Registration result: either a session, or a prompt to verify the email first. */
export interface RegisterResponse {
  verificationRequired: boolean;
  message: string;
  auth: AuthResponse | null;
}

export interface DoctorDto {
  id: number;
  userId: number;
  fullName: string;
  specialization: string;
  qualifications: string;
  bio: string;
  consultationFee: number;
  /** API-relative path (resolve with apiUrl); null when the doctor has no photo. */
  photoUrl: string | null;
}

/** Payload for PUT /doctors/profile — backend accepts a DoctorDto-shaped body. */
export interface UpdateDoctorProfileRequest {
  specialization: string;
  qualifications: string;
  bio: string;
  consultationFee: number;
  fullName?: string;
}

export interface AvailabilityDto {
  id: number;
  doctorId: number;
  doctorName: string;
  startTime: string; // ISO LocalDateTime, e.g. "2026-08-23T10:00:00"
  endTime: string;
  isBooked: boolean;
}

/** Matches backend CreateSlotRequest — one slot per request. */
export interface CreateSlotRequest {
  startTime: string;
  endTime: string;
}

/** Matches backend BookAppointmentRequest record: { slotId, reason }. */
export interface BookAppointmentRequest {
  slotId: number;
  reason?: string;
}

export interface AppointmentDto {
  id: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  createdAt: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}
