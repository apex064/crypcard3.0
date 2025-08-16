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
            prefixIcon="credit-card"
            arrowIcon
          >
            Get Started
          </Button>
        </Column>
      </Row>

      {/* AutoScroll Logos */}
      <AutoScroll style={{ marginTop: "48px", marginBottom: "48px" }}>
        <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
        <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
        <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
        <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
        <Logo className="dark-flex" wordmark="/trademark/type-dark.svg" size="s" href="/" />
        <Logo className="light-flex" wordmark="/trademark/type-light.svg" size="s" href="/" />
      </AutoScroll>

      {/* Main Content Section */}
      <Column fillWidth style={{ maxWidth: "1200px", margin: "0 auto" }} gap="48px">
        {/* Cards Row - now properly aligned side by side */}
        <Row fillWidth wrap gap="l" justify="center" align="start">
          {/* Card 1 */}
          <Card radius="l-4" direction="column" border="neutral-alpha-medium" style={{ flex: 1, minWidth: "300px", maxWidth: "400px" }}>
            <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
              <Avatar size="xs" src="/images/avatar1.jpg" />
              <Text variant="label-default-s">Lorant One</Text>
            </Row>
            <Media
              border="neutral-alpha-weak"
              sizes="400px"
              fillWidth
              aspectRatio="4 / 3"
              radius="l"
              alt="Proxima b"
              src="/images/card1.jpg"
            />
            <Column fillWidth paddingX="20" paddingY="24" gap="8">
              <Text variant="body-default-xl">Proxima b</Text>
              <Text onBackground="neutral-weak" variant="body-default-s">
                A planet so cruel on the surface, but once you explore what's underneath, you'll question everything you know. Yet, you vibe with it.
              </Text>
            </Column>
            <Line background="neutral-alpha-medium" />
            <Row
              paddingX="20" paddingY="12"
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
          <Card radius="l-4" direction="column" border="neutral-alpha-medium" style={{ flex: 1, minWidth: "300px", maxWidth: "400px" }}>
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
              alt="Kepler-442b"
              src="/images/card2.jpg"
            />
            <Column fillWidth paddingX="20" paddingY="24" gap="8">
              <Text variant="body-default-xl">Kepler-442b</Text>
              <Text onBackground="neutral-weak" variant="body-default-s">
                This mysterious exoplanet will challenge your understanding of the universe and inspire curiosity in the unexplored.
              </Text>
            </Column>
            <Line background="neutral-alpha-medium" />
            <Row
              paddingX="20" paddingY="12"
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
        </Row>

        {/* Footer Media - now properly below the cards */}
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
