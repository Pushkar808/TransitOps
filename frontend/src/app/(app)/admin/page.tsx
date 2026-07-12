'use client';

import * as React from 'react';
import { CheckCircle, XCircle, Clock, Users, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { RegistrationRequest, RequestStatus } from '@/lib/types';
import { formatDate, formatStatus } from '@/lib/format';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type StatusFilter = '' | RequestStatus;

const STATUS_BADGE: Record<RequestStatus, 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
};

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect non-admins
  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  const [requests, setRequests] = React.useState<RegistrationRequest[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('');
  const [loading, setLoading] = React.useState(true);
  const [rejectModal, setRejectModal] = React.useState<RegistrationRequest | null>(null);
  const [rejectNote, setRejectNote] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get<RegistrationRequest[]>(`/admin/requests${params}`);
      setRequests(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const approve = async (req: RegistrationRequest) => {
    setActionLoading(req.id);
    try {
      await api.post(`/admin/requests/${req.id}/approve`);
      toast.success(`${req.name}'s account has been created.`);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const openReject = (req: RegistrationRequest) => {
    setRejectModal(req);
    setRejectNote('');
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      await api.post(`/admin/requests/${rejectModal.id}/reject`, { note: rejectNote });
      toast.success(`Request from ${rejectModal.name} rejected.`);
      setRejectModal(null);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  // Stats
  const pending = requests.filter((r) => r.status === 'PENDING').length;
  const approved = requests.filter((r) => r.status === 'APPROVED').length;
  const rejected = requests.filter((r) => r.status === 'REJECTED').length;

  const ALL_STATUSES: { value: StatusFilter; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div>
      <PageHeader title="Access Requests" description="Review and manage user registration requests">
        <Button
          onClick={load}
          variant="outline"
          className="flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        {[
          { label: 'Pending Review', value: pending, icon: Clock, color: 'text-amber-400' },
          { label: 'Approved', value: approved, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl p-5 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white/90 leading-none">{value}</p>
              <p className="mt-1 text-xs text-white/38">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {ALL_STATUSES.map(({ value, label }) => (
          <Button
            key={value}
            onClick={() => setStatusFilter(value)}
            variant={statusFilter === value ? 'default' : 'outline'}
            className="rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Role Requested</TableHead>
                <TableHead>Driver Details</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Review Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
                      <p className="text-xs text-white/30">Loading requests...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <p className="font-medium text-white/90">{req.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{req.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatStatus(req.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      {req.role === 'DRIVER' && req.licenseNo ? (
                        <div className="text-xs text-white/55 space-y-0.5">
                          <p>{req.licenseNo} · {req.licenseCategory}</p>
                          {req.licenseExpiry && <p>Exp: {formatDate(req.licenseExpiry)}</p>}
                          {req.contact && <p>{req.contact}</p>}
                        </div>
                      ) : (
                        <span className="text-white/25 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white/55 text-xs">{formatDate(req.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[req.status]}>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-white/45 max-w-[140px] truncate">
                      {req.reviewNote || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'PENDING' && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            onClick={() => approve(req)}
                            disabled={actionLoading === req.id}
                            title="Approve"
                            variant="ghost"
                            size="icon"
                            className="text-emerald-400 hover:bg-emerald-500/15"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => openReject(req)}
                            disabled={actionLoading === req.id}
                            title="Reject"
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:bg-red-500/15"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <Users className="h-8 w-8 text-white/15 mx-auto mb-2" />
                    <p className="text-sm text-white/30">No requests found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title={`Reject — ${rejectModal?.name}`}
        description="Optionally provide a reason for rejection. The request will be marked as rejected."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Rejection Note (optional)</Label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Incomplete information, invalid license number..."
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/25 outline-none resize-none transition-all duration-200 focus:border-white/25"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setRejectModal(null)}
              variant="outline"
              className="flex-1 rounded-lg py-2.5 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!!actionLoading}
              variant="destructive"
              className="flex-1 rounded-lg py-2.5 text-sm font-medium"
            >
              {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
