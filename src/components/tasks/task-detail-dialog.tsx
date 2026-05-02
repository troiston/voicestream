"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  AlignLeft,
  Archive,
  Calendar,
  Check,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  updateTask,
  archiveTask,
  addComment,
  deleteComment,
  addChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  presignAttachmentUpload,
  confirmAttachment,
  deleteAttachment,
} from "@/features/tasks/actions";
import { LabelsPopover, type LabelItem } from "@/components/tasks/labels-popover";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChecklistItemData {
  id: string;
  text: string;
  done: boolean;
  order: number;
}

export interface ChecklistData {
  id: string;
  title: string;
  order: number;
  items: ChecklistItemData[];
}

export interface CommentData {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
}

export interface AttachmentData {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface TaskDetailData {
  id: string;
  title: string;
  description: string;
  dueAt: string | null;
  archivedAt: string | null;
  spaceId: string;
  labels: { label: LabelItem }[];
  checklists: ChecklistData[];
  comments: CommentData[];
  attachments: AttachmentData[];
}

interface TaskDetailDialogProps {
  open: boolean;
  onClose: () => void;
  task: TaskDetailData;
  spaceLabels: LabelItem[];
  currentUserId: string;
}

// ---------------------------------------------------------------------------
// Color map
// ---------------------------------------------------------------------------

const COLOR_BG: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  gray: "bg-gray-400",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InlineTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  return editing ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
      }}
      className="text-lg font-bold w-full bg-transparent border-b border-primary outline-none"
      autoFocus
      aria-label="Editar título da tarefa"
    />
  ) : (
    <button
      type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className="text-lg font-bold text-left w-full hover:opacity-80 transition-opacity"
      aria-label={`Título: ${value}. Clique para editar.`}
    >
      {value}
    </button>
  );
}

