"use client";

import { useRef, useState } from "react";
import { Camera, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateProfile } from "@/features/profile/actions";

interface User {
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  phone: string | null;
}

interface ProfileSectionProps {
  user: User;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    toast.success("Foto de perfil atualizada!");
  };

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        name: displayName,
        bio: bio || null,
        phone: phone || null,
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil. Tente novamente.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Perfil</h2>
        <CardDescription>Nome visível, email, telefone e biografia.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Dropzone */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Avatar</label>
          <button
            type="button"
            className="relative h-20 w-20 cursor-pointer group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Alterar foto de perfil"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-brand/15 flex items-center justify-center text-2xl font-bold text-brand">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-hidden
              onChange={handleAvatarChange}
            />
          </button>
          <p className="text-xs text-muted-foreground">Clique para atualizar imagem de perfil</p>
        </div>

        {/* Nome */}
        <Input
          id="settings-display-name"
          label="Nome completo"
          name="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        {/* Email - ReadOnly */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <input
              id="settings-email"
              type="email"
              value={user.email}
              readOnly
              className={cn(
                "h-10 w-full min-w-0 rounded-[var(--radius-md)] border border-input bg-muted/50 px-3 py-2 text-sm transition-colors outline-none",
                "placeholder:text-muted-foreground",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <p className="text-xs text-muted-foreground">
            Alteração de email virá com fluxo de verificação.
          </p>
        </div>

        {/* Telefone - Opcional */}
        <Input
          id="settings-phone"
          label="Telefone (opcional)"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          hint="Para contactos de recuperação de conta"
        />

        {/* Bio */}
        <Textarea
          id="settings-bio"
          label="Bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Conte-nos um pouco sobre si..."
          hint="Visível no seu perfil público (máx. 160 caracteres)"
          className="min-h-24"
        />

        {/* Botão Salvar */}
        <div className="pt-4 border-t border-border/60">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className="w-full sm:w-auto"
          >
            Salvar alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
