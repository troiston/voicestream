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

export interface TeamInviteProps {
  inviterName: string;
  spaceName: string;
  acceptUrl: string;
}

export function TeamInviteTemplate({ inviterName, spaceName, acceptUrl }: TeamInviteProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>
        {inviterName} convidou-te para colaborar em &quot;{spaceName}&quot; no VoiceStream
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>VoiceStream</Text>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.h1}>Tens um convite!</Heading>
            <Text style={styles.text}>
              <strong>{inviterName}</strong> convidou-te para colaborar no espaço{" "}
              <strong>&quot;{spaceName}&quot;</strong> no VoiceStream.
            </Text>
            <Text style={styles.text}>
              Aceita o convite para começares a colaborar com a equipa, partilhar transcrições de
              voz e gerir projetos juntos.
            </Text>
            <Button style={styles.button} href={acceptUrl}>
              Aceitar convite
            </Button>
            <Text style={styles.hint}>
              Se não esperavas este convite, podes ignorar este email em segurança.
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
    margin: "0 0 16px",
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
    margin: "24px 0",
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

export default TeamInviteTemplate;
