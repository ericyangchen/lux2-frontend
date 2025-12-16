import {
  ApiGetAdminBalanceSummary,
  ApiGetAdminBalanceTransactions,
} from "@/lib/apis/reports/get";
import {
  ApiExportAdminBalanceReport,
  ApiGetBalanceReportJobStatus,
  JobStatus as BalanceReportJobStatus,
} from "@/lib/apis/reports/export";
import {
  BalanceSummary,
  BalanceTransactions,
} from "@/lib/types/balance-report";

import { ApplicationError } from "@/lib/error/applicationError";
import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { BalanceReportDisplay } from "@/modules/common/reports/BalanceReportDisplay";
import { BalanceReportForm } from "@/modules/common/reports/BalanceReportForm";
import { ExportCompletionDialog } from "@/components/export/ExportCompletionDialog";
import { ExportJobStatus } from "@/components/export/ExportJobStatus";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useExportJob } from "@/lib/hooks/use-export-job";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import moment from "moment-timezone";
import {
  getCurrentDateInPhilippines,
  getYesterdayDateInPhilippines,
} from "@/lib/utils/timezone";

export default function AdminBalanceReportsPage() {
  const [organizationId, setOrganizationId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [date, setDate] = useState<string>(getYesterdayDateInPhilippines());

  // Only allow generating balance reports for dates before today (yesterday and earlier)
  const maxDate = new Date(getCurrentDateInPhilippines());
  maxDate.setDate(maxDate.getDate() - 1); // Set to yesterday

  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<BalanceSummary | null>(null);
  const [transactionsData, setTransactionsData] =
    useState<BalanceTransactions | null>(null);
  const [isLoadingPagination, setIsLoadingPagination] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visitedPages, setVisitedPages] = useState<
    Array<{ cursorSuccessAt?: string; cursorId?: string }>
  >([{}]); // Page 1 has no cursor
  const transactionLimit = 20;

  // Export job states
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [ongoingJob, setOngoingJob] = useState<BalanceReportJobStatus | null>(
    null
  );
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completedExportUrl, setCompletedExportUrl] = useState<string | null>(
    null
  );
  const [completedExportFilename, setCompletedExportFilename] =
    useState<string>("");

  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  const { jobStatus, startPolling, downloadFile } = useExportJob({
    jobId: currentJobId || ongoingJob?.jobId || null,
    fetchJobStatus: async (id: string) => {
      return ApiGetBalanceReportJobStatus({
        jobId: id,
        accessToken: accessToken || "",
        isAdmin: true,
      });
    },
    onComplete: (gcsUrl: string) => {
      const filename = `balance-report-${organizationId}-${paymentMethod}-${date}-${moment().format(
        "HHmm"
      )}.xlsx`;
      setCompletedExportUrl(gcsUrl);
      setCompletedExportFilename(filename);
      setShowCompletionDialog(true);
      setOngoingJob(null);
      setCurrentJobId(null);
    },
    onError: (error: string) => {
      setOngoingJob(null);
      setCurrentJobId(null);
      toast({
        title: "匯出失敗",
        description: error,
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = async () => {
    if (!organizationId || !paymentMethod || !date) {
      toast({
        title: "錯誤",
        description: "請填寫所有必要欄位",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!accessToken) {
        throw new ApplicationError({ message: "請重新登入" });
      }

      // Call both APIs simultaneously
      const [summaryResponse, transactionsResponse] = await Promise.all([
        ApiGetAdminBalanceSummary({
          organizationId,
          paymentMethod: paymentMethod as PaymentMethod,
          date,
          accessToken,
        }),
        ApiGetAdminBalanceTransactions({
          organizationId,
          paymentMethod: paymentMethod as PaymentMethod,
          date,
          limit: transactionLimit,
          accessToken,
        }),
      ]);

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json();
        throw new ApplicationError({
          message: errorData.message || "獲取報表摘要失敗",
        });
      }

      if (!transactionsResponse.ok) {
        const errorData = await transactionsResponse.json();
        throw new ApplicationError({
          message: errorData.message || "獲取交易資料失敗",
        });
      }

      const [summary, transactions] = await Promise.all([
        summaryResponse.json(),
        transactionsResponse.json(),
      ]);

      setSummaryData(summary);
      setTransactionsData(transactions);
      setCurrentPage(1); // Reset to first page
      setVisitedPages([{}]); // Reset visited pages - page 1 has no cursor

      toast({
        title: "成功",
        description: "報表生成成功",
      });
    } catch (error) {
      console.error("Generate report error:", error);
      toast({
        title: "錯誤",
        description:
          error instanceof ApplicationError ? error.message : "生成報表失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!organizationId || !paymentMethod || !date) {
      toast({
        title: "錯誤",
        description: "請填寫所有必要欄位",
        variant: "destructive",
      });
      return;
    }

    if (!accessToken) {
      toast({
        title: "錯誤",
        description: "請重新登入",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await ApiExportAdminBalanceReport({
        organizationId,
        paymentMethod: paymentMethod as PaymentMethod,
        date,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError({
          message: errorData.message || "匯出Excel失敗",
        });
      }

      // Backend now returns job ID for async processing
      const data = await response.json();
      const { jobId } = data;

      if (!jobId) {
        throw new Error("無法取得匯出工作 ID");
      }

      setCurrentJobId(jobId);
      setOngoingJob({
        jobId,
        userId: "",
        organizationId,
        jobType: "BALANCE_REPORT",
        status: "PENDING",
        progress: 0,
        progressMessage: null,
        gcsUrl: null,
        error: null,
        metadata: { organizationId, paymentMethod, date },
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
        completedAt: null,
      });
      startPolling(jobId);

      toast({
        title: "匯出已開始",
        description: "匯出工作已建立，正在處理中...",
      });
    } catch (error) {
      console.error("Export Excel error:", error);
      toast({
        title: "錯誤",
        description:
          error instanceof ApplicationError ? error.message : "匯出Excel失敗",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = async (page: number) => {
    if (
      !organizationId ||
      !paymentMethod ||
      !date ||
      isLoadingPagination ||
      page < 1 ||
      page > visitedPages.length
    ) {
      return;
    }

    setIsLoadingPagination(true);
    setCurrentPage(page);

    try {
      if (!accessToken) {
        throw new ApplicationError({ message: "請重新登入" });
      }

      // Get cursor for the target page (page 1 has no cursor)
      const targetPageCursor = visitedPages[page - 1];

      const response = await ApiGetAdminBalanceTransactions({
        organizationId,
        paymentMethod: paymentMethod as PaymentMethod,
        date,
        limit: transactionLimit,
        cursorSuccessAt: targetPageCursor.cursorSuccessAt,
        cursorId: targetPageCursor.cursorId,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError({
          message: errorData.message || "載入頁面失敗",
        });
      }

      const data = await response.json();
      setTransactionsData(data);
    } catch (error) {
      console.error("Page change error:", error);
      toast({
        title: "錯誤",
        description:
          error instanceof ApplicationError ? error.message : "載入頁面失敗",
        variant: "destructive",
      });
      // Reset page on error
      setCurrentPage(currentPage);
    } finally {
      setIsLoadingPagination(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1) {
      await handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = async () => {
    if (
      !organizationId ||
      !paymentMethod ||
      !date ||
      isLoadingPagination ||
      !transactionsData?.pagination.hasMore
    ) {
      return;
    }

    setIsLoadingPagination(true);

    try {
      if (!accessToken) {
        throw new ApplicationError({ message: "請重新登入" });
      }

      const response = await ApiGetAdminBalanceTransactions({
        organizationId,
        paymentMethod: paymentMethod as PaymentMethod,
        date,
        limit: transactionLimit,
        cursorSuccessAt: transactionsData.pagination.nextCursorSuccessAt,
        cursorId: transactionsData.pagination.nextCursorId,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError({
          message: errorData.message || "載入下一頁失敗",
        });
      }

      const data = await response.json();

      // Add the new page's cursor to visited pages
      const newPageNumber = currentPage + 1;
      setVisitedPages((prev) => [
        ...prev,
        {
          cursorSuccessAt: transactionsData.pagination.nextCursorSuccessAt,
          cursorId: transactionsData.pagination.nextCursorId,
        },
      ]);

      setCurrentPage(newPageNumber);
      setTransactionsData(data);
    } catch (error) {
      console.error("Next page error:", error);
      toast({
        title: "錯誤",
        description:
          error instanceof ApplicationError ? error.message : "載入下一頁失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPagination(false);
    }
  };

  return (
    <div className="w-full min-w-full space-y-6">
      <ApplicationHeader title="交易報表" />

      <div className="space-y-6 w-full">
        <BalanceReportForm
          organizationId={organizationId}
          setOrganizationId={setOrganizationId}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          date={date}
          setDate={setDate}
          onExportExcel={handleExportExcel}
          isLoading={isLoading}
          isExportInProgress={
            ongoingJob !== null &&
            (ongoingJob.status === "PENDING" ||
              ongoingJob.status === "PROCESSING")
          }
          showOrganizationSelector={true}
          showGenerateButton={false}
          maxDate={maxDate}
        />

        {/* Export Job Status - Only show when processing, not when completed */}
        {(jobStatus || currentJobId) && jobStatus?.status !== "COMPLETED" && (
          <div className="mt-4">
            <ExportJobStatus
              jobStatus={jobStatus}
              onDownload={(url: string) => {
                const filename = `balance-report-${organizationId}-${paymentMethod}-${date}-${moment().format(
                  "HHmm"
                )}.xlsx`;
                downloadFile(url, filename);
              }}
            />
          </div>
        )}

        {/* Export Completion Dialog */}
        <ExportCompletionDialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
          downloadUrl={completedExportUrl || ""}
          filename={completedExportFilename}
          onDownload={downloadFile}
          exportPagePath="/admin/exports?tab=BalanceReports"
        />

        {summaryData && transactionsData && (
          <BalanceReportDisplay
            report={{
              ...summaryData,
              transactions: transactionsData.transactions,
              transactionsPagination: transactionsData.pagination,
            }}
            currentPage={currentPage}
            visitedPages={visitedPages}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            isLoadingPagination={isLoadingPagination}
          />
        )}
      </div>
    </div>
  );
}
