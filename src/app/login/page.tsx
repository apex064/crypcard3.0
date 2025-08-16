"use client";

import { useState } from "react";
import {
  Column,
  Heading,
  Text,
  Button,
  Input,
  Flex,
  Badge,
  Card,
  IconButton,
} from "@once-ui-system/core";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      window.location.href = data.redirect || "/dashboard/user";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex fillWidth fillHeight center padding="l">
      <Card
        shadow="xl"
        radius="xl"
        padding="xl"
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "auto",
        }}
      >
        <Column gap="l" align="center" justify="center">
          <Badge textVariant="label-default-m">KripiCard</Badge>
          <Heading variant="display-strong-l" marginTop="8" align="center">
            Login to KripiCard
          </Heading>
          <Text onBackground="neutral-weak" align="center" marginBottom="16">
            Welcome back! Enter your credentials to access your account.
          </Text>

          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <Column gap="m">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Flex align="center" gap="2" position="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "40px", flex: 1 }}
                />
                <IconButton
                  icon={showPassword ? <EyeOff /> : <Eye />}
                  variant="ghost"
                  size="m"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px" }}
                />
              </Flex>

              {error && (
                <Text onBackground="danger-strong" weight="medium" align="center">
                  {error}
                </Text>
              )}

              <Button type="submit" size="l" fillWidth disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Column>
          </form>

          <Text onBackground="neutral-weak" align="center" marginTop="12">
            Don't have an account?{" "}
            <a href="/register" style={{ color: "#3b82f6" }}>
              Register
            </a>
          </Text>
        </Column>
      </Card>
    </Flex>
  );
}
