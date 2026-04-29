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

export interface VerifyEmailProps {
  name?: string;
  verifyUrl: string;
}

export function VerifyEmailTemplate({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Confirma o teu email no VoiceStream</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>VoiceStream</Text>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.h1}>Confirma o teu email</Heading>
            <Text style={styles.text}>
              {name ? `Olá, ${name}!` : "Olá!"} Obrigado por se registar no VoiceStream. Para
              ativar a tua conta, clica no botão abaixo para confirmar o teu endereço de email.
            </Text>
            <Button style={styles.button} href={verifyUrl}>
              Confirmar email
            </Button>
            <Text style={styles.hint}>
              Se não te registaste no VoiceStream, ignora este email.
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
  hint: {
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

export default VerifyEmailTemplate;
