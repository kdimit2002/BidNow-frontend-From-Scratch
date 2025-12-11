// src/api/Springboot/backendCategoryService.ts
import {
  backendGet,
  backendPost,
  backendPut,
  backendDelete,
} from "./backendClient";

export interface CategoryDto {
  id: number;
  name: string;
}

// Όλες οι κατηγορίες (για dropdown κλπ)
export async function getCategories(): Promise<CategoryDto[]> {
  return backendGet<CategoryDto[]>("/api/categories");
}

// CREATE (admin)
export async function adminCreateCategory(name: string): Promise<CategoryDto> {
  return backendPost<CategoryDto, string>(
    "/api/admin/categories/createCategory",
    name
  );
}

// UPDATE (admin)
export async function adminUpdateCategory(
  id: number,
  name: string
): Promise<CategoryDto> {
  return backendPut<CategoryDto, string>(
    `/api/admin/categories/updateCategory/${id}`,
    name
  );
}

// DELETE (admin)
export async function adminDeleteCategory(id: number): Promise<void> {
  return backendDelete<void>(`/api/admin/categories/deleteCategory/${id}`);
}
