"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Row, Icon, Button, Heading } from "@once-ui-system/core";
import { Menu, X } from "lucide-react";

type HeaderProps = {
  onLogout: () => void;
};

const navItems = [
  { title: "Dashboard", href: "/dashboard/user", iconName: "clipboard" },
  { title: "Cards", href: "/dashboard/user/cards", iconName: "plus" },
  { title: "Top-Up", href: "/dashboard/user/topup", iconName: "rocket" },
  { title: "Transactions", href: "/dashboard/user/transactions", iconName: "check" },
];

export default function Header({ onLogout }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileOpen && !target.closest('.header-container')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="header-container"
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
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "0 2rem"
      }}>
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0 }}>
          <Heading variant="heading-strong-m" style={{ color: "var(--color-text)", cursor: "pointer" }}>
            KripiCard
          </Heading>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          {navItems.map(({ title, href, iconName }) => (
            <Link key={title} href={href} passHref>
              <Button 
                size="m" 
                variant="ghost"
                style={{ 
                  color: "var(--color-text)", 
                  fontWeight: 500,
                  transition: "all 0.2s ease"
                }}
              >
                <Row gap="xs" align="center">
                  <Icon name={iconName} onBackground="accent-weak" />
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
              background: logoutHover ? "var(--color-bg-hover)" : "transparent"
            }}
          >
            <Row gap="xs" align="center">
              <Icon name="danger" onBackground={logoutHover ? "danger-weak" : "accent-weak"} />
              Logout
            </Row>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="m"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-button"
          style={{ color: "var(--color-text)" }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="mobile-dropdown" style={{ padding: "0 2rem" }}>
          {navItems.map(({ title, href, iconName }) => (
            <Link key={title} href={href} passHref onClick={() => setMobileOpen(false)}>
              <Button 
                size="m" 
                fillWidth
                variant="ghost"
                style={{ 
                  background: "var(--color-background-subtle)", 
                  color: "var(--color-text)",
                  justifyContent: "flex-start",
                  padding: "0.75rem 1rem",
                  transition: "all 0.2s ease"
                }}
              >
                <Row gap="xs" align="center">
                  <Icon name={iconName} onBackground="accent-weak" />
                  {title}
                </Row>
              </Button>
            </Link>
          ))}
          <Button 
            variant="outline" 
            size="m" 
            fillWidth
            onClick={onLogout}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            style={{ 
              color: logoutHover ? "var(--color-danger)" : "var(--color-text)",
              borderColor: logoutHover ? "var(--color-danger)" : "var(--color-border)",
              justifyContent: "flex-start",
              padding: "0.75rem 1rem",
              marginTop: "0.25rem",
              transition: "all 0.2s ease",
              background: logoutHover ? "var(--color-bg-hover)" : "transparent"
            }}
          >
            <Row gap="xs" align="center">
              <Icon name="danger" onBackground={logoutHover ? "danger-weak" : "accent-weak"} />
              Logout
            </Row>
          </Button>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .desktop-nav { display: none; gap: 1rem; align-items: center; }
        .mobile-menu-button { display: block; }
        .mobile-dropdown { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; padding-bottom: 0.5rem; animation: slideDown 0.2s ease-out; }
        @media (min-width: 768px) {
          .desktop-nav { display: flex; }
          .mobile-menu-button { display: none; }
          .mobile-dropdown { display: none; }
        }
      `}</style>
    </header>
  );
}
