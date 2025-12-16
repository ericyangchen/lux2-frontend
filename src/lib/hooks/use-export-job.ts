import { useState, useEffect, useCallback, useRef } from 'react';
import { ApplicationError } from '@/lib/error/applicationError';
import { useToast } from '@/components/shadcn/ui/use-toast';

export interface JobStatus {
  jobId: string;
  userId: string;
  jobType: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number; // 0-100
  progressMessage: string | null;
  gcsUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

interface UseExportJobOptions {
  jobId: string | null;
  onComplete?: (gcsUrl: string) => void;
  onError?: (error: string) => void;
  pollInterval?: number; // milliseconds
  fetchJobStatus: (jobId: string) => Promise<Response>;
}

export function useExportJob({
  jobId,
  onComplete,
  onError,
  pollInterval = 2000, // Poll every 2 seconds
  fetchJobStatus,
}: UseExportJobOptions) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const activeJobIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  const pollJobStatus = useCallback(async () => {
    const idToPoll = activeJobIdRef.current || jobId;
    if (!idToPoll) return;

    try {
      const response = await fetchJobStatus(idToPoll);

      if (!response.ok) {
        throw new ApplicationError({
          message: 'Failed to fetch job status',
        });
      }

      const data: JobStatus = await response.json();
      setJobStatus(data);

      // Handle completion
      if (data.status === 'COMPLETED') {
        setIsPolling(false);
        activeJobIdRef.current = null;
        if (data.gcsUrl) {
          onComplete?.(data.gcsUrl);
        }
      } else if (data.status === 'FAILED') {
        setIsPolling(false);
        activeJobIdRef.current = null;
        const errorMsg = data.error || 'Export job failed';
        onError?.(errorMsg);
        toast({
          title: '匯出失敗',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      // Continue polling for PENDING and PROCESSING
    } catch (error) {
      console.error('Error polling job status:', error);
      setIsPolling(false);
      activeJobIdRef.current = null;
      const errorMsg =
        error instanceof ApplicationError
          ? error.message
          : 'Failed to check export status';
      onError?.(errorMsg);
    }
  }, [jobId, fetchJobStatus, onComplete, onError, toast]);

  // Sync ref when jobId prop changes
  useEffect(() => {
    if (jobId && !activeJobIdRef.current) {
      activeJobIdRef.current = jobId;
    }
  }, [jobId]);

  useEffect(() => {
    // Use activeJobIdRef if set, otherwise fall back to jobId prop
    const idToPoll = activeJobIdRef.current || jobId;
    if (!idToPoll || !isPolling) return;

    // Poll immediately
    pollJobStatus();

    // Set up interval polling
    const interval = setInterval(() => {
      pollJobStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [jobId, isPolling, pollInterval, pollJobStatus]);

  const startPolling = useCallback(
    (overrideJobId?: string) => {
      const idToUse = overrideJobId || jobId;
      if (idToUse) {
        // Store the jobId in ref so polling can use it immediately
        activeJobIdRef.current = idToUse;
        // Initialize with pending status immediately so UI shows right away
        setJobStatus({
          jobId: idToUse,
          userId: '',
          jobType: '',
          status: 'PENDING',
          progress: 0,
          progressMessage: '正在初始化匯出工作...',
          gcsUrl: null,
          error: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
        });
        setIsPolling(true);
      }
    },
    [jobId],
  );

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const downloadFile = useCallback((url: string, filename?: string) => {
    // GCS URLs are public, we can download directly
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.xlsx';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    jobStatus,
    isPolling,
    startPolling,
    stopPolling,
    downloadFile,
  };
}

