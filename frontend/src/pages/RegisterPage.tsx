import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Sword } from "lucide-react";
import toast from "react-hot-toast";

export function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
      });
      navigate("/");
      toast.success("Welcome to RPG Story Life!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
            <Sword size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold glow-text">Create Account</h1>
          <p className="text-gray-400 mt-2">Seu nick será o nome do seu personagem</p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nickname</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-rpg" placeholder="Seu nick (será o nome do personagem)" required />
            <p className="text-[11px] text-gray-500 mt-1">3-20 caracteres, apenas letras, números e _.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email (optional)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-rpg" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-rpg" placeholder="Min 6 characters" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-rpg" placeholder="Confirm password" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
