export interface SignUpResponse {
  idToken: string;
  email: string;
  localId: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SendVerificationCodeResponse {
  sessionInfo: string;
}

export interface SignInWithPhoneNumberResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  phoneNumber?: string;
}

export interface UpdateAccountResponse {
  idToken: string;
  email: string;
  localId: string;
  refreshToken: string;
  expiresIn: string;
}


// κάπου δίπλα στα άλλα interfaces Firebase
export interface SignInWithPasswordResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered: boolean;
}

