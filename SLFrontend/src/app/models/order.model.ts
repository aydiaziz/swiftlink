export enum JobStatus {
    PENDING = 'Pending',
    BOOKED = 'Booked',
    COMPLETED = 'Completed',
    CANCELED = 'Canceled'
  }
  
  export enum PriorityLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High'
  }
  
  export interface Order {
    orderID: number;
    entityID: number;
    clientID: number;
    division: 'PROS' | 'Helper';
    jobTitle?: string;
    jobStatus: JobStatus;
    jobAddress?: string;
    priorityLevel: PriorityLevel;
    serviceType: string;
    creationDate: string;
    executionDate?: string;
    assignedTo?: any; 
    orderDuration?: string; 
    expirationTime?: string;
    expressedInterest: number[];
    manpower?: number;
    jobResources?: string;
    clientName?: string;
    clientPhone?: string;
  }
