"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold">SubChain</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-3xl">Security</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Learn how we protect your data and ensure the security of our platform
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Security Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Lock className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle className="text-lg">Data Encryption</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      All data is encrypted in transit and at rest using industry-standard AES-256 encryption.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Shield className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle className="text-lg">Blockchain Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Built on Algorand's secure, carbon-negative blockchain with instant finality.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Eye className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle className="text-lg">Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      24/7 monitoring and automated threat detection to protect against attacks.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Security Measures */}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h2>Security Measures</h2>

                <h3>Infrastructure Security</h3>
                <ul>
                  <li>
                    <strong>Cloud Security:</strong> Hosted on enterprise-grade cloud infrastructure with SOC 2
                    compliance
                  </li>
                  <li>
                    <strong>Network Security:</strong> Protected by firewalls, DDoS protection, and intrusion detection
                    systems
                  </li>
                  <li>
                    <strong>Access Control:</strong> Multi-factor authentication and role-based access controls
                  </li>
                  <li>
                    <strong>Regular Audits:</strong> Quarterly security audits and penetration testing
                  </li>
                </ul>

                <h3>Data Protection</h3>
                <ul>
                  <li>
                    <strong>Encryption:</strong> AES-256 encryption for data at rest, TLS 1.3 for data in transit
                  </li>
                  <li>
                    <strong>Key Management:</strong> Hardware security modules (HSMs) for cryptographic key storage
                  </li>
                  <li>
                    <strong>Data Minimization:</strong> We only collect and store necessary data
                  </li>
                  <li>
                    <strong>Backup Security:</strong> Encrypted backups with geographic distribution
                  </li>
                </ul>

                <h3>Blockchain Security</h3>
                <ul>
                  <li>
                    <strong>Smart Contracts:</strong> Audited smart contracts with formal verification
                  </li>
                  <li>
                    <strong>Wallet Security:</strong> Integration with secure wallet providers like Pera Wallet
                  </li>
                  <li>
                    <strong>Transaction Monitoring:</strong> Real-time monitoring of all blockchain transactions
                  </li>
                  <li>
                    <strong>Multi-signature:</strong> Multi-signature wallets for enhanced security
                  </li>
                </ul>

                <h2>Compliance & Certifications</h2>
                <div className="flex flex-wrap gap-2 my-4">
                  <Badge variant="outline">SOC 2 Type II</Badge>
                  <Badge variant="outline">GDPR Compliant</Badge>
                  <Badge variant="outline">PCI DSS</Badge>
                  <Badge variant="outline">ISO 27001</Badge>
                </div>

                <h2>Incident Response</h2>
                <p>We have a comprehensive incident response plan that includes:</p>
                <ul>
                  <li>24/7 security monitoring and alerting</li>
                  <li>Rapid response team for security incidents</li>
                  <li>Automated threat detection and mitigation</li>
                  <li>Regular security drills and tabletop exercises</li>
                  <li>Transparent communication during incidents</li>
                </ul>

                <h2>User Security Best Practices</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-6">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Security Recommendations</h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                        <li>• Use strong, unique passwords for your account</li>
                        <li>• Enable two-factor authentication (2FA)</li>
                        <li>• Keep your wallet software up to date</li>
                        <li>• Never share your private keys or seed phrases</li>
                        <li>• Verify wallet addresses before sending transactions</li>
                        <li>• Monitor your account regularly for suspicious activity</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h2>Vulnerability Disclosure</h2>
                <p>
                  We welcome security researchers to help us keep SubChain secure. If you discover a security
                  vulnerability, please report it to us at:
                </p>
                <ul>
                  <li>
                    <strong>Email:</strong> security@subchain.dev
                  </li>
                  <li>
                    <strong>PGP Key:</strong> Available upon request
                  </li>
                </ul>
                <p>
                  We commit to acknowledging your report within 24 hours and providing regular updates on our progress.
                  We also offer a responsible disclosure program with rewards for qualifying vulnerabilities.
                </p>

                <h2>Security Updates</h2>
                <p>
                  We regularly update our security measures and will notify users of any significant changes that may
                  affect their accounts. Stay informed by:
                </p>
                <ul>
                  <li>Following our security blog</li>
                  <li>Subscribing to security notifications</li>
                  <li>Checking our status page for updates</li>
                </ul>

                <h2>Contact Us</h2>
                <p>For security-related questions or concerns, please contact our security team:</p>
                <ul>
                  <li>
                    <strong>Security Team:</strong> security@subchain.dev
                  </li>
                  <li>
                    <strong>General Support:</strong> support@subchain.dev
                  </li>
                  <li>
                    <strong>Emergency:</strong> Available 24/7 through our support portal
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
