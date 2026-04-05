import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create Account — CoachPro AI",
};

export default function SignupPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1
          className="text-2xl font-bold text-[#111827]"
          style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
        >
          Create your account
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Start building smarter with AI-powered development coaching.
        </p>
      </div>

      <SignupForm />
    </>
  );
}
