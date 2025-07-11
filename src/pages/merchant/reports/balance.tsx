import {
  ApiExportMerchantBalanceReport,
  ApiGetMerchantBalanceSummary,
  ApiGetMerchantBalanceTransactions,
} from "@/lib/apis/reports/get";
import {
  BalanceSummary,
  BalanceTransactions,
} from "@/lib/types/balance-report";

import { ApplicationError } from "@/lib/error/applicationError";
import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { BalanceReportDisplay } from "@/modules/common/reports/BalanceReportDisplay";
import { BalanceReportForm } from "@/modules/common/reports/BalanceReportForm";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export default function MerchantBalanceReportsPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [date, setDate] = useState<string>("");
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

  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!paymentMethod || !date) {
      toast({
        title: "錯誤",
        description: "請填寫所有必要欄位",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { accessToken, organizationId } = getApplicationCookies();

      if (!accessToken) {
        throw new ApplicationError({ message: "請重新登入" });
      }

      if (!organizationId) {
        throw new ApplicationError({ message: "找不到組織資訊" });
      }

      // Call both APIs simultaneously
      const [summaryResponse, transactionsResponse] = await Promise.all([
        ApiGetMerchantBalanceSummary({
          organizationId,
          paymentMethod: paymentMethod as PaymentMethod,
          date,
          accessToken,
        }),
        ApiGetMerchantBalanceTransactions({
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
    if (!paymentMethod || !date) {
      toast({
        title: "錯誤",
        description: "請填寫所有必要欄位",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { accessToken, organizationId } = getApplicationCookies();

      if (!accessToken) {
        throw new ApplicationError({ message: "請重新登入" });
      }

      if (!organizationId) {
        throw new ApplicationError({ message: "找不到組織資訊" });
      }

      const response = await ApiExportMerchantBalanceReport({
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

      // Get filename from response headers
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `balance-report-${organizationId}-${paymentMethod}-${date}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "成功",
        description: "Excel 檔案已下載",
      });
    } catch (error) {
      console.error("Export Excel error:", error);
      toast({
        title: "錯誤",
        description:
          error instanceof ApplicationError ? error.message : "匯出Excel失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (
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
      const { accessToken, organizationId } = getApplicationCookies();

      if (!accessToken) {
        throw new ApplicationError({ message: "請重新登入" });
      }

      if (!organizationId) {
        throw new ApplicationError({ message: "找不到組織資訊" });
      }

      // Get cursor for the target page (page 1 has no cursor)
      const targetPageCursor = visitedPages[page - 1];

      const response = await ApiGetMerchantBalanceTransactions({
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

  const handleNextPage = async () => {
    if (
      !paymentMethod ||
      !date ||
      isLoadingPagination ||
      !transactionsData?.pagination.hasMore
    ) {
      return;
    }

    setIsLoadingPagination(true);

    try {
      const { accessToken, organizationId } = getApplicationCookies();

      if (!accessToken) {
        throw new ApplicationError({ message: "請重新登入" });
      }

      if (!organizationId) {
        throw new ApplicationError({ message: "找不到組織資訊" });
      }

      const response = await ApiGetMerchantBalanceTransactions({
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
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          date={date}
          setDate={setDate}
          onGenerateReport={handleGenerateReport}
          onExportExcel={handleExportExcel}
          isLoading={isLoading}
          showOrganizationSelector={false}
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
            isLoadingPagination={isLoadingPagination}
          />
        )}
      </div>
    </div>
  );
}
