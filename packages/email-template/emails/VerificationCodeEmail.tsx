import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationCodeEmailProps {
  validationCode: string;
  appName?: string;
  expiryMinutes: number;
}

export const VerificationCodeEmail = ({
  validationCode = "482910",
  appName = "App",
  expiryMinutes = 10,
}: VerificationCodeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Your {appName} verification code is {validationCode}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify your email address</Heading>
        <Text style={text}>
          Enter the following verification code to finish setting up your{" "}
          <strong>{appName}</strong> account. This code will expire in{" "}
          {expiryMinutes} minutes.
        </Text>

        <Section style={codeBox}>
          <Text style={codeText}>{validationCode}</Text>
        </Section>

        <Text style={subtext}>
          If you didn&apos;t request this code, you can safely ignore this
          email. Never share this code with anyone.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>{appName} Security Team</Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationCodeEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  margin: "0 auto",
  padding: "40px 32px",
  maxWidth: "480px",
};

const h1 = {
  color: "#1a1f36",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 16px",
};

const text = {
  color: "#3c4257",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const codeBox = {
  backgroundColor: "#f4f5f7",
  borderRadius: "6px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const codeText = {
  color: "#1a1f36",
  fontFamily: "monospace",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "8px",
  margin: "0",
};

const subtext = {
  color: "#697386",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "28px 0 20px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  margin: "0",
};
