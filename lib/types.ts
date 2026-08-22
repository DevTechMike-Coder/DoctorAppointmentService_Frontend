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

export interface DoctorDto {
  id: number;
  fullName: string;
  specialization: string;
  qualifications: string;
  bio: string;
  consultationFee: number;
}

export interface AvailabilityDto {
  slotId: number;
  doctorId: number;
  startTime: string; // ISO
  endTime: string;
  isBooked: boolean;
}

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