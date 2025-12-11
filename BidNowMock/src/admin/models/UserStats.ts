// src/admin/models/UserStats.ts

export interface DailyActiveUsersDto {
  dayOfMonth: number;
  activeUsers: number;
}

export interface MonthlyDailyActiveUsersDto {
  year: number;
  month: number; // 1-12
  days: DailyActiveUsersDto[];
}
