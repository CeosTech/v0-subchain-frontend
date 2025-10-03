"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Key, Webhook, Bell, Shield, Globe, Copy, Check, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

// Mock data
const apiKeys = [
  {
    id: "key_1",
    name: "Production API Key",
    key: "sk_live_51H7...",
    created: "2024-01-15",
    last_used: "2024-01-20",
    permissions: ["read", "write"],
    status: "active",
  },
  {
    id: "key_2",
    name: "Test API Key",
    key: "sk_test_51H7...",
    created: "2024-01-10",
    last_used: "2024-01-19",
    permissions: ["read"],
    status: "active",
  },
]

const webhooks = [
  {
    id: "wh_1",
    url: "https://api.example.com/webhooks/subchain",
    events: ["payment.completed", "payment.failed", "subscription.created"],
    status: "active",
    created: "2024-01-15",
    last_triggered: "2024-01-20",
  },
  {
    id: "wh_2",
    url: "https://staging.example.com/webhooks",
    events: ["payment.completed"],
    status: "inactive",
    created: "2024-01-10",
    last_triggered: "2024-01-18",
  },
]

export default function SettingsPage() {
  const [apiKeysCopied, setApiKeysCopied] = useState<string>("")
  const [showApiKey, setShowApiKey] = useState<string>("")
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false)
  const [isCreateWebhookDialogOpen, setIsCreateWebhookDialogOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState({ name: "", permissions: "read" })
  const [newWebhook, setNewWebhook] = useState({
    url: "",
    events: [] as string[],
    secret: "",
  })

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email_reports: true,
      transaction_alerts: false,
      security_alerts: true,
      marketing_emails: false,
    },
    security: {
      two_factor: false,
      api_rate_limiting: true,
      webhook_verification: true,
      ip_whitelist: "",
    },
    business: {
      company_name: "My Company",
      business_email: "business@example.com",
      webhook_url: "",
      default_currency: "ALGO",
      fee_display: "inclusive",
    },
  })

  const handleCopyApiKey = (keyId: string, key: string) => {
    navigator.clipboard.writeText(key)
    setApiKeysCopied(keyId)
    setTimeout(() => setApiKeysCopied(""), 2000)
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard",
    })
  }

  const handleToggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(showApiKey === keyId ? "" : keyId)
  }

  const handleCreateApiKey = async () => {
    if (!newApiKey.name) {
      toast({
        title: "Error",
        description: "Please provide a name for the API key",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "API key created successfully",
    })
    setIsCreateKeyDialogOpen(false)
    setNewApiKey({ name: "", permissions: "read" })
  }

  const handleCreateWebhook = async () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a URL and select at least one event",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Webhook created successfully",
    })
    setIsCreateWebhookDialogOpen(false)
    setNewWebhook({ url: "", events: [], secret: "" })
  }

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return
    }

    toast({
      title: "Success",
      description: "API key deleted successfully",
    })
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) {
      return
    }

    toast({
      title: "Success",
      description: "Webhook deleted successfully",
    })
  }

  const handleTestWebhook = async (webhookId: string) => {
    toast({
      title: "Testing webhook...",
      description: "Sending test payload to webhook endpoint",
    })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Success",
      description: "Test webhook sent successfully",
    })
  }

  const updateSettings = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const availableEvents = [
    "payment.completed",
    "payment.failed",
    "payment.pending",
    "subscription.created",
    "subscription.updated",
    "subscription.cancelled",
    "merchant.created",
    "merchant.updated",
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and API configuration</p>
      </div>

      {/* API Keys Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API keys for accessing SubChain services</CardDescription>
            </div>
            <Dialog open={isCreateKeyDialogOpen} onOpenChange={setIsCreateKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>Create a new API key to access SubChain services</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="Production API Key"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permissions">Permissions</Label>
                    <Select
                      value={newApiKey.permissions}
                      onValueChange={(value) => setNewApiKey({ ...newApiKey, permissions: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateKeyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateApiKey}>Create Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{key.name}</h4>
                      {getStatusBadge(key.status)}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {showApiKey === key.id ? key.key : key.key.replace(/./g, "•")}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleApiKeyVisibility(key.id)}>
                        {showApiKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyApiKey(key.id, key.key)}>
                        {apiKeysCopied === key.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(key.created).toLocaleDateString()} • Last used:{" "}
                      {new Date(key.last_used).toLocaleDateString()} • Permissions: {key.permissions.join(", ")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteApiKey(key.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Webhooks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Webhook className="h-5 w-5 mr-2" />
                Webhooks
              </CardTitle>
              <CardDescription>Configure webhooks to receive real-time notifications</CardDescription>
            </div>
            <Dialog open={isCreateWebhookDialogOpen} onOpenChange={setIsCreateWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Webhook</DialogTitle>
                  <DialogDescription>Add a webhook endpoint to receive event notifications</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://api.example.com/webhooks/subchain"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Events</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableEvents.map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={event}
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: [...newWebhook.events, event],
                                })
                              } else {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: newWebhook.events.filter((e) => e !== event),
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={event} className="text-sm">
                            {event}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                    <Input
                      id="webhook-secret"
                      placeholder="webhook_secret_key"
                      value={newWebhook.secret}
                      onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateWebhookDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWebhook}>Create Webhook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{webhook.url}</code>
                      {getStatusBadge(webhook.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Events: {webhook.events.join(", ")}</div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(webhook.created).toLocaleDateString()} • Last triggered:{" "}
                      {new Date(webhook.last_triggered).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleTestWebhook(webhook.id)}>
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-reports">Email Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
              </div>
              <Switch
                id="email-reports"
                checked={settings.notifications.email_reports}
                onCheckedChange={(checked) => updateSettings("notifications", "email_reports", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of failed transactions</p>
              </div>
              <Switch
                id="transaction-alerts"
                checked={settings.notifications.transaction_alerts}
                onCheckedChange={(checked) => updateSettings("notifications", "transaction_alerts", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security-alerts">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Important security notifications</p>
              </div>
              <Switch
                id="security-alerts"
                checked={settings.notifications.security_alerts}
                onCheckedChange={(checked) => updateSettings("notifications", "security_alerts", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Product updates and tips</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.notifications.marketing_emails}
                onCheckedChange={(checked) => updateSettings("notifications", "marketing_emails", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                id="two-factor"
                checked={settings.security.two_factor}
                onCheckedChange={(checked) => updateSettings("security", "two_factor", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="rate-limiting">API Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">Protect against API abuse</p>
              </div>
              <Switch
                id="rate-limiting"
                checked={settings.security.api_rate_limiting}
                onCheckedChange={(checked) => updateSettings("security", "api_rate_limiting", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="webhook-verification">Webhook Verification</Label>
                <p className="text-sm text-muted-foreground">Verify webhook signatures</p>
              </div>
              <Switch
                id="webhook-verification"
                checked={settings.security.webhook_verification}
                onCheckedChange={(checked) => updateSettings("security", "webhook_verification", checked)}
              />
            </div>
            <div>
              <Label htmlFor="ip-whitelist">IP Whitelist</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Restrict API access to specific IPs (comma-separated)
              </p>
              <Textarea
                id="ip-whitelist"
                placeholder="192.168.1.1, 10.0.0.1"
                value={settings.security.ip_whitelist}
                onChange={(e) => updateSettings("security", "ip_whitelist", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Business Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Business Settings
            </CardTitle>
            <CardDescription>Configure your business information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={settings.business.company_name}
                onChange={(e) => updateSettings("business", "company_name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="business-email">Business Email</Label>
              <Input
                id="business-email"
                type="email"
                value={settings.business.business_email}
                onChange={(e) => updateSettings("business", "business_email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="default-currency">Default Currency</Label>
              <Select
                value={settings.business.default_currency}
                onValueChange={(value) => updateSettings("business", "default_currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALGO">ALGO</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fee-display">Fee Display</Label>
              <Select
                value={settings.business.fee_display}
                onValueChange={(value) => updateSettings("business", "fee_display", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inclusive">Inclusive (fees included in price)</SelectItem>
                  <SelectItem value="exclusive">Exclusive (fees shown separately)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  toast({ title: "Settings saved", description: "Your settings have been updated successfully" })
                }
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
