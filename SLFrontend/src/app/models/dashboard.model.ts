// models/dashboard.model.ts
export interface DashboardStats {
    total_orders: number;
    monthly_completed: number;
    total_income: number;
  }
  
  export interface Job {
    id: number;
    title: string;
    date: string | Date;
    address: string;
    priority: 'Low' | 'Medium' | 'High';
  }
  
  export interface DashboardResponse {
    stats: DashboardStats;
    upcoming_jobs: Job[];
  }