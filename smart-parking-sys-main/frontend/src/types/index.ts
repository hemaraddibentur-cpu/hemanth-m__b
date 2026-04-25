export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  department?: string;
  employeeId?: string;
  rfidTag?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { vehicles: number; bookings: number; violations?: number };
}

export type Role = 'ADMIN' | 'SECURITY' | 'FACULTY' | 'STAFF' | 'STUDENT' | 'VISITOR';

export interface Vehicle {
  id: string;
  userId: string;
  licensePlate: string;
  vehicleType: VehicleType;
  make?: string;
  model?: string;
  color?: string;
  rfidSticker?: string;
  isActive: boolean;
  createdAt: string;
}

export type VehicleType = 'CAR' | 'BIKE' | 'TRUCK' | 'SUV' | 'VAN';

export interface ParkingZone {
  id: string;
  name: string;
  description?: string;
  totalSlots: number;
  hourlyRate: number;
  dailyRate?: number;
  monthlyRate?: number;
  rules?: string;
  latitude?: number;
  longitude?: number;
  color: string;
  isActive: boolean;
}

export interface ParkingSlot {
  id: string;
  zoneId: string;
  slotNumber: string;
  slotType: SlotType;
  floor: number;
  isOccupied: boolean;
  isReserved: boolean;
  isActive: boolean;
  posX?: number;
  posY?: number;
  zone?: ParkingZone;
  bookings?: Booking[];
  isAvailable?: boolean;
}

export type SlotType = 'REGULAR' | 'HANDICAPPED' | 'EV_CHARGING' | 'RESERVED_FACULTY' | 'COMPACT' | 'LARGE';

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  qrCode?: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  slot?: ParkingSlot & { zone?: ParkingZone };
  vehicle?: Vehicle;
  payments?: Payment[];
  entryLogs?: EntryLog[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'WAITLISTED';

export interface EntryLog {
  id: string;
  bookingId: string;
  vehicleId: string;
  entryTime: string;
  entryGate?: string;
  verificationMethod?: string;
  licensePlateCaptured?: string;
  exitLog?: ExitLog;
}

export interface ExitLog {
  id: string;
  entryLogId: string;
  exitTime: string;
  exitGate?: string;
  duration: number;
  amountPaid: number;
  paymentStatus: string;
}

export interface Violation {
  id: string;
  userId: string;
  vehicleId: string;
  type: ViolationType;
  description?: string;
  fineAmount: number;
  status: ViolationStatus;
  evidence?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  vehicle?: Pick<Vehicle, 'licensePlate' | 'vehicleType'>;
}

export type ViolationType = 'OVERSTAY' | 'WRONG_ZONE' | 'UNAUTHORIZED' | 'NO_BOOKING' | 'EXPIRED_PASS' | 'DOUBLE_PARKING';
export type ViolationStatus = 'OPEN' | 'FINE_ISSUED' | 'PAID' | 'DISPUTED' | 'RESOLVED';

export interface Payment {
  id: string;
  bookingId?: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
  booking?: Booking;
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET' | 'NET_BANKING' | 'CASH';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Pass {
  id: string;
  userId: string;
  passType: 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'ANNUAL';
  startDate: string;
  endDate: string;
  price: number;
  isActive: boolean;
}

export interface ZoneStatus {
  zone: Pick<ParkingZone, 'id' | 'name' | 'color' | 'hourlyRate'>;
  totalSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  availableSlots: number;
  occupancyRate: string;
  slots: ParkingSlot[];
}

export interface DashboardStats {
  users: { total: number };
  vehicles: { total: number };
  bookings: { total: number; today: number; active: number };
  revenue: { total: number; today: number };
  violations: { total: number; open: number };
  parking: { totalSlots: number; occupiedSlots: number; availableSlots: number; occupancyRate: string };
  zones: Array<{ id: string; name: string; totalSlots: number; occupied: number; available: number }>;
}

export interface UsageAnalytics {
  daily: Array<{ date: string; bookings: number; cancellations: number }>;
  byZone: Array<{ name: string; bookings: number }>;
  peakHours: Array<{ hour: number; label: string; occupancy: number }>;
  summary: { totalBookings: number; avgDaily: string; cancellationRate: string };
}

export interface RevenueAnalytics {
  daily: Array<{ date: string; amount: number }>;
  byMethod: Array<{ method: string; amount: number }>;
  summary: { totalRevenue: number; avgDaily: string; totalTransactions: number };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
