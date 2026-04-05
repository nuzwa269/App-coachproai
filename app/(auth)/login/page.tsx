import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In — CoachPro AI",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1
          className="text-2xl font-bold text-[#111827]"
          style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
        >
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to your CoachPro AI account
        </p>
      </div>

      <LoginForm />
    </>
  );
}
