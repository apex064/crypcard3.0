"use client"

import Header from "@/components/Header2"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200 flex flex-col pt-20">
      {/* Header */}
      <Header />

      {/* Main Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-6">
          Get in <span className="text-blue-400">Touch</span>
        </h1>
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
          Have questions, need help, or want to work with us?  
          We’re here to listen and respond as quickly as possible.
        </p>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gray-800 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 text-center">
              <Mail className="mx-auto text-blue-400 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-gray-400">support@kripicard.com</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 text-center">
              <Phone className="mx-auto text-blue-400 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <p className="text-gray-400">+1 6675123658</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 text-center">
              <MapPin className="mx-auto text-blue-400 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <p className="text-gray-400">United states,los angeles</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="bg-gray-800 shadow-lg">
          <CardContent className="p-6">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Message</label>
                <textarea
                  placeholder="Your message..."
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto text-center border-t border-gray-700 pt-6">
          <p>&copy; 2025 KripiCard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
