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

export interface WelcomeProps {
  name: string;
  appUrl: string;
}

export function WelcomeTemplate({ name, appUrl }: WelcomeProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Bem-vindo ao VoiceStream, {name}!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>VoiceStream</Text>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.h1}>Bem-vindo, {name}!</Heading>
            <Text style={styles.text}>
              Estamos muito contentes por teres juntado ao VoiceStream. Aqui ficam alguns primeiros
              passos para tirares o máximo partido da plataforma:
            </Text>
            <Text style={styles.tip}>
              <strong>1. Cria o teu primeiro espaço</strong>
              <br />
              Organiza os teus projetos em espaços dedicados para manter tudo estruturado.
            </Text>
            <Text style={styles.tip}>
              <strong>2. Convida a tua equipa</strong>
              <br />
              Colabora em tempo real — adiciona membros ao teu espaço e trabalhem juntos.
            </Text>
            <Text style={styles.tip}>
              <strong>3. Explora as transcrições de voz</strong>
              <br />
              Grava reuniões e converte áudio em texto com um clique.
            </Text>
            <Button style={styles.button} href={appUrl}>
              Ir para a app
            </Button>
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
    margin: "0 0 20px",
  },
  tip: {
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 16px",
    paddingLeft: "12px",
    borderLeft: "3px solid #7c3aed",
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
    margin: "24px 0 0",
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

export default WelcomeTemplate;
