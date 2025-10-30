"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSubscriptionPlans, useSubscriptionsList, useTransactions, useInvoices } from "@/hooks/use-django-api"
import { RefreshCcw, DollarSign, Users, FileText, Activity, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const {
    plans,
    loading: plansLoading,
    refetch: refetchPlans,
  } = useSubscriptionPlans()
  const {
    subscriptions,
    loading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useSubscriptionsList({ page_size: 10 })
  const {
    transactions,
    loading: transactionsLoading,
    fetchPayments,
  } = useTransactions()
  const {
    invoices,
    loading: invoicesLoading,
    refetch: refetchInvoices,
  } = useInvoices({ page_size: 5 })

  const metrics = useMemo(() => {
    const completedTransactions = transactions.filter((trx) => trx.status === "completed")
    const totalRevenue = completedTransactions.reduce((sum, trx) => sum + Number(trx.amount), 0)
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length
    const pendingInvoices = invoices.filter((invoice) => invoice.status !== "paid").length

    return {
      totalRevenue,
      activeSubscriptions,
      plansCount: plans.length,
      pendingInvoices,
    }
  }, [transactions, subscriptions, invoices, plans.length])

  const latestTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime())
        .slice(0, 5),
    [transactions],
  )

  const latestInvoices = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime())
        .slice(0, 5),
    [invoices],
  )

  const isLoading = plansLoading || subscriptionsLoading || transactionsLoading || invoicesLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your subscriptions, payments and invoices pulled directly from the backend.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchPlans()} disabled={plansLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Plans
          </Button>
          <Button variant="outline" onClick={() => refetchSubscriptions()} disabled={subscriptionsLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Subscriptions
          </Button>
          <Button variant="outline" onClick={() => fetchPayments()} disabled={transactionsLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Payments
          </Button>
          <Button variant="outline" onClick={() => refetchInvoices()} disabled={invoicesLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Invoices
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Current active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active plans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.plansCount}</div>
            <p className="text-xs text-muted-foreground">Available for checkout</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Refreshing data from the backend…
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest transactions</CardTitle>
            <CardDescription>Most recent payment activity for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No transactions received yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {latestTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>
                        {Number(transaction.amount).toFixed(2)} {transaction.currency}
                      </TableCell>
                      <TableCell className="capitalize">{transaction.status}</TableCell>
                      <TableCell>
                        {transaction.created_at ? new Date(transaction.created_at).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
            <CardDescription>Track invoices awaiting payment or already settled.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No invoice generated yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {latestInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        {Number(invoice.total_amount ?? 0).toFixed(2)} {invoice.currency}
                      </TableCell>
                      <TableCell className="capitalize">{invoice.status}</TableCell>
                      <TableCell>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
