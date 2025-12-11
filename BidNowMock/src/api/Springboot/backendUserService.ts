// // src/api/Springboot/backendUserService.ts
// import type { ProfileUserEntity, SignUpRequest } from "../../models/Springboot/UserEntity";
// import { getFirebaseAuthToken } from "./backendClient";
// import { backendGet } from "./backendClient";

// const BACKEND_BASE_URL =
//   import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";


// type UsernameAvailabilityResponse = {
//   available: boolean;
// };


// export async function checkUsernameAvailable(
//   username: string
// ): Promise<boolean> {
//   const res = await fetch(
//     `${BACKEND_BASE_URL}/api/auth/username-availability?username=${encodeURIComponent(
//       username
//     )}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         // ΠΡΟΣΟΧΗ: ΔΕΝ βάζουμε Authorization εδώ
//       },
//     }
//   );

//   if (!res.ok) {
//     throw new Error(`HTTP ${res.status}`);
//   }

//   const data = (await res.json()) as UsernameAvailabilityResponse;
//   return data.available;
// }

// type BackendErrorBody = {
//   message?: string;
// };

// export async function sendSignUpRequest(
//   request: SignUpRequest
// ): Promise<void> {

//   const token = getFirebaseAuthToken();
  
//     if (!token) {
//     throw new Error("No Firebase token available. User is not authenticated.");
//   }

//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`, // 👈 ΕΔΩ μπαίνει το token
//   };

//   const res = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(request),
//   });

//   if (!res.ok) {
//     let message = `HTTP ${res.status}`;

//     try {
//       const data = (await res.json()) as BackendErrorBody;
//       if (data.message) {
//         message = data.message;
//       }
//     } catch {
//       // ignore JSON parse error
//     }

//     throw new Error(message);
//   }
// }


// ////////////// SIGN IN ///////////////

// // src/api/Springboot/authService.ts
// import { backendPost } from "./backendClient";

// export async function callBackendLogin(): Promise<void> {
//   // Δεν στέλνουμε body, μόνο το JWT στο Authorization header
//   await backendPost<void, undefined>("/api/auth/login");
// }




// ////////////// SIGN OUT ///////////////
// import { signOutFirebase } from "./backendClient";


// export function logout(): void {
//   // εδώ απλά καλείς τη χαμηλού επιπέδου λογική
//   signOutFirebase();
// }






// ////////////// GET USER PROFILE ///////////////

// export async function fetchUserProfile(): Promise<ProfileUserEntity> {
//   return backendGet<ProfileUserEntity>("/api/auth/profile");
// }


// ////////////// UDATE USER PROFILE ///////////////

// import { backendPatch } from "./backendClient";

// import type {
//   Avatar,
//   LocationDto,
// } from "../../models/Springboot/UserEntity";


// // Ρόλος όπως τον χειριζόμαστε στο frontend
// export type RoleName = "Bidder" | "Auctioneer";

// // 🔹 UPDATE AVATAR
// export async function updateAvatar(avatar: Avatar): Promise<void> {
//   await backendPatch<unknown, Avatar>("/api/auth/updateAvatar", avatar);
// }

// // 🔹 UPDATE USERNAME

// export async function updateUsername(newUsername: string): Promise<void> {
//   return backendPatch<void, { name: string }>(
//     "/api/auth/updateUsername",
//     { name: newUsername }
//   );
// }


// // 🔹 UPDATE LOCATION
// export async function updateLocation(location: LocationDto): Promise<void> {
//   await backendPatch<void, LocationDto>("/api/auth/updateLocation", location);
// }

// // 🔹 UPDATE ROLE

// export async function updateRole(roleName: RoleName): Promise<void> {
//   return backendPatch<void, { name: RoleName }>(
//     "/api/auth/updateRole",
//     { name: roleName }
//   );
// }

// src/api/Springboot/backendUserService.ts

import {
  backendGet,
  backendPatch,
  getFirebaseAuthToken,
  signOutFirebase,
} from "./backendClient";
import type {
  ProfileUserEntity,
  SignUpRequest,
  Avatar,
  LocationDto,
  RoleApiName,
  AuthUserDto,
} from "../../models/Springboot/UserEntity";


