// src/api/adminUsersApi.ts

import { backendGet } from "../Springboot/backendClient";
import type { AdminUserEntityDto,PageResponse,UserSearchBy } from "../../admin/models/AdminResponseUser";

// Αν στο backend έχεις @RequestMapping("/api/admin"), τότε το path θα είναι "/api/admin/users"
// Αν είναι κάπως αλλιώς, άλλαξε το ADMIN_USERS_PATH να ταιριάζει στο controller σου.
const ADMIN_USERS_PATH = "/api/admin/users";
const ADMIN_BASE_PATH = "/api/admin";


export function getAdminUsers(
  page = 0,
  size = 20,
  search?: string,
  searchBy: UserSearchBy = "id"
): Promise<PageResponse<AdminUserEntityDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (search && search.trim() !== "") {
    params.set("search", search.trim());
  }
  if (searchBy) {
    params.set("searchBy", searchBy);
  }

  return backendGet<PageResponse<AdminUserEntityDto>>(
    `${ADMIN_BASE_PATH}/users?${params.toString()}`
  );
}


// getUser by firebaseId
export function getAdminUser(firebaseId: string): Promise<AdminUserEntityDto> {
  return backendGet<AdminUserEntityDto>(`${ADMIN_USERS_PATH}/${firebaseId}`);
}



export function getAdminUserByUsername(username: string): Promise<AdminUserEntityDto> {
  return backendGet<AdminUserEntityDto>(`${ADMIN_USERS_PATH}/username/${encodeURIComponent(username)}`);
}


// // παίρνουμε user με βάση το username
// export function getAdminUserByUsername(
//   username: string
// ): Promise<AdminUserEntityDto> {
//   return backendGet<AdminUserEntityDto>(
//     `${ADMIN_BASE_PATH}/users/${encodeURIComponent(username)}`
//   );
// }

import type { UserEntityUpdateAdmin } from "../../admin/models/AdminResponseUser";
import { backendPut } from "../Springboot/backendClient";


// PUT /api/admin/editUser/{firebaseId}
export function updateAdminUser(
  firebaseId: string,
  body: UserEntityUpdateAdmin
): Promise<AdminUserEntityDto> {
  return backendPut<AdminUserEntityDto, UserEntityUpdateAdmin>(
    `${ADMIN_BASE_PATH}/editUser/${firebaseId}`,
    body
  );
}