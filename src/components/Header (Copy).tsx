"use client"

import React, { useState } from "react"
import { CreditCard, Home, Plus, ArrowUpCircle, Receipt, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { title: "Dashboard", href: "/dashboard/user", icon: Home },
  { title: "My Cards", href: "/dashboard/user/cards", icon: CreditCard },
  { title: "Request Card", href: "/dashboard/user/request", icon: Plus },
  { title: "Top Up", href: "/dashboard/user/topup", icon: ArrowUpCircle },
  { title: "Transactions", href: "/dashboard/user/transactions", icon: Receipt },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900 text-gray-200 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <CreditCard className="h-7 w-7 text-blue-500" />
          <span className="font-extrabold text-xl tracking-wide select-none">KripiCard</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {navItems.map(({ title, href, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <li key={title}>
                  <Link
                    href={href}
                    className={`
                      flex items-center space-x-2
                      px-3 py-2 rounded-md
                      transition-colors duration-200
                      ${isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"}
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span className="font-semibold">{title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-gray-800 border-t border-gray-700">
          <ul className="flex flex-col space-y-1 px-6 py-4">
            {navItems.map(({ title, href, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <li key={title}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)} // close menu on click
                    className={`
                      flex items-center space-x-3
                      px-3 py-2 rounded-md
                      transition-colors duration-200
                      ${isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"}
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-300"}`} />
                    <span className="font-semibold">{title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}

