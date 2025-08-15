"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Row,
  Column,
  Button,
  Icon,
  Heading,
} from "@once-ui-system/core"
import {
  CreditCard,
  Menu,
  X,
  Info,
  Phone,
  LogIn,
  UserPlus
} from "lucide-react"

const navItems = [
  { title: "About", href: "/about", icon: Info },
  { title: "Contact", href: "/contact", icon: Phone },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Column
      as="header"
      background="neutral-strong"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
      }}
    >
      {/* Desktop Header */}
      <Row
        maxWidth="xl"
        paddingX="l"
        paddingY="m"
        horizontal="between"
        vertical="center"
      >
        {/* Logo */}
        <Row gap="s" vertical="center">
          <Icon size="l">
            <CreditCard color="var(--brand-strong)" />
          </Icon>
          <Heading variant="heading-strong-l">KripiCard</Heading>
        </Row>

        {/* Desktop Navigation */}
        <Row gap="l" hide="s">
          {navItems.map(({ title, href, icon: IconComp }) => {
            const isActive = pathname === href
            return (
              <Link key={title} href={href}>
                <Button
                  size="m"
                  border="rounded"
                  background={isActive ? "brand-strong" : "transparent"}
                  variant="default"
                >
                  <Icon size="m">
                    <IconComp color={isActive ? "white" : "var(--neutral-weak)"} />
                  </Icon>
                  {title}
                </Button>
              </Link>
            )
          })}

          {/* Auth Buttons */}
          <Link href="/login">
            <Button
              size="m"
              border="rounded"
              background="neutral-medium"
              prefixIcon={<LogIn size={18} />}
            >
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="m"
              border="rounded"
              background="brand-strong"
              prefixIcon={<UserPlus size={18} />}
            >
              Sign Up
            </Button>
          </Link>
        </Row>

        {/* Mobile Menu Toggle */}
        <Button
          show="s"
          border="rounded"
          size="m"
          background="neutral-medium"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon size="m">
            {menuOpen ? <X /> : <Menu />}
          </Icon>
        </Button>
      </Row>

      {/* Mobile Menu */}
      {menuOpen && (
        <Column
          background="neutral-medium"
          padding="m"
          gap="s"
          show="s"
        >
          {navItems.map(({ title, href, icon: IconComp }) => {
            const isActive = pathname === href
            return (
              <Link key={title} href={href} onClick={() => setMenuOpen(false)}>
                <Button
                  size="l"
                  border="rounded"
                  background={isActive ? "brand-strong" : "transparent"}
                  variant="default"
                >
                  <Icon size="m">
                    <IconComp color={isActive ? "white" : "var(--neutral-weak)"} />
                  </Icon>
                  {title}
                </Button>
              </Link>
            )
          })}

          {/* Auth */}
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <Button
              size="l"
              border="rounded"
              background="neutral-strong"
              prefixIcon={<LogIn size={18} />}
            >
              Login
            </Button>
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}>
            <Button
              size="l"
              border="rounded"
              background="brand-strong"
              prefixIcon={<UserPlus size={18} />}
            >
              Sign Up
            </Button>
          </Link>
        </Column>
      )}
    </Column>
  )
}

