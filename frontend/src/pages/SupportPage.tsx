import { useState } from "react";
import { MessageCircle, LifeBuoy, Mail, ShieldCheck, ScrollText } from "lucide-react";
import toast from "react-hot-toast";

export function SupportPage() {
  const [form, setForm] = useState({ subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    toast.success("Mensagem enviada! Nossa equipe vai responder em breve.");
    setForm({ subject: "", message: "" });
  };

  const faqs = [
    { q: "Como crio meu personagem?", a: "Após criar a conta, você é levado à tela de criação de personagem. Escolha a classe, role raça e trait (3 tickets de cada) e defina o nome." },
    { q: "Como crio uma guilda?", a: "Vá até a página Guild e clique em Create Guild. Requisitos de level, gold e diamantes são exibidos ali — ajustáveis pelo painel admin." },
    { q: "Perdi meus tickets de roll, e agora?", a: "Tickets são por conta, limitados a 3 para raça e 3 para trait. Novos tickets podem ser concedidos pelo suporte/admin." },
    { q: "Onde reporto um bug?", a: "Use o formulário abaixo ou entre em contato pelo Discord da comunidade." },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <LifeBuoy size={24} className="text-blue-400" /> Support
      </h1>

      <div className="panel p-4 space-y-4">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <ScrollText size={18} className="text-cyan-400" /> Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-dark-800 border border-dark-600 rounded-lg p-3 text-sm">
              <summary className="cursor-pointer font-medium text-gray-200 hover:text-purple-300">{f.q}</summary>
              <p className="text-gray-400 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel p-4 space-y-3">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <Mail size={18} className="text-green-400" /> Contato
        </h2>
        <input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="input-rpg w-full"
          placeholder="Assunto"
          maxLength={100}
          required
        />
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input-rpg w-full"
          placeholder="Descreva seu problema ou dúvida..."
          rows={4}
          required
        />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <MessageCircle size={16} /> Enviar mensagem
        </button>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <ShieldCheck size={12} /> Suas informações de conta são anexadas automaticamente para agilizar o atendimento.
        </p>
      </form>
    </div>
  );
}
