import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import {
  CheckCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/shadcn/ui/button';
import { useRouter } from 'next/router';
import * as React from 'react';

interface ExportCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  downloadUrl: string;
  filename: string;
  onDownload: (url: string, filename: string) => void;
  exportPagePath: string; // e.g., "/admin/exports" or "/merchant/exports"
}

export function ExportCompletionDialog({
  open,
  onOpenChange,
  downloadUrl,
  filename,
  onDownload,
  exportPagePath,
}: ExportCompletionDialogProps) {
  const router = useRouter();

  const handleDownload = () => {
    onDownload(downloadUrl, filename);
  };

  const handleGoToExportPage = () => {
    router.push(exportPagePath);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-none">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            <DialogTitle>匯出完成</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            您的匯出檔案已準備就緒，可以立即下載。
            <br />
            <br />
            您也可以稍後在匯出下載頁面重新下載此檔案。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleGoToExportPage}
            className="w-full sm:w-auto rounded-none border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none"
          >
            前往匯出下載頁面
          </Button>
          <Button 
            onClick={handleDownload} 
            className="w-full sm:w-auto rounded-none bg-gray-900 text-white hover:bg-gray-800 shadow-none"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            立即下載
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

