"use client";

import { useState, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle } from "lucide-react";

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  errors: Record<string, string>;
  message?: string;
};

const subjects = [
  { value: "suporte", label: "Suporte" },
  { value: "vendas", label: "Vendas" },
  { value: "imprensa", label: "Imprensa" },
  { value: "parcerias", label: "Parcerias" },
  { value: "outro", label: "Outro" },
];

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function ContactForm() {
  const [state, setState] = useState<FormState>({ status: "idle", errors: {} });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "suporte",
    message: "",
  });
  const nameRef = useRef<HTMLInputElement>(null);
  const formId = useId();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.subject) {
      newErrors.subject = "Assunto é obrigatório";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensagem é obrigatória";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Mensagem deve ter pelo menos 10 caracteres";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setState({ status: "error", errors });
      if (nameRef.current) {
        nameRef.current.focus();
      }
      return;
    }

    setState({ status: "loading", errors: {} });

    try {
      // Simular envio
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 5% chance de erro (mock)
      if (Math.random() < 0.05) {
        setState({
          status: "error",
          errors: {},
          message: "Serviço indisponível. Tente novamente em breve.",
        });
        return;
      }

      setState({ status: "success", errors: {} });
      setFormData({ name: "", email: "", subject: "suporte", message: "" });
    } catch {
      setState({
        status: "error",
        errors: {},
        message: "Erro ao enviar mensagem. Tente novamente.",
      });
    }
  };

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-md)] border border-border bg-surface-1/60 p-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-success" aria-hidden />
        </div>
        <h3 className="font-semibold text-foreground">Mensagem enviada!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Obrigado por entrar em contato. Responderemos assim que possível.
        </p>
        <Button
          onClick={() => setState({ status: "idle", errors: {} })}
          variant="outline"
          className="mt-4"
        >
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {state.status === "error" && state.message && (
        <Alert variant="danger">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao enviar</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className={state.status === "loading" ? "pointer-events-none opacity-60" : ""}>
        <Input
          ref={nameRef}
          id={`${formId}-name`}
          type="text"
          label="Nome completo"
          placeholder="João Silva"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={state.errors.name}
          disabled={state.status === "loading"}
          autoComplete="name"
          required
        />

        <Input
          id={`${formId}-email`}
          type="email"
          label="Email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={state.errors.email}
          disabled={state.status === "loading"}
          autoComplete="email"
          inputMode="email"
          required
          className="mt-4"
        />

        <div className="mt-4">
          <label htmlFor={`${formId}-subject`} className="text-sm font-medium leading-none text-foreground">
            Assunto
          </label>
          <select
            id={`${formId}-subject`}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            disabled={state.status === "loading"}
            className="mt-1.5 h-10 w-full min-w-0 rounded-[var(--radius-md)] border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {state.errors.subject && (
            <p className="mt-1 text-xs text-[var(--danger)]">{state.errors.subject}</p>
          )}
        </div>

        <Textarea
          id={`${formId}-message`}
          label="Mensagem"
          placeholder="Conte-nos mais sobre sua pergunta ou feedback..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          error={state.errors.message}
          disabled={state.status === "loading"}
          minLength={10}
          maxLength={5000}
          rows={5}
          required
          className="mt-4"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={state.status === "loading"}
          className="min-w-[120px]"
        >
          {state.status === "loading" ? (
            <>
              <Spinner label="" className="mr-2" />
              Enviando...
            </>
          ) : (
            "Enviar mensagem"
          )}
        </Button>
        {state.status === "loading" && (
          <span className="text-xs text-muted-foreground">Processando...</span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Responderemos por email no prazo de 24 horas. Nenhum spam, prometido.
      </p>
    </form>
  );
}
