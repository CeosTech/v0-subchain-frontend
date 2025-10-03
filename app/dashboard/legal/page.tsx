"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

// Mock data for legal documents
const mockDocuments = [
  {
    id: "doc_1",
    title: "Terms and Conditions",
    type: "terms",
    language: "en",
    status: "active",
    version: "1.2",
    content: `# Terms and Conditions

## 1. Introduction
Welcome to SubChain. These terms and conditions outline the rules and regulations for the use of SubChain's services.

## 2. Acceptance of Terms
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

## 3. Use License
Permission is granted to temporarily use SubChain's services for personal, non-commercial transitory viewing only.

## 4. Disclaimer
The materials on SubChain's service are provided on an 'as is' basis. SubChain makes no warranties, expressed or implied.

## 5. Limitations
In no event shall SubChain or its suppliers be liable for any damages arising out of the use or inability to use the materials on SubChain's service.

## 6. Accuracy of Materials
The materials appearing on SubChain's service could include technical, typographical, or photographic errors.

## 7. Links
SubChain has not reviewed all of the sites linked to our service and is not responsible for the contents of any such linked site.

## 8. Modifications
SubChain may revise these terms of service at any time without notice.

## 9. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of France.`,
    created_at: "2024-01-15",
    updated_at: "2024-02-20",
    effective_date: "2024-02-25",
  },
  {
    id: "doc_2",
    title: "Privacy Policy",
    type: "privacy",
    language: "en",
    status: "active",
    version: "1.1",
    content: `# Privacy Policy

## Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

## How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

## Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

## Data Security
We implement appropriate security measures to protect your personal information.

## Contact Us
If you have any questions about this Privacy Policy, please contact us.`,
    created_at: "2024-01-10",
    updated_at: "2024-01-10",
    effective_date: "2024-01-15",
  },
  {
    id: "doc_3",
    title: "Conditions Générales de Vente",
    type: "terms",
    language: "fr",
    status: "draft",
    version: "1.0",
    content: `# Conditions Générales de Vente

## Article 1 - Objet
Les présentes conditions générales de vente régissent les relations contractuelles entre SubChain et ses clients.

## Article 2 - Acceptation
L'acceptation des présentes conditions générales de vente est matérialisée par la validation de la commande.

## Article 3 - Prix
Les prix sont indiqués en ALGO et sont fermes et définitifs.

## Article 4 - Paiement
Le paiement s'effectue par portefeuille Algorand.

## Article 5 - Livraison
L'accès au service est immédiat après confirmation du paiement.`,
    created_at: "2024-02-01",
    updated_at: "2024-02-15",
    effective_date: null,
  },
]

const documentTypes = [
  { value: "terms", label: "Terms & Conditions" },
  { value: "privacy", label: "Privacy Policy" },
  { value: "refund", label: "Refund Policy" },
  { value: "cookie", label: "Cookie Policy" },
  { value: "acceptable_use", label: "Acceptable Use Policy" },
  { value: "other", label: "Other" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
]

const templates = {
  terms: `# Terms and Conditions

## 1. Introduction
Welcome to [Company Name]. These terms and conditions outline the rules and regulations for the use of our services.

## 2. Acceptance of Terms
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

## 3. Use License
Permission is granted to temporarily use our services for personal, non-commercial transitory viewing only.

## 4. User Responsibilities
Users are responsible for maintaining the confidentiality of their account information.

## 5. Prohibited Uses
You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.

## 6. Disclaimer
The materials on our service are provided on an 'as is' basis. We make no warranties, expressed or implied.

## 7. Limitations
In no event shall [Company Name] be liable for any damages arising out of the use of our service.

## 8. Modifications
We may revise these terms of service at any time without notice.

## 9. Contact Information
If you have any questions about these Terms, please contact us.`,

  privacy: `# Privacy Policy

## Information We Collect
We collect information you provide directly to us, such as when you create an account or contact us.

## How We Use Your Information
We use the information we collect to:
- Provide and maintain our services
- Process transactions
- Send you technical notices and support messages
- Communicate with you about products, services, and events

## Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

## Data Security
We implement appropriate security measures to protect your personal information against unauthorized access.

## Your Rights
You have the right to access, update, or delete your personal information.

## Contact Us
If you have any questions about this Privacy Policy, please contact us.`,

  refund: `# Refund Policy

## Refund Eligibility
Refunds may be requested within 30 days of purchase under the following conditions:
- Service was not delivered as promised
- Technical issues prevented service usage
- Duplicate charges occurred

## Refund Process
To request a refund:
1. Contact our support team
2. Provide your transaction details
3. Explain the reason for the refund request

## Processing Time
Refunds are typically processed within 5-10 business days.

## Non-Refundable Items
The following items are not eligible for refunds:
- Services used for more than 30 days
- Custom development work
- Third-party fees

## Contact Information
For refund requests, please contact our support team.`,
}

export default function LegalPage() {
  const [documents] = useState(mockDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    type: "terms",
    language: "en",
    content: "",
    status: "draft",
    effective_date: "",
  })

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesLanguage = languageFilter === "all" || doc.language === languageFilter
    return matchesSearch && matchesStatus && matchesLanguage
  })

  const handleCreateDocument = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Legal document created successfully",
    })
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditDocument = async () => {
    if (!selectedDocument || !formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Legal document updated successfully",
    })
    setIsEditDialogOpen(false)
    setSelectedDocument(null)
    resetForm()
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Success",
      description: "Legal document deleted successfully",
    })
  }

  const handlePublishDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to publish this document? It will become active immediately.")) {
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Success",
      description: "Document published successfully",
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      type: "terms",
      language: "en",
      content: "",
      status: "draft",
      effective_date: "",
    })
  }

  const openEditDialog = (document: any) => {
    setSelectedDocument(document)
    setFormData({
      title: document.title,
      type: document.type,
      language: document.language,
      content: document.content,
      status: document.status,
      effective_date: document.effective_date || "",
    })
    setIsEditDialogOpen(true)
  }

  const openPreviewDialog = (document: any) => {
    setSelectedDocument(document)
    setIsPreviewDialogOpen(true)
  }

  const loadTemplate = (type: string) => {
    const template = templates[type as keyof typeof templates]
    if (template) {
      setFormData((prev) => ({ ...prev, content: template }))
      toast({
        title: "Template Loaded",
        description: `${type} template has been loaded`,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      draft: "secondary",
      archived: "outline",
    } as const

    const icons = {
      active: CheckCircle,
      draft: Clock,
      archived: AlertCircle,
    }

    const Icon = icons[status as keyof typeof icons] || Clock

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    return documentTypes.find((t) => t.value === type)?.label || type
  }

  const getLanguageLabel = (language: string) => {
    return languages.find((l) => l.value === language)?.label || language
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legal Documents</h1>
          <p className="text-muted-foreground">Manage your terms, privacy policy, and other legal documents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">Legal documents</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.filter((d) => d.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Published & active</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Documents</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.filter((d) => d.status === "draft").length}</div>
              <p className="text-xs text-muted-foreground">Pending publication</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(documents.map((d) => d.language)).size}</div>
              <p className="text-xs text-muted-foreground">Supported languages</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Filters and Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
            <CardDescription>
              {filteredDocuments.length} document{filteredDocuments.length > 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.title}</div>
                        <div className="text-sm text-muted-foreground">ID: {document.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(document.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                        {getLanguageLabel(document.language)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">v{document.version}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                    <TableCell>
                      {document.effective_date ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {new Date(document.effective_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(document.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreviewDialog(document)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(document)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {document.status === "draft" && (
                            <DropdownMenuItem onClick={() => handlePublishDocument(document.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteDocument(document.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No documents found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Document Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Legal Document</DialogTitle>
            <DialogDescription>Create a new legal document for your platform</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Document Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Terms and Conditions"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Document Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="language">Language *</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate("terms")}
                    disabled={formData.type !== "terms"}
                  >
                    Load Terms Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate("privacy")}
                    disabled={formData.type !== "privacy"}
                  >
                    Load Privacy Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate("refund")}
                    disabled={formData.type !== "refund"}
                  >
                    Load Refund Template
                  </Button>
                </div>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your document content here... (Markdown supported)"
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can use Markdown formatting. Use [Company Name] as a placeholder for your company name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument}>Create Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Legal Document</DialogTitle>
            <DialogDescription>Edit your legal document</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Document Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Terms and Conditions"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Document Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-language">Language *</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-effective_date">Effective Date</Label>
                <Input
                  id="edit-effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your document content here... (Markdown supported)"
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can use Markdown formatting. Use [Company Name] as a placeholder for your company name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDocument}>Update Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Document Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedDocument?.title}</span>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedDocument?.status || "draft")}
                <Badge variant="outline">v{selectedDocument?.version}</Badge>
              </div>
            </DialogTitle>
            <DialogDescription>
              {getTypeLabel(selectedDocument?.type || "")} • {getLanguageLabel(selectedDocument?.language || "")}
              {selectedDocument?.effective_date && (
                <span> • Effective: {new Date(selectedDocument.effective_date).toLocaleDateString()}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {selectedDocument?.content || "No content available"}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {selectedDocument && (
              <Button onClick={() => openEditDialog(selectedDocument)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Document
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
