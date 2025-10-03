"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Zap, Shield, TrendingUp, Globe, CreditCard, Users, BarChart3, Coins } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-brand-dark">
        {/* Navigation */}
        <nav className="relative z-10 bg-brand-light border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/subchain-logo.png" alt="SubChain Logo" width={200} height={60} className="h-12 w-auto" />
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/pricing" className="text-brand-dark hover:text-brand-yellow transition-colors font-medium">
                  Pricing
                </Link>
                <Link href="/docs" className="text-brand-dark hover:text-brand-yellow transition-colors font-medium">
                  Documentation
                </Link>
                <Link
                  href="/security"
                  className="text-brand-dark hover:text-brand-yellow transition-colors font-medium"
                >
                  Security
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="text-brand-dark hover:text-brand-yellow hover:bg-gray-100 font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 font-semibold shadow-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <a
              href="https://www.algorand.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-6"
            >
              <Badge className="bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30 hover:bg-brand-yellow/30 cursor-pointer transition-all">
                <Zap className="w-3 h-3 mr-1" />
                Built on Algorand
              </Badge>
            </a>
            <h1 className="text-5xl md:text-7xl font-bold text-brand-light mb-6">
              Crypto Subscriptions
              <br />
              <span className="text-brand-yellow">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Accept recurring payments in ALGO and stablecoins with zero setup fees. Launch your subscription business
              on the blockchain in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-brand-dark text-brand-yellow hover:bg-brand-dark/90 font-bold shadow-2xl hover:shadow-brand-yellow/50 transition-all text-lg px-10 py-7 border-2 border-brand-yellow"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark bg-transparent font-bold shadow-2xl hover:shadow-brand-yellow/50 transition-all text-lg px-10 py-7"
                >
                  View Documentation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Revenue Model Section */}
      <section className="py-20 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30">Simple Pricing</Badge>
            <h2 className="text-4xl font-bold text-brand-light mb-4">Pay Only When You Earn</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              No monthly fees, no hidden costs. We only succeed when you do.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card border-gray-700 hover:border-brand-yellow/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-brand-yellow/20 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-brand-yellow" />
                </div>
                <CardTitle className="text-brand-light">Commission Fee</CardTitle>
                <CardDescription className="text-gray-400">Per successful transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-brand-yellow mb-2">2.4%</div>
                <p className="text-gray-400">Only charged on successful payments</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-gray-700 hover:border-brand-yellow/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-brand-yellow/20 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-brand-yellow" />
                </div>
                <CardTitle className="text-brand-light">Transaction Fee</CardTitle>
                <CardDescription className="text-gray-400">Algorand network fee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-brand-yellow mb-2">~$0.001</div>
                <p className="text-gray-400">Standard Algorand transaction cost</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-300 mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="flex items-center">
                <Check className="inline h-5 w-5 text-brand-yellow mr-2" />
                No setup fees
              </span>
              <span className="flex items-center">
                <Check className="inline h-5 w-5 text-brand-yellow mr-2" />
                No monthly fees
              </span>
              <span className="flex items-center">
                <Check className="inline h-5 w-5 text-brand-yellow mr-2" />
                No hidden costs
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30">Features</Badge>
            <h2 className="text-4xl font-bold text-brand-light mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features to manage your subscription business on the blockchain
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure & Transparent",
                description: "All transactions on Algorand blockchain with full transparency and security",
              },
              {
                icon: TrendingUp,
                title: "Analytics Dashboard",
                description: "Track revenue, subscribers, and growth metrics in real-time",
              },
              {
                icon: Globe,
                title: "Multi-Currency Support",
                description: "Accept ALGO, USDC, and other Algorand Standard Assets",
              },
              {
                icon: CreditCard,
                title: "Payment Links & Widgets",
                description: "Easy-to-integrate payment solutions for your platform",
              },
              {
                icon: Users,
                title: "Subscriber Management",
                description: "Complete tools to manage your subscriber base effectively",
              },
              {
                icon: BarChart3,
                title: "Automated Billing",
                description: "Set it and forget it - recurring payments handled automatically",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-brand-dark border-gray-700 hover:border-brand-yellow/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-brand-yellow/20 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <CardTitle className="text-brand-light">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30">How It Works</Badge>
            <h2 className="text-4xl font-bold text-brand-light mb-4">Get Started in Minutes</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to launch your subscription business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description: "Sign up and connect your Algorand wallet in seconds",
              },
              {
                step: "2",
                title: "Set Up Plans",
                description: "Create subscription plans with flexible pricing and billing cycles",
              },
              {
                step: "3",
                title: "Start Accepting Payments",
                description: "Share payment links or embed widgets to start receiving crypto payments",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card border-gray-700 hover:border-brand-yellow/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-brand-yellow rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-brand-dark">{item.step}</span>
                    </div>
                    <CardTitle className="text-brand-light">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-brand-light mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join businesses already using SubChain to power their subscription revenue
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-brand-dark text-brand-yellow hover:bg-brand-dark/90 font-bold shadow-2xl hover:shadow-brand-yellow/50 transition-all text-lg px-10 py-7 border-2 border-brand-yellow"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-gray-400 mt-4">No credit card required • 2.4% per transaction</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-light border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-brand-dark mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-brand-yellow transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-600 hover:text-brand-yellow transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/security" className="text-gray-600 hover:text-brand-yellow transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-brand-yellow transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-brand-yellow transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-brand-yellow transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark mb-4">Connect</h3>
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/subchain-logo.png" alt="SubChain Logo" width={200} height={60} className="h-12 w-auto" />
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2025 SubChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
