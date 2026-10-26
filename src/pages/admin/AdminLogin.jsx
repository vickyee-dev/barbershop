import { useState } from "react";
import { config } from "../../config";
import Button from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import Link from "../../components/ui/Link";
import { PoleMark } from "../../components/ui/Icons";
import { useStore } from "../../state/context";

export default function AdminLogin() {
  const { loginAdmin } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!loginAdmin(email, password)) setError("That email and password don't match.");
  };

  return (
    <main className="flex min-h-screen flex-col bg-ink-900">
      <div className="pole-stripe h-1.5" aria-hidden="true" />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 text-white">
            <PoleMark className="size-10" />
            <h1 className="font-display text-4xl font-extrabold tracking-wide">{config.shop.name} staff</h1>
          </div>
          <form onSubmit={submit} className="space-y-4 rounded-lg bg-white p-6 shadow-2xl" noValidate>
            <TextField
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              required
            />
            <Button type="submit" size="lg" className="w-full">
              Log in
            </Button>
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">Demo login</p>
              <p>
                {config.admin.email} / {config.admin.password}
              </p>
            </div>
          </form>
          <Link to="/" className="mt-5 inline-block text-sm text-ink-300 underline underline-offset-4 hover:text-white">
            Back to the shop site
          </Link>
        </div>
      </div>
    </main>
  );
}
