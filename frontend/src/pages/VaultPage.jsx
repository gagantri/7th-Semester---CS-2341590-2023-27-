import { useEffect, useState } from 'react';
import { FolderLock, Upload, Trash2, Download, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { api, humanError } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { EmptyState } from '@/components/common/State';
import { TEST_IDS } from '@/constants/testIds';

const DOC_TYPES = [
  { value: 'lab_report', label: 'Lab report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'discharge_summary', label: 'Discharge summary' },
  { value: 'imaging', label: 'Imaging (X-ray/MRI/CT)' },
  { value: 'bill', label: 'Hospital bill' },
  { value: 'other', label: 'Other' },
];

function docTypeLabel(t) {
  return DOC_TYPES.find((d) => d.value === t)?.label || t;
}

export default function VaultPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);

  const load = async (docType) => {
    setLoading(true);
    try {
      const params = {};
      if (docType && docType !== 'all') params.doc_type = docType;
      const { data } = await api.get('/vault/documents', { params });
      setItems(data);
    } catch (err) {
      toast.error(humanError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const remove = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/vault/documents/${docId}`);
      toast.success('Document deleted');
      setItems((cur) => cur.filter((d) => d.doc_id !== docId));
    } catch (err) {
      toast.error(humanError(err));
    }
  };

  const download = async (docId) => {
    try {
      const { data } = await api.get(`/vault/documents/${docId}`);
      if (!data?.content_base64) {
        toast.error('Document not available.');
        return;
      }
      const link = document.createElement('a');
      link.href = `data:${data.mime_type};base64,${data.content_base64}`;
      link.download = data.file_name || 'document';
      link.click();
    } catch (err) {
      toast.error(humanError(err));
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <FolderLock className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Health Records Vault</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
            Your documents, encrypted and yours.
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
            Lab reports, prescriptions, discharge summaries, imaging. Only you
            can access these. ABDM linking coming soon.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10">
              <Upload className="mr-1.5 h-4 w-4" /> Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload a document</DialogTitle>
            </DialogHeader>
            <UploadForm
              onDone={() => {
                setOpen(false);
                load(filter);
              }}
            />
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-muted-foreground">Filter:</div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All documents</SelectItem>
            {DOC_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No records yet"
          description="Upload your first document. We’ll organize it by type and family member."
          action={
            <Button onClick={() => setOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" /> Upload first document
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <motion.div
              key={d.doc_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              data-testid={TEST_IDS.vault.docItem}
            >
              <Card className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="pt-4 pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{d.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {d.file_name}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {docTypeLabel(d.doc_type)}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatDateTime(d.created_at)} · {(d.size_bytes / 1024).toFixed(0)} KB
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => download(d.doc_id)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(d.doc_id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadForm({ onDone }) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('lab_report');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error('File too large (max 8 MB).');
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Choose a file.');
      return;
    }
    setLoading(true);
    try {
      const b64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          const raw = r.result;
          resolve(String(raw).split(',')[1] || '');
        };
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      await api.post('/vault/documents', {
        title: title || file.name,
        doc_type: docType,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        content_base64: b64,
      });
      toast.success('Uploaded');
      onDone?.();
    } catch (err) {
      toast.error(humanError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-1.5">
        <Label htmlFor="vaultTitle">Title</Label>
        <Input
          id="vaultTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., Lab report — Mar 2026"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="file">File (max 8 MB)</Label>
        <Input
          id="file"
          type="file"
          onChange={onFile}
          accept="application/pdf,image/*,text/*"
          data-testid={TEST_IDS.vault.uploadInput}
        />
        {file && (
          <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> {file.name} ·{' '}
            {(file.size / 1024).toFixed(0)} KB
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-destructive"
              aria-label="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <Button
        type="submit"
        className="w-full h-10"
        disabled={loading}
        data-testid={TEST_IDS.vault.uploadSubmit}
      >
        {loading ? 'Uploading…' : 'Upload document'}
      </Button>
    </form>
  );
}
