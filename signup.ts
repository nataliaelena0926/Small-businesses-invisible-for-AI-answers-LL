export const MIN_PASSWORD_LENGTH = 6;

export function isSignupPasswordValid(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function signupOutcome(session: unknown) {
  return session ? "signed-in" : "confirmation-required";
}