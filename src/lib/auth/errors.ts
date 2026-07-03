/** Thrown when the user dismisses the native sign-in sheet — not an error state. */
export class SignInCancelledError extends Error {
  constructor() {
    super("Sign-in cancelled");
    this.name = "SignInCancelledError";
  }
}
