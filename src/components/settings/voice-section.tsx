"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function VoiceSection() {
  const [language, setLanguage] = useState("pt-BR");
  const [confidence, setConfidence] = useState(75);
  const [autoPunctuation, setAutoPunctuation] = useState(true);
  const [diarization, setDiarization] = useState(false);
  const [noiseCancel, setNoiseCancel] = useState(true);

  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Voz e STT</h2>
        <CardDescription>Modelo de transcrição, idioma e sensibilidade (mock).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Idioma Select */}
        <div className="space-y-2">
          <Label htmlFor="voice-language" className="text-sm font-medium text-foreground">
            Idioma de transcrição
          </Label>
          <Select value={language} onValueChange={(value: string | null) => {
            if (value) setLanguage(value);
          }}>
            <SelectTrigger id="voice-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-confidence" className="text-sm font-medium text-foreground">
              Limiar de confiança
            </Label>
            <span className="text-sm font-semibold text-brand">{confidence}%</span>
          </div>
          <Slider
            id="voice-confidence"
            value={[confidence]}
            onValueChange={(val) => {
              const first = Array.isArray(val) ? val[0] : val;
              setConfidence(typeof first === "number" ? first : 75);
            }}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Transcrições abaixo deste limiar serão marcadas como incertas
          </p>
        </div>

        {/* Switches com helper text */}
        <div className="space-y-0 border-t border-border/60">
          {/* Auto Punctuation */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Pontuação automática</p>
              <p className="text-xs text-muted-foreground">Adiciona vírgulas e pontos automaticamente</p>
            </div>
            <Switch
              checked={autoPunctuation}
              onCheckedChange={setAutoPunctuation}
              className="shrink-0 ml-4"
            />
          </div>

          <div className="border-b border-border/60" />

          {/* Diarization */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Diarização de falantes</p>
              <p className="text-xs text-muted-foreground">Identifica e separa diferentes falantes</p>
            </div>
            <Switch
              checked={diarization}
              onCheckedChange={setDiarization}
              className="shrink-0 ml-4"
            />
          </div>

          <div className="border-b border-border/60" />

          {/* Noise Cancellation */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Cancelamento de ruído</p>
              <p className="text-xs text-muted-foreground">Remove ruídos de fundo da gravação</p>
            </div>
            <Switch
              checked={noiseCancel}
              onCheckedChange={setNoiseCancel}
              className="shrink-0 ml-4"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          P95 de latência e políticas de buffer estão no PRD; esta UI prepara o contrato de configuração.
        </p>
      </CardContent>
    </Card>
  );
}
