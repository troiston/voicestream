import * as React from "react";

import { env } from "@/lib/env";
import { sendEmail, type SendEmailResult } from "@/lib/email/client";
import { VerifyEmailTemplate } from "@/lib/email/templates/verify-email";
import { ResetPasswordTemplate } from "@/lib/email/templates/reset-password";
import { WelcomeTemplate } from "@/lib/email/templates/welcome";
import { TeamInviteTemplate } from "@/lib/email/templates/team-invite";

export async function sendVerificationEmail(
  to: string,
  name: string | undefined,
  verifyUrl: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: "Confirma o teu email — VoiceStream",
    react: React.createElement(VerifyEmailTemplate, { name, verifyUrl }),
  });
}

export async function sendResetPasswordEmail(
  to: string,
  name: string | undefined,
  resetUrl: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: "Redefinir senha — VoiceStream",
    react: React.createElement(ResetPasswordTemplate, { name, resetUrl }),
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<SendEmailResult> {
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  return sendEmail({
    to,
    subject: `Bem-vindo ao VoiceStream, ${name}!`,
    react: React.createElement(WelcomeTemplate, { name, appUrl }),
  });
}

export async function sendTeamInviteEmail(
  to: string,
  inviterName: string,
  spaceName: string,
  acceptUrl: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: `${inviterName} convidou-te para "${spaceName}" — VoiceStream`,
    react: React.createElement(TeamInviteTemplate, { inviterName, spaceName, acceptUrl }),
  });
}
