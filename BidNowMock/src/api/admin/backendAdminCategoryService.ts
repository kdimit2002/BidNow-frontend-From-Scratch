// src/api/Springboot/backendAdminCategoryService.ts
import { backendPost,backendPut,backendDelete } from "../Springboot/backendClient";

export interface CategoryDto {
  id: number;
  name: string;
}

/**
 * Δημιουργία κατηγορίας (ADMIN).
 * Στέλνουμε απλό string στο body, π.χ. "Electronics"
 * και backend επιστρέφει το όνομα που δημιουργήθηκε.
 */
export async function adminCreateCategory(name: string): Promise<CategoryDto> {
  return backendPost<CategoryDto, string>(
    "/api/admin/categories/createCategory",
    name
  );
}

/**
 * Update κατηγορίας με id (ADMIN).
 * Στέλνουμε το νέο όνομα ως string στο body.
 */
export async function adminUpdateCategory(
  id: number,
  name: string
): Promise<string> {
  return backendPut<string, string>(
    `/api/admin/categories/updateCategory/${id}`,
    name
  );
}

/**
 * Διαγραφή κατηγορίας με id (ADMIN).
 */
export async function adminDeleteCategory(id: number): Promise<void> {
  await backendDelete<void>(`/api/admin/categories/deleteCategory/${id}`);
}
