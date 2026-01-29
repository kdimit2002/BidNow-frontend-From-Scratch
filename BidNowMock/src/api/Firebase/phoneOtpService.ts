import {
  RecaptchaVerifier,
  linkWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { auth } from "../../config/firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function ensureRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });

  return recaptchaVerifier;
}

export async function sendOtpAndGetConfirmation(params: {
  user: User;
  phoneNumber: string;
  recaptchaContainerId: string;
}): Promise<ConfirmationResult> {
  const verifier = ensureRecaptchaVerifier(params.recaptchaContainerId);
  return linkWithPhoneNumber(params.user, params.phoneNumber, verifier);
}

export async function confirmOtp(params: {
  confirmation: ConfirmationResult;
  code: string;
}): Promise<User> {
  const res = await params.confirmation.confirm(params.code);
  return res.user;
}


export function clearRecaptchaVerifier() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}
