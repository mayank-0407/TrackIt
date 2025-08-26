import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      {/* App Logo / Name */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">💰 TrackIt</h1>
        <p className="text-lg text-gray-700">
          Manage your finances effortlessly. Track your income, expenses, and
          accounts all in one place.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/login">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium shadow hover:bg-green-700 transition">
            Signup
          </button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-gray-500 text-sm text-center">
        &copy; {new Date().getFullYear()} TrackIt. All rights reserved.
      </footer>
    </div>
  );
}
