"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Award, Globe } from "lucide-react"
import Header from "@/components/Header2"

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200 flex flex-col pt-20">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">
          About <span className="text-blue-400">KripiCard</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          KripiCard is revolutionizing how people and businesses handle virtual USD payments,
          powered by cryptocurrency. Our mission is to make fast, secure, and borderless
          transactions accessible to everyone.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 bg-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <Card className="bg-gray-900 shadow-lg">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-400">
                To provide seamless, secure, and globally accessible virtual card services 
                that empower individuals and businesses to manage their finances with confidence.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 shadow-lg">
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Our Vision</h3>
              <p className="text-gray-400">
                To be the world’s most trusted and innovative virtual card provider,
                bridging the gap between traditional finance and blockchain technology.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Values</h2>
          <p className="text-xl text-gray-400">
            What drives us to keep innovating
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-800 shadow-lg">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Customer First</h3>
              <p className="text-gray-400">
                We design every feature with the needs of our users in mind.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg">
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Access</h3>
              <p className="text-gray-400">
                Our services are built for a connected, borderless economy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg">
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-400">
                We set the bar high for quality, security, and performance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-12 px-6 text-center">
        <p>&copy; 2025 KripiCard. All rights reserved.</p>
      </footer>
    </div>
  )
}
