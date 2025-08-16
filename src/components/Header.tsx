"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Row, Icon, Button, Heading, Column, Flex } from "@once-ui-system/core";
import { CreditCard, ArrowUpCircle, BarChart3, LogOut } from "lucide-react";
import { NavIcon } from "@once-ui/components";

type HeaderProps = {
  onLogout: () => void;
};

const navItems = [
  { title: "Dashboard", href: "/dashboard/user", icon: BarChart3 },
  { title: "Cards", href: "/dashboard/user/cards", icon: CreditCard },
  { title: "Top-Up", href: "/dashboard/user/topup", icon: ArrowUpCircle },
  { title: "Transactions", href: "/dashboard/user/transactions", icon: BarChart3 },
];

export default function Header({ onLogout }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <header
      style={{
        background: isScrolled ? "var(--color-background-subtle)" : "var(--color-background)",
        padding: "0.75rem 0",
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
        boxShadow: isScrolled ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <Column fillWidth>
        {/* Top flex row: logo + desktop nav + mobile toggle */}
        <Flex
          paddingX="2rem"
          align="center"
          justify="between"
          fillWidth
          style={{ maxWidth: "1440px", margin: "0 auto" }}
        >
          <Link href="/" style={{ flexShrink: 0 }}>
            <Heading variant="heading-strong-m" style={{ color: "var(--color-text)", cursor: "pointer" }}>
              KripiCard
            </Heading>
          </Link>

          {/* Desktop Nav */}
          <div className="desktop-nav">
            {navItems.map(({ title, href, icon }) => (
              <Link key={title} href={href} passHref>
                <Button
                  size="m"
                  variant="ghost"
                  style={{
                    color: "var(--color-text)",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Row gap="xs" align="center">
                    <Icon icon={icon} size="s" color="var(--color-text)" />
                    {title}
                  </Row>
                </Button>
              </Link>
            ))}
            <Button
              variant="outline"
              size="m"
              onClick={onLogout}
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
              style={{
                color: logoutHover ? "var(--color-danger)" : "var(--color-text)",
                borderColor: logoutHover ? "var(--color-danger)" : "var(--color-border)",
                marginLeft: "0.5rem",
                transition: "all 0.2s ease",
                background: logoutHover ? "var(--color-bg-hover)" : "transparent",
              }}
            >
              <Row gap="xs" align="center">
                <Icon
                  icon={LogOut}
                  size="s"
                  color={logoutHover ? "var(--color-danger)" : "var(--color-text)"}
                />
                Logout
              </Row>
            </Button>
          </div>

          {/* Mobile NavIcon toggle */}
          <div className="mobile-nav">
            <NavIcon
              isActive={mobileOpen}
              onClick={toggleMobile}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-dropdown"
            />
          </div>
        </Flex>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <Column
            id="mobile-nav-dropdown"
            padding="16"
            background="surface"
            border="surface"
            radius="l"
            marginTop="8"
            fillWidth
            gap="8"
          >
            {navItems.map(({ title, href }) => (
              <Link key={title} href={href} passHref onClick={() => setMobileOpen(false)}>
                <Button
                  fillWidth
                  horizontal="start"
                  size="l"
                  variant="ghost"
                  style={{ justifyContent: "flex-start" }}
                >
                  {title}
                </Button>
              </Link>
            ))}
            <Button
              fillWidth
              horizontal="start"
              size="l"
              variant="outline"
              onClick={onLogout}
            >
              Logout
            </Button>
          </Column>
        )}
      </Column>

      <style jsx>{`
        .desktop-nav {
          display: none;
          gap: 1rem;
          align-items: center;
        }
        .mobile-nav {
          display: block;
        }
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
          }
          .mobile-nav {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
