// src/api/admin/UserStats.ts
import { backendGet } from "../Springboot/backendClient";
import type { MonthlyDailyActiveUsersDto } from "../../admin/models/UserStats";

// καλεί το @GetMapping("/active-users/all-months")
// με class-level @RequestMapping("/api/admin")
export async function getDailyActiveUsersAllMonths(): Promise<MonthlyDailyActiveUsersDto[]> {
  return backendGet<MonthlyDailyActiveUsersDto[]>(
    "/api/admin/active-users/all-months"
  );
}
