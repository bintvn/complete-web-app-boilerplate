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

interface WelcomeEmailProps {
  userName: string;
  appName: string;
}

export const WelcomeEmail = ({ appName, userName }: WelcomeEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>
      Hi {userName}, your {appName} account is ready to use.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to {appName}!</Heading>
        <Text style={text}>
          Hi <strong>{userName}</strong>, we’re glad you’re here. Your account
          is ready whenever you are.
        </Text>

        <Section style={startBox}>
          <Heading as="h2" style={startHeading}>
            Take a look around
          </Heading>
          <Text style={startText}>
            Sign in to {appName} to explore what you can do with your account.
          </Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>The {appName} Team</Text>
      </Container>
    </Body>
  </Html>
);

WelcomeEmail.PreviewProps = {
  appName: "App",
  userName: "Your Name",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;

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

const startBox = {
  backgroundColor: "#f4f5f7",
  borderRadius: "6px",
  padding: "16px",
  textAlign: "center" as const,
};

const startHeading = {
  color: "#1a1f36",
  fontSize: "16px",
  fontWeight: "700",
  lineHeight: "1.4",
  margin: "0 0 4px",
};

const startText = {
  color: "#3c4257",
  fontSize: "14px",
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
