import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface ResetPasswordProps {
  name?: string;
  resetUrl: string;
}

export function ResetPasswordTemplate({ name, resetUrl }: ResetPasswordProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Redefinir a tua senha no VoiceStream</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>VoiceStream</Text>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.h1}>Redefinir senha</Heading>
            <Text style={styles.text}>
              {name ? `Olá, ${name}!` : "Olá!"} Recebemos um pedido para redefinir a senha da tua
              conta VoiceStream. Clica no botão abaixo para criar uma nova senha.
            </Text>
            <Button style={styles.button} href={resetUrl}>
              Redefinir senha
            </Button>
            <Text style={styles.warning}>
              Este link expira em 1 hora. Se não solicitaste a redefinição de senha, ignora este
              email — a tua senha permanece inalterada.
            </Text>
          </Section>
          <Hr style={styles.hr} />
          <Section>
            <Text style={styles.footer}>
              Precisas de ajuda?{" "}
              <Link href="mailto:suporte@voicestream.com.br" style={styles.link}>
                Entra em contacto
              </Link>
              . © {new Date().getFullYear()} VoiceStream. Todos os direitos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f6f6",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "40px auto",
    maxWidth: "480px",
    borderRadius: "8px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#7c3aed",
    padding: "24px 32px",
  },
  brand: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0",
  },
  content: {
    padding: "32px",
  },
  h1: {
    color: "#111827",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 16px",
  },
  text: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: "6px",
    color: "#ffffff",
    display: "block",
    fontSize: "15px",
    fontWeight: "600",
    padding: "12px 24px",
    textDecoration: "none",
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
  warning: {
    color: "#6b7280",
    fontSize: "13px",
    margin: "0",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "0 32px",
  },
  footer: {
    color: "#9ca3af",
    fontSize: "12px",
    padding: "16px 32px",
    textAlign: "center" as const,
  },
  link: {
    color: "#7c3aed",
  },
};

export default ResetPasswordTemplate;