function DescriptionField({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [isPending, startTransition] = useTransition();

  const handleBlur = () => {
    if (draft !== value) {
      startTransition(async () => {
        await onSave(draft);
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <AlignLeft className="size-4" />
        Descrição
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        placeholder="Adicionar descrição…"
        rows={3}
        disabled={isPending}
        aria-label="Descrição da tarefa"
        className="resize-y"
      />
    </div>
  );
}

function ChecklistSection({
  taskId,
  checklists: initialChecklists,
}: {
  taskId: string;
  checklists: ChecklistData[];
}) {
  const [checklists, setChecklists] = useState(initialChecklists);
  const [addingTitle, setAddingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleAddChecklist = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await addChecklist({ taskId, title: trimmed });
      if (result.ok) {
        setChecklists([...checklists, result.checklist as ChecklistData]);
        setNewTitle("");
        setAddingTitle(false);
      }
    });
  };

  const handleAddItem = (checklistId: string) => {
    const text = (newItemTexts[checklistId] ?? "").trim();
    if (!text) return;
    startTransition(async () => {
      const result = await addChecklistItem({ checklistId, text });
      if (result.ok) {
        setChecklists(
          checklists.map((c) =>
            c.id === checklistId
              ? { ...c, items: [...c.items, result.item as ChecklistItemData] }
              : c,
          ),
        );
        setNewItemTexts({ ...newItemTexts, [checklistId]: "" });
      }
    });
  };

  const handleToggle = (checklistId: string, itemId: string) => {
    startTransition(async () => {
      await toggleChecklistItem(itemId);
      setChecklists(
        checklists.map((c) =>
          c.id === checklistId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.id === itemId ? { ...i, done: !i.done } : i,
                ),
              }
            : c,
        ),
      );
    });
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    startTransition(async () => {
      await deleteChecklistItem(itemId);
      setChecklists(
        checklists.map((c) =>
          c.id === checklistId
            ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
            : c,
        ),
      );
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckSquare className="size-4" />
          Checklists
        </div>
        <button
          type="button"
          onClick={() => setAddingTitle(true)}
          className="text-xs text-primary hover:opacity-70"
          aria-label="Adicionar checklist"
        >
          + Adicionar checklist
        </button>
      </div>

      {checklists.map((cl) => {
        const done = cl.items.filter((i) => i.done).length;
        const total = cl.items.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div key={cl.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium flex-1">{cl.title}</span>
              <span className="text-xs text-muted-foreground">
                {done}/{total}
              </span>
            </div>
            {total > 0 && (
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    pct === 100 ? "bg-success" : "bg-primary",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            <div className="space-y-1">
              {cl.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group/item">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleToggle(cl.id, item.id)}
                    className="size-4 accent-primary"
                    aria-label={item.text}
                    disabled={isPending}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      item.done && "line-through text-muted-foreground",
                    )}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(cl.id, item.id)}
                    className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label={`Remover item: ${item.text}`}
                    disabled={isPending}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {/* Add item input */}
            <div className="flex items-center gap-2 pl-6">
              <input
                value={newItemTexts[cl.id] ?? ""}
                onChange={(e) =>
                  setNewItemTexts({ ...newItemTexts, [cl.id]: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddItem(cl.id);
                }}
                placeholder="+ Adicionar item"
                className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none py-0.5 transition-colors"
                aria-label={`Adicionar item em ${cl.title}`}
                disabled={isPending}
              />
            </div>
          </div>
        );
      })}

      {addingTitle && (
        <div className="space-y-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChecklist();
              if (e.key === "Escape") { setAddingTitle(false); setNewTitle(""); }
            }}
            placeholder="Título da checklist"
            className="w-full text-sm bg-transparent border-b border-primary outline-none py-0.5"
            aria-label="Título da nova checklist"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleAddChecklist}
              isLoading={isPending}
              loadingLabel="A criar…"
              disabled={!newTitle.trim()}
            >
              Adicionar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => { setAddingTitle(false); setNewTitle(""); }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentsSection({
  taskId,
  comments: initialComments,
  currentUserId,
}: {
  taskId: string;
  comments: CommentData[];
  currentUserId: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await addComment({ taskId, body: trimmed });
      if (result.ok) {
        const c = result.comment;
        setComments([...comments, { ...c, createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt) } as CommentData]);
        setBody("");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteComment(id);
      setComments(comments.filter((c) => c.id !== id));
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquare className="size-4" />
        Comentários
      </div>

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2 group/comment">
            <div className="size-7 rounded-full bg-surface-2 flex items-center justify-center text-xs font-semibold shrink-0 uppercase">
              {c.author.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{c.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                </span>
                {c.authorId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="ml-auto opacity-0 group-hover/comment:opacity-100 text-muted-foreground hover:text-destructive transition-opacity text-xs"
                    aria-label="Eliminar comentário"
                    disabled={isPending}
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words mt-0.5">
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Escrever comentário… (Enter para enviar)"
          rows={2}
          disabled={isPending}
          aria-label="Novo comentário"
          className="flex-1 resize-none"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAdd}
          isLoading={isPending}
          loadingLabel="…"
          disabled={!body.trim()}
          aria-label="Enviar comentário"
          className="self-end"
        >
          <Check className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function AttachmentsSection({
  taskId,
  attachments: initialAttachments,
}: {
  taskId: string;
  attachments: AttachmentData[];
}) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const presign = await presignAttachmentUpload({
        taskId,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      });
      if (!presign.ok) return;

      await fetch(presign.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      const confirm = await confirmAttachment({
        taskId,
        key: presign.key,
        filename: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      });
      if (confirm.ok) {
        setAttachments([
          ...attachments,
          {
            id: confirm.attachment.id,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            url: presign.url.split("?")[0], // approximate; refresh dialog for signed URL
            uploadedAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAttachment(id);
      setAttachments(attachments.filter((a) => a.id !== id));
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Paperclip className="size-4" />
          Anexos
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-primary hover:opacity-70 disabled:opacity-50"
          aria-label="Adicionar anexo"
        >
          {uploading ? "A enviar…" : "+ Adicionar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Ficheiro a anexar"
          tabIndex={-1}
        />
      </div>

      {attachments.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {attachments.map((a) => (
          <div
            key={a.id}
            className="group/att relative rounded-[var(--radius-md)] border border-border/40 bg-surface-2 p-2 text-xs"
          >
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-primary hover:underline font-medium"
              title={a.filename}
            >
              {a.filename}
            </a>
            <span className="text-muted-foreground">{formatSize(a.size)}</span>
            <button
              type="button"
              onClick={() => handleDelete(a.id)}
              disabled={isPending}
              className="absolute top-1 right-1 opacity-0 group-hover/att:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              aria-label={`Remover ${a.filename}`}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dialog
// ---------------------------------------------------------------------------

export function TaskDetailDialog({
  open,
  onClose,
  task,
  spaceLabels,
  currentUserId,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(
    task.dueAt ? task.dueAt.split("T")[0] : "",
  );
  const [archived, setArchived] = useState(!!task.archivedAt);
  const [taskLabels, setTaskLabels] = useState<LabelItem[]>(
    task.labels.map((tl) => tl.label),
  );
  const [isPending, startTransition] = useTransition();

  // Sync state when task id changes (different task opened)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setTitle(task.title);
    setDueDate(task.dueAt ? task.dueAt.split("T")[0] : "");
    setArchived(!!task.archivedAt);
    setTaskLabels(task.labels.map((tl) => tl.label));
  }, [task.id]); // intentionally keyed on id only to avoid infinite loops

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    startTransition(async () => {
      await updateTask({ id: task.id, title: newTitle });
    });
  };

  const handleDescriptionSave = async (description: string) => {
    await updateTask({ id: task.id, description });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);
    startTransition(async () => {
      await updateTask({ id: task.id, dueDate: val || null });
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveTask(task.id);
      setArchived(true);
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className={cn(
          "max-w-3xl w-full p-0 overflow-hidden",
          "max-h-[90vh] flex flex-col",
          "md:max-h-[85vh]",
        )}
        aria-labelledby="task-detail-title"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/40 shrink-0">
          <div className="flex items-start gap-3">
            {/* Label chips */}
            {taskLabels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {taskLabels.map((l) => (
                  <span
                    key={l.id}
                    title={l.name}
                    className={cn(
                      "h-2 w-8 rounded-full",
                      COLOR_BG[l.color] ?? "bg-gray-400",
                    )}
                    aria-label={l.name}
                  />
                ))}
              </div>
            )}
          </div>
          <DialogTitle id="task-detail-title" className="sr-only">
            {title}
          </DialogTitle>
          <InlineTitle value={title} onChange={handleTitleChange} />
          {archived && (
            <Badge variant="muted" className="w-fit text-xs">
              Arquivada
            </Badge>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <DescriptionField
              value={task.description}
              onSave={handleDescriptionSave}
            />
            <ChecklistSection
              taskId={task.id}
              checklists={task.checklists}
            />
            <CommentsSection
              taskId={task.id}
              comments={task.comments}
              currentUserId={currentUserId}
            />
            <AttachmentsSection
              taskId={task.id}
              attachments={task.attachments}
            />
          </div>

          {/* Sidebar */}
          <div className="md:w-52 shrink-0 border-t md:border-t-0 md:border-l border-border/40 px-4 py-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Ações
            </p>

            {/* Labels popover */}
            <LabelsPopover
              taskId={task.id}
              spaceId={task.spaceId}
              spaceLabels={spaceLabels}
              taskLabels={taskLabels}
              onLabelsChange={setTaskLabels}
            />

            {/* Due date */}
            <div className="space-y-1">
              <label
                htmlFor="task-due-date"
                className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
              >
                <Calendar className="size-4" />
                Prazo
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                disabled={isPending}
                className="w-full text-sm h-8 px-2 rounded-[var(--radius-md)] border border-input bg-transparent outline-none focus:ring-2 focus:ring-ring/50"
                aria-label="Data de vencimento"
              />
            </div>

            {/* Separator + Archive */}
            <div className="pt-3 border-t border-border/40 mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleArchive}
                isLoading={isPending}
                loadingLabel="A arquivar…"
                disabled={archived || isPending}
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                aria-label="Arquivar tarefa"
              >
                <Archive className="size-4" />
                Arquivar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
