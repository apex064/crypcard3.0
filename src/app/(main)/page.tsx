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
  AutoScroll,
  Card,
  Media,
  Avatar,
  Icon,
} from "@once-ui-system/core";

import Header from "@/components/Header4"; // <-- imported your Header component

export default function Home() {
  return (
    <Column fillWidth padding="l" style={{ minHeight: "100vh" }} center={false}>
      {/* --- Header --- */}
      <Header />

      {/* Hero Section */}
      <Row
        fillWidth
        wrap
        justify="space-between"
        align="start"
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
            href="/register"
            data-border="rounded"
            weight="default"
            prefixIcon="rocket"
            arrowIcon
          >
            Get Started
          </Button>
        </Column>
      </Row>

      {/* AutoScroll Logos */}
      <AutoScroll style={{ marginTop: "30px", marginBottom: "30px" }}>
        <Logo className="dark-flex" wordmark="/trademark/skrill.svg" size="s" href="/" />
        <Logo className="light-flex" wordmark="/trademark/paypal.svg" size="s" href="/" />
        <Logo className="dark-flex" wordmark="/trademark/google-pay.svg" size="s" href="/" />
        <Logo className="light-flex" wordmark="/trademark/applepay.svg" size="s" href="/" />
        <Logo className="dark-flex" wordmark="/trademark/applepay.svg" size="s" href="/" />
        <Logo className="light-flex" wordmark="/trademark/paypal.svg" size="s" href="/" />
      </AutoScroll>

      {/* Cards Section - Three Cards Horizontal */}
      <Row
        fillWidth
        gap="l"
        justify="center"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: "16px",
        }}
      >
        {/* Card 1 */}
        <Card
          radius="l-4"
          direction="column"
          border="neutral-alpha-medium"
          style={{
            width: "380px",
            flexShrink: 0,
          }}
        >
          <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
            <Avatar size="xs" src="/images/avatar1.png" />
            <Text variant="label-default-s">TRC20</Text>
          </Row>
          <Media
            border="neutral-alpha-weak"
            sizes="400px"
            fillWidth
            aspectRatio="4 / 3"
            radius="l"
            alt="TRC20"
            src="/images/card1.jpg"
          />
          <Column fillWidth paddingX="20" paddingY="24" gap="8">
            <Text variant="body-default-xl">Proxima b</Text>
            <Text onBackground="neutral-weak" variant="body-default-s">
              best rates avalible in the market.
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
            34
            <Icon name="chat" size="s" onBackground="neutral-strong" marginLeft="24" />
            5
          </Row>
        </Card>

        {/* Card 2 */}
        <Card
          radius="l-4"
          direction="column"
          border="neutral-alpha-medium"
          style={{
            width: "380px",
            flexShrink: 0,
          }}
        >
          <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
            <Avatar size="xs" src="/images/avatar2.jpg" />
            <Text variant="label-default-s">Jane Doe</Text>
          </Row>
          <Media
            border="neutral-alpha-weak"
            sizes="400px"
            fillWidth
            aspectRatio="4 / 3"
            radius="l"
            alt="smart chain"
            src="/images/card2.jpg"
          />
          <Column fillWidth paddingX="20" paddingY="24" gap="8">
            <Text variant="body-default-xl">Kepler-442b</Text>
            <Text onBackground="neutral-weak" variant="body-default-s">
              always on 24/7.
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
            21
            <Icon name="chat" size="s" onBackground="neutral-strong" marginLeft="24" />
            3
          </Row>
        </Card>

        {/* Card 3 */}
        <Card
          radius="l-4"
          direction="column"
          border="neutral-alpha-medium"
          style={{
            width: "380px",
            flexShrink: 0,
          }}
        >
          <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
            <Avatar size="xs" src="/images/avatar3.jpg" />
            <Text variant="label-default-s">John Smith</Text>
          </Row>
          <Media
            border="neutral-alpha-weak"
            sizes="400px"
            fillWidth
            aspectRatio="4 / 3"
            radius="l"
            alt="USD"
            src="/images/card3.jpg"
          />
          <Column fillWidth paddingX="20" paddingY="24" gap="8">
            <Text variant="body-default-xl">TRAPPIST-1e</Text>
            <Text onBackground="neutral-weak" variant="body-default-s">
              easiest way to convert crypto to card.
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
            42
            <Icon name="chat" size="s" onBackground="neutral-strong" marginLeft="24" />
            7
          </Row>
        </Card>
      </Row>

      {/* Footer Media */}
      <Column fillWidth align="center" marginTop="48px" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Media
          src="/image.jpg"
          alt="Preview"
          radius="xl"
          border="neutral-alpha-medium"
          aspectRatio="16 / 9"
          fillWidth
        />
      </Column>
    </Column>
  );
}