const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";

type UsernameAvailabilityResponse = {
  available: boolean;
};

type BackendErrorBody = {
  message?: string;
};

//////////////////// USERNAME AVAILABILITY ////////////////////

export async function checkUsernameAvailable(
  username: string
): Promise<boolean> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/api/auth/username-availability?username=${encodeURIComponent(
      username
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // ΠΡΟΣΟΧΗ: ΔΕΝ βάζουμε Authorization εδώ
      },
    }
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as UsernameAvailabilityResponse;
  return data.available;
}

//////////////////// SIGNUP ////////////////////

export async function sendSignUpRequest(
  request: SignUpRequest
): Promise<AuthUserDto> {
  const token = getFirebaseAuthToken();

  if (!token) {
    throw new Error("No Firebase token available. User is not authenticated.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;

    try {
      const data = (await res.json()) as BackendErrorBody;
      if (data.message) {
        message = data.message;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  const data = (await res.json()) as AuthUserDto;
  return data;
}


// export async function sendSignUpRequest(
//   request: SignUpRequest
// ): Promise<void> {
//   const token = getFirebaseAuthToken();

//   if (!token) {
//     throw new Error("No Firebase token available. User is not authenticated.");
//   }

//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`, // 👈 ΕΔΩ μπαίνει το token
//   };

//   const res = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(request),
//   });

//   if (!res.ok) {
//     let message = `HTTP ${res.status}`;

//     try {
//       const data = (await res.json()) as BackendErrorBody;
//       if (data.message) {
//         message = data.message;
//       }
//     } catch {
//       // ignore JSON parse error
//     }

//     throw new Error(message);
//   }
// }

//////////////////// SIGN IN ////////////////////

export async function callBackendLogin(): Promise<AuthUserDto> {
  return backendGet<AuthUserDto>("/api/auth/login");
}


//////////////////// SIGN OUT ////////////////////

export function logout(): void {
  // εδώ απλά καλείς τη χαμηλού επιπέδου λογική
  signOutFirebase();
}

//////////////////// GET USER PROFILE ////////////////////

export async function fetchUserProfile(): Promise<ProfileUserEntity> {
  return backendGet<ProfileUserEntity>("/api/auth/profile");
}

//////////////////// UPDATE USER PROFILE ////////////////////

// 🔹 UPDATE AVATAR
export async function updateAvatar(avatar: Avatar): Promise<void> {
  await backendPatch<unknown, Avatar>("/api/auth/updateAvatar", avatar);
}

// 🔹 UPDATE USERNAME
export async function updateUsername(newUsername: string): Promise<void> {
  return backendPatch<void, { name: string }>("/api/auth/updateUsername", {
    name: newUsername,
  });
}

// 🔹 UPDATE LOCATION
export async function updateLocation(location: LocationDto): Promise<void> {
  await backendPatch<void, LocationDto>("/api/auth/updateLocation", location);
}

// 🔹 UPDATE ROLE (API enum: RoleApiName)
export async function updateRole(roleName: RoleApiName): Promise<void> {
  return backendPatch<void, { name: RoleApiName }>("/api/auth/updateRole", {
    name: roleName,
  });
}




type UserAvailabilityResponse = {
  response: string;
};

export async function checkUserAvailability(
  email: string,
  phoneNumber: string
): Promise<UserAvailabilityResponse> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/api/auth/user-availability`,
    {
      method: "POST", // ή "GET" αν έτσι είναι στο backend, αλλά ιδανικά POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, phoneNumber }),
    }
  );

  const data = (await res.json()) as UserAvailabilityResponse;

  if (!res.ok) {
    // Χρησιμοποιούμε το μήνυμα του backend για να το δείξουμε αυτούσιο
    throw new Error(data.response ?? `HTTP ${res.status}`);
  }

  return data;
} 



//////////////////// DELETE / ANONYMIZE USER ////////////////////

import { backendDelete } from "./backendClient";
/**
 * Καλεί το DELETE /api/auth/deleteUser
 * Στο backend κάνεις anonymizeUser().
 */
export async function deleteUserAccount(): Promise<void> {
  await backendDelete<void>("/api/auth/deleteUser");
}