"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, CheckCircle2, AlertCircle, PauseCircle } from "lucide-react"
import { useTransactions } from "@/hooks/use-django-api"

const statusConfig: Record<
  string,
  {
    label: string
    badge: "default" | "secondary" | "destructive"
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  completed: { label: "Completed", badge: "default", icon: CheckCircle2 },
  pending: { label: "Pending", badge: "secondary", icon: PauseCircle },
  failed: { label: "Failed", badge: "destructive", icon: AlertCircle },
  refunded: { label: "Refunded", badge: "secondary", icon: RefreshCw },
}

export default function PaymentsPage() {
  const {
    transactions,
    loading,
    error,
    fetchPayments,
  } = useTransactions()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = [transaction.id, transaction.type, transaction.currency, transaction.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [transactions, searchTerm, statusFilter])

  const totals = useMemo(() => {
    const completed = filteredTransactions.filter((trx) => trx.status === "completed")
    const totalRevenue = completed.reduce((sum, trx) => sum + Number(trx.amount), 0)
    const successRate =
      filteredTransactions.length === 0
        ? 0
        : (completed.length / filteredTransactions.length) * 100

    return {
      totalRevenue,
      count: filteredTransactions.length,
      successRate,
    }
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Monitor all transactions processed through the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchPayments()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{filteredTransactions.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed volume</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{totals.totalRevenue.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success rate</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{totals.successRate.toFixed(1)}%</CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to load payments</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => fetchPayments()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Search by reference, status or currency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Loading transactions…
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No transaction matches your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredTransactions.map((transaction) => {
                  const config = statusConfig[transaction.status] ?? statusConfig.pending
                  const Icon = config.icon
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.id}</span>
                          <span className="text-xs text-muted-foreground">{transaction.algo_tx_id ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell className="font-medium">
                        {Number(transaction.amount).toFixed(2)} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.badge} className="flex items-center gap-1 capitalize">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{transaction.created_at ? new Date(transaction.created_at).toLocaleString() : "—"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
