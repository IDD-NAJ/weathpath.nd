"use client"

import { useTransition, useState } from "react"
import { Check, X, Clock, Eye, EyeOff, FileText, Star, BookOpen, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { updateContentStatus } from "@/app/actions/approval"

type ContentType = "articles" | "success_stories" | "learning_paths"

interface PendingContent {
  articles: Record<string, string>[]
  stories: Record<string, string>[]
  paths: Record<string, string>[]
  total: number
}

interface AllContent {
  articles: Record<string, string>[]
  stories: Record<string, string>[]
  paths: Record<string, string>[]
}

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="gap-1 bg-primary/10 text-primary border-primary/20"><Eye className="h-3 w-3" />Approved</Badge>
    case "pending":
      return <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:bg-amber-950"><Clock className="h-3 w-3" />Pending</Badge>
    case "rejected":
      return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Rejected</Badge>
    default:
      return <Badge variant="secondary" className="gap-1"><EyeOff className="h-3 w-3" />Draft</Badge>
  }
}

export function ApprovalsManager({
  pending,
  allContent,
}: {
  pending: PendingContent
  allContent: AllContent
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmAction, setConfirmAction] = useState<{
    table: ContentType
    id: string
    status: string
    name: string
  } | null>(null)

  function handleStatusChange(table: ContentType, id: string, status: string, name: string) {
    if (status === "approved" || status === "rejected") {
      setConfirmAction({ table, id, status, name })
    } else {
      startTransition(async () => {
        await updateContentStatus(table, id, status)
      })
    }
  }

  function confirmStatusChange() {
    if (!confirmAction) return
    startTransition(async () => {
      await updateContentStatus(confirmAction.table, confirmAction.id, confirmAction.status)
      setConfirmAction(null)
    })
  }

  return (
    <>
      {/* Pending review queue */}
      {pending.total > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-800 dark:text-amber-200">
                {pending.total} item{pending.total !== 1 ? "s" : ""} awaiting review
              </span>
            </CardTitle>
            <CardDescription className="text-amber-700/80 dark:text-amber-400/70">
              Content submitted for approval that needs your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {pending.articles.map((item) => (
                <PendingRow
                  key={item.id}
                  icon={<FileText className="h-4 w-4" />}
                  typeLabel="Article"
                  title={item.title}
                  subtitle={item.category || item.slug}
                  date={item.created_at}
                  onApprove={() => handleStatusChange("articles", item.id, "approved", item.title)}
                  onReject={() => handleStatusChange("articles", item.id, "rejected", item.title)}
                  isPending={isPending}
                />
              ))}
              {pending.stories.map((item) => (
                <PendingRow
                  key={item.id}
                  icon={<Star className="h-4 w-4" />}
                  typeLabel="Story"
                  title={`${item.name} - ${item.title}`}
                  subtitle={item.strategy || ""}
                  date={item.created_at}
                  onApprove={() => handleStatusChange("success_stories", item.id, "approved", item.name)}
                  onReject={() => handleStatusChange("success_stories", item.id, "rejected", item.name)}
                  isPending={isPending}
                />
              ))}
              {pending.paths.map((item) => (
                <PendingRow
                  key={item.id}
                  icon={<BookOpen className="h-4 w-4" />}
                  typeLabel="Path"
                  title={item.title}
                  subtitle={item.level || ""}
                  date={item.created_at}
                  onApprove={() => handleStatusChange("learning_paths", item.id, "approved", item.title)}
                  onReject={() => handleStatusChange("learning_paths", item.id, "rejected", item.title)}
                  isPending={isPending}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full content management table */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Articles ({allContent.articles.length})
          </TabsTrigger>
          <TabsTrigger value="stories" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />
            Stories ({allContent.stories.length})
          </TabsTrigger>
          <TabsTrigger value="paths" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Paths ({allContent.paths.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <ContentTable
            items={allContent.articles}
            columns={["Title", "Category", "Status", "Created", "Action"]}
            table="articles"
            onStatusChange={handleStatusChange}
            isPending={isPending}
            renderRow={(item) => (
              <>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">/{item.slug}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.category ? <Badge variant="outline">{item.category}</Badge> : <span className="text-muted-foreground">--</span>}
                </TableCell>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="stories">
          <ContentTable
            items={allContent.stories}
            columns={["Person", "Title", "Status", "Created", "Action"]}
            table="success_stories"
            onStatusChange={handleStatusChange}
            isPending={isPending}
            renderRow={(item) => (
              <>
                <TableCell>
                  <span className="font-medium text-foreground">{item.name}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.title}</TableCell>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="paths">
          <ContentTable
            items={allContent.paths}
            columns={["Title", "Level", "Status", "Created", "Action"]}
            table="learning_paths"
            onStatusChange={handleStatusChange}
            isPending={isPending}
            renderRow={(item) => (
              <>
                <TableCell>
                  <span className="font-medium text-foreground">{item.title}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.level}</Badge>
                </TableCell>
              </>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.status === "approved" ? "Approve Content" : "Reject Content"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.status === "approved"
                ? <>Are you sure you want to approve <strong>{confirmAction?.name}</strong>? It will become publicly visible on the website.</>
                : <>Are you sure you want to reject <strong>{confirmAction?.name}</strong>? It will be hidden from the public website.</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={confirmAction?.status === "rejected" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {confirmAction?.status === "approved" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function PendingRow({
  icon,
  typeLabel,
  title,
  subtitle,
  date,
  onApprove,
  onReject,
  isPending,
}: {
  icon: React.ReactNode
  typeLabel: string
  title: string
  subtitle: string
  date: string
  onApprove: () => void
  onReject: () => void
  isPending: boolean
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg border border-amber-200 bg-background px-4 py-3 dark:border-amber-800 ${isPending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {typeLabel}
            </Badge>
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {subtitle && <span>{subtitle}</span>}
            {date && <span>{new Date(date).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1 text-destructive hover:text-destructive"
          onClick={onReject}
          disabled={isPending}
        >
          <X className="h-3.5 w-3.5" />
          Reject
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1"
          onClick={onApprove}
          disabled={isPending}
        >
          <Check className="h-3.5 w-3.5" />
          Approve
        </Button>
      </div>
    </div>
  )
}

function ContentTable({
  items,
  columns,
  table,
  onStatusChange,
  isPending,
  renderRow,
}: {
  items: Record<string, string>[]
  columns: string[]
  table: ContentType
  onStatusChange: (table: ContentType, id: string, status: string, name: string) => void
  isPending: boolean
  renderRow: (item: Record<string, string>) => React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">
                No content found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className={isPending ? "opacity-60" : ""}>
                {renderRow(item)}
                <TableCell>{statusBadge(item.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={item.status || "draft"}
                    onValueChange={(val) => onStatusChange(table, item.id, val, item.title || item.name)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
