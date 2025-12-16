import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../shadcn/ui/alert';
import { JobStatus } from '../../lib/hooks/use-export-job';
import { Progress } from '../shadcn/ui/progress';
import * as React from 'react';

interface ExportJobStatusProps {
  jobStatus: JobStatus | null;
  onDownload?: (url: string) => void;
}

export function ExportJobStatus({
  jobStatus,
  onDownload,
}: ExportJobStatusProps) {
  // Show loading state if jobStatus is null but component is rendered
  // (means job was just created and polling hasn't started yet)
  if (!jobStatus) {
    return (
      <Alert className="mt-4 rounded-none border-gray-200">
        <div className="flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">等待中</span>
            </div>
            <p className="text-sm text-gray-600">正在初始化匯出工作...</p>
          </div>
        </div>
      </Alert>
    );
  }

  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PROCESSING':
      case 'PENDING':
        return <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (jobStatus.status) {
      case 'COMPLETED':
        return '匯出完成';
      case 'FAILED':
        return '匯出失敗';
      case 'PROCESSING':
        return '處理中';
      case 'PENDING':
        return '等待中';
      default:
        return '未知狀態';
    }
  };

  return (
    <Alert className="mt-4 rounded-none border-gray-200">
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{getStatusText()}</span>
            {jobStatus.status === 'PROCESSING' && (
              <span className="text-sm text-gray-500">
                {jobStatus.progress}%
              </span>
            )}
          </div>

          {jobStatus.progressMessage && (
            <p className="text-sm text-gray-600">{jobStatus.progressMessage}</p>
          )}

          {jobStatus.status === 'PROCESSING' && (
            <Progress value={jobStatus.progress} className="h-2 rounded-none" />
          )}

          {jobStatus.status === 'COMPLETED' &&
            jobStatus.gcsUrl &&
            onDownload && (
              <button
                onClick={() => onDownload(jobStatus.gcsUrl!)}
                className="text-sm text-gray-900 hover:text-gray-700 underline"
              >
                下載檔案
              </button>
            )}

          {jobStatus.status === 'FAILED' && jobStatus.error && (
            <AlertDescription className="text-red-600 mt-2">
              {jobStatus.error}
            </AlertDescription>
          )}
        </div>
      </div>
    </Alert>
  );
}

