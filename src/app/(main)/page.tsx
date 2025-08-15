"use client";

import {
  Heading,
  Text,
  Button,
  Column,
  Row,
  Badge,
  Logo,
  Line,
  LetterFx,
} from "@once-ui-system/core";

export default function Home() {
  return (
    <Column fillWidth padding="l" style={{ minHeight: "100vh" }} center={false}>
      {/* Hero Section */}
      <Row
        fillWidth
        wrap
        justify="space-between"
        align="center"
        style={{ maxWidth: "1200px", margin: "0 auto", gap: "32px" }}
      >
        {/* Left: Text Content */}
        <Column maxWidth="s" gap="l" align="start">
          <Badge
            textVariant="code-default-s"
            border="neutral-alpha-medium"
            onBackground="neutral-medium"
            vertical="center"
            gap="16"
          >
            <Logo dark icon="/kripicard-dark.svg" href="https://kripicard.com" size="xs" />
            <Logo light icon="/kripicard-light.svg" href="https://kripicard.com" size="xs" />
            <Line vert background="neutral-alpha-strong" />
            <Text marginX="4">
              <LetterFx trigger="instant">Instant USD Virtual Cards</LetterFx>
            </Text>
          </Badge>

          <Heading variant="display-strong-xl" marginTop="24">
            Fund, Spend, and Manage with Total Control
          </Heading>

          <Text
            variant="heading-default-xl"
            onBackground="neutral-weak"
            wrap="balance"
            marginBottom="16"
          >
            Create and top-up virtual USD cards instantly, track transactions in real time, and customize fees with ease — all from one secure platform.
          </Text>

          <Button
            id="get-started"
            href="#signup"
            data-border="rounded"
            weight="default"
            prefixIcon="credit-card"
            arrowIcon
          >
            Get Started
          </Button>
        </Column>

        {/* Right: Image */}
        <Column maxWidth="m" align="center">
          <img
            src="/debit-card.png" // Replace with your actual image
            alt="KripiCard virtual cards illustration"
            style={{ width: "100%", borderRadius: "12px", objectFit: "cover" }}
          />
        </Column>
      </Row>
    </Column>
  );
}

