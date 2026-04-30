import { Email } from "@convex-dev/auth/providers/Email";
import { render } from "@react-email/render";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";
import { VerificationCodeEmail } from "./VerificationCodeEmail";
import { AUTH_EMAIL, AUTH_RESEND_KEY } from "@cvx/env";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: AUTH_RESEND_KEY,
  maxAge: 60 * 20,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    expires,
  }) {
    const resend = new ResendAPI(provider.apiKey);
    const html = await render(
      <VerificationCodeEmail code={token} expires={expires} />,
    );
    const { error } = await resend.emails.send({
      // TODO: Update with your app name and email address
      from: AUTH_EMAIL ?? "Convex SaaS <onboarding@resend.dev>",
      to: [email],
      // TODO: Update with your app name
      subject: `Sign in to Convex SaaS`,
      html,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
