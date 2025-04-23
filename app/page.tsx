import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-800">
            Victoria University Assistant
          </h1>
          <p className="mt-2 text-gray-600">Your AI-powered university guide</p>
        </div>
        <div className="flex flex-col space-y-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
