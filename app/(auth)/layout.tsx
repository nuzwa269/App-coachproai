import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
      {/* Brand Logo */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#FF8A00] flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">C</span>
          </div>
          <span
            className="text-2xl font-bold text-[#111827]"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            CoachPro <span className="text-[#FF8A00]">AI</span>
          </span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-gray-400">
        © {new Date().getFullYear()} CoachPro AI. All rights reserved.
      </p>
    </div>
  );
}
