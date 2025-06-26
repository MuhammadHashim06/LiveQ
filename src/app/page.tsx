// src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800">
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-600">LiveQ</h1>
        <p className="text-xl md:text-2xl mb-8">Book. Track. Arrive.</p>
        <div className="space-x-4">
          <a
            href="/login"
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
