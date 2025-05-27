export enum WorkForceType {
  OFFICE_ADMIN = 'Office Admin',
  OPERATION_SUPERVISOR = 'Operation Supervisor',
  TEAM_LEAD = 'Team Lead',
  EMPLOYEE = 'Employee',
  PROFESSIONAL_HELPER = 'Professional Helper',
  GENERAL_HELPER = 'General Helper',
  EXPERT = 'Expert'
}
export enum ClientType {
  INDIVIDUAL = 'Individual',
  BUSINESS = 'Business'
}
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  username: string;
}

export interface Client extends User {
  clientType: ClientType;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

export interface Workforce extends User {
  phone: string;
  gender: Gender;  // ✅ Utilisation de l'énumération
  driverLicence?: string;
  driverLicenceExpiry?: string | null ;
  credentials?: string;
  credentialsExpiry?: string;
  training?: string;
  workForceType: WorkForceType;  // ✅ Utilisation de l'énumération
  dateOfBirth: string;
  socialSecurityNumber: string;
  skills?: string;
  address: string;
  workCategory: number[];  // IDs des catégories
  availability: any;
  hourlyRatebyService?: number;
  yearsOfExperience: string;
  resume:File | null;
}
