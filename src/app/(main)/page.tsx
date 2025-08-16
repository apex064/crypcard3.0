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
  Card,
  Media,
  Avatar,
  Icon,
} from "@once-ui-system/core";
import "./Home.css"; // For autoscroll animation

export default function Home() {
  return (
    <Column fillWidth padding="l" style={{ minHeight: "100vh" }} center={false}>
      {/* Hero Section */}
      <Row
        fillWidth
        wrap
        justify="space-between"
        align="start"
        style={{ maxWidth: "1200px", margin: "0 auto", gap: "32px" }}
      >
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
            href="/register"
            data-border="rounded"
            weight="default"
            prefixIcon="credit-card"
            arrowIcon
          >
            Get Started
          </Button>
        </Column>
      </Row>

      {/* Infinite AutoScroll Logos */}
      <div className="autoscroll-container" style={{ marginTop: "48px", marginBottom: "48px" }}>
        <div className="autoscroll-track">
          <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
          <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
          <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
          <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
          <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
          <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />

          {/* Repeat for seamless scroll */}
          <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
          <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
          <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
          <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
          <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
          <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
        </div>
      </div>

      {/* Three Cards Side by Side */}
      <Row
        fillWidth
        wrap
        gap="24px"
        justify="center"
        style={{ maxWidth: "1200px", margin: "0 auto", marginBottom: "48px" }}
      >
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            radius="l-4"
            direction="column"
            border="neutral-alpha-medium"
            style={{ flex: "1 1 300px", maxWidth: "360px" }}
          >
            <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
              <Avatar size="xs" src={`/images/avatar${i}.jpg`} />
              <Text variant="label-default-s">User {i}</Text>
            </Row>
            <Media
              border="neutral-alpha-weak"
              sizes="400px"
              fillWidth
              aspectRatio="4 / 3"
              radius="l"
              alt={`Card ${i}`}
              src={`/images/card${i}.jpg`}
            />
            <Column fillWidth paddingX="20" paddingY="24" gap="8">
              <Text variant="body-default-xl">Card Title {i}</Text>
              <Text onBackground="neutral-weak" variant="body-default-s">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Discover the features and enjoy the benefits.
              </Text>
            </Column>
            <Line background="neutral-alpha-medium" />
            <Row
              paddingX="20"
              paddingY="12"
              gap="8"
              vertical="center"
              textVariant="label-default-s"
              onBackground="neutral-medium"
            >
              <Icon name="like" size="s" onBackground="neutral-strong" />
              {i * 10}
              <Icon name="chat" size="s" onBackground="neutral-strong" marginLeft="24" />
              {i * 2}
            </Row>
          </Card>
        ))}
      </Row>

      {/* Footer Media Preview */}
      <Column fillWidth align="center">
        <Media
          src="/image.jpg"
          alt="Preview"
          radius="xl"
          border="neutral-alpha-medium"
          aspectRatio="16 / 9"
          style={{ maxWidth: "1200px", width: "100%" }}
        />
      </Column>
    </Column>
  );
}
