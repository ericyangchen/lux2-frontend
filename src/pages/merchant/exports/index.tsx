import {
  PaymentMethodDisplayNames,
  TransactionTypeDisplayNames,
  TransactionStatusDisplayNames,
} from '@/lib/constants/transaction';
import {
  ApiListMerchantTransactionExports,
  JobStatus as TransactionJobStatus,
} from '@/lib/apis/transactions/export';
import {
  ApiListMerchantBalanceReportExports,
  JobStatus,
} from '@/lib/apis/reports/export';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { PHILIPPINES_TIMEZONE } from '@/lib/utils/timezone';
import { getApplicationCookies } from '@/lib/utils/cookie';
import { cn } from '@/lib/utils/classname-utils';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';

enum Tab {
  BalanceReports = 'BalanceReports',
  TransactionExports = 'TransactionExports',
}

const tabDisplayNames = {
  [Tab.BalanceReports]: '餘額報表',
  [Tab.TransactionExports]: '交易匯出',
};

export default function MerchantExportsPage() {
  const router = useRouter();
  const { query } = router;
  const { accessToken, organizationId } = getApplicationCookies();

  const [selectedTab, setSelectedTab] = useState<string>(
    (query.tab as Tab) || Tab.BalanceReports,
  );

  const [balanceReportJobs, setBalanceReportJobs] = useState<JobStatus[]>([]);
  const [transactionExportJobs, setTransactionExportJobs] = useState<
    TransactionJobStatus[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [balanceReportTotal, setBalanceReportTotal] = useState(0);
  const [transactionExportTotal, setTransactionExportTotal] = useState(0);

  const handleSelectTab = useCallback(
    (tab: string) => {
      setSelectedTab(tab);
      router.push(
        {
          query: { tab },
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  useEffect(() => {
    if (query.tab && Object.values(Tab).includes(query.tab as Tab)) {
      setSelectedTab(query.tab as Tab);
    } else {
      handleSelectTab(selectedTab);
    }
  }, [handleSelectTab, query.tab, selectedTab]);

  const loadBalanceReportExports = async () => {
    if (!accessToken || !organizationId) return;

    setIsLoading(true);
    try {
      const response = await ApiListMerchantBalanceReportExports({
        organizationId,
        accessToken,
        limit: 100,
        offset: 0,
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by createdAt desc
        const sortedJobs = (data.jobs || []).sort(
          (a: JobStatus, b: JobStatus) => {
            return (
              moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
            );
          },
        );
        setBalanceReportJobs(sortedJobs);
        setBalanceReportTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load balance report exports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactionExports = async () => {
    if (!accessToken || !organizationId) return;

    setIsLoading(true);
    try {
      const response = await ApiListMerchantTransactionExports({
        merchantId: organizationId,
        accessToken,
        limit: 100,
        offset: 0,
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by createdAt desc
        const sortedJobs = (data.jobs || []).sort(
          (a: TransactionJobStatus, b: TransactionJobStatus) => {
            return (
              moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
            );
          },
        );
        setTransactionExportJobs(sortedJobs);
        setTransactionExportTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load transaction exports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === Tab.BalanceReports) {
      loadBalanceReportExports();
    } else if (selectedTab === Tab.TransactionExports) {
      loadTransactionExports();
    }
  }, [selectedTab, accessToken, organizationId]);

  const downloadFile = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.xlsx';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return moment
      .tz(dateString, PHILIPPINES_TIMEZONE)
      .format('YYYY-MM-DD HH:mm:ss');
  };

  const getTransactionExportFilters = (job: TransactionJobStatus): string => {
    const metadata = job.metadata || {};
    const filters: string[] = [];

    // Date range
    if (metadata.createdAtStart || metadata.createdAtEnd) {
      const startDate = metadata.createdAtStart
        ? moment
            .tz(metadata.createdAtStart, PHILIPPINES_TIMEZONE)
            .format('YYYY-MM-DD')
        : null;
      const endDate = metadata.createdAtEnd
        ? moment
            .tz(metadata.createdAtEnd, PHILIPPINES_TIMEZONE)
            .format('YYYY-MM-DD')
        : null;
      if (startDate && endDate && startDate === endDate) {
        filters.push(`日期: ${startDate}`);
      } else if (startDate && endDate) {
        filters.push(`日期: ${startDate} 至 ${endDate}`);
      } else if (startDate) {
        filters.push(`日期: ${startDate} 起`);
      } else if (endDate) {
        filters.push(`日期: ${endDate} 止`);
      }
    }

    // Transaction Type
    if (metadata.type) {
      const typeName =
        TransactionTypeDisplayNames[
          metadata.type as keyof typeof TransactionTypeDisplayNames
        ] || metadata.type;
      filters.push(`類型: ${typeName}`);
    }

    // Payment Method
    if (metadata.paymentMethod) {
      const paymentMethodName =
        PaymentMethodDisplayNames[
          metadata.paymentMethod as keyof typeof PaymentMethodDisplayNames
        ] || metadata.paymentMethod;
      filters.push(`通道: ${paymentMethodName}`);
    }

    // Payment Channel
    if (metadata.paymentChannel) {
      filters.push(`支付渠道: ${metadata.paymentChannel}`);
    }

    // Status
    if (metadata.status) {
      const statusName =
        TransactionStatusDisplayNames[
          metadata.status as keyof typeof TransactionStatusDisplayNames
        ] || metadata.status;
      filters.push(`狀態: ${statusName}`);
    }

    // Merchant Order ID
    if (metadata.merchantOrderId) {
      filters.push(`訂單ID: ${metadata.merchantOrderId}`);
    }

    // Amount filters
    if (metadata.amount) {
      filters.push(`金額: ${metadata.amount}`);
    } else {
      if (metadata.amountMin) {
        filters.push(`金額: >= ${metadata.amountMin}`);
      }
      if (metadata.amountMax) {
        filters.push(`金額: <= ${metadata.amountMax}`);
      }
      if (metadata.amountMin && metadata.amountMax) {
        filters.pop();
        filters.pop();
        filters.push(`金額: ${metadata.amountMin} - ${metadata.amountMax}`);
      }
    }

    // Success date range
    if (metadata.successAtStart || metadata.successAtEnd) {
      const startDate = metadata.successAtStart
        ? moment
            .tz(metadata.successAtStart, PHILIPPINES_TIMEZONE)
            .format('YYYY-MM-DD')
        : null;
      const endDate = metadata.successAtEnd
        ? moment
            .tz(metadata.successAtEnd, PHILIPPINES_TIMEZONE)
            .format('YYYY-MM-DD')
        : null;
      if (startDate && endDate && startDate === endDate) {
        filters.push(`完成日期: ${startDate}`);
      } else if (startDate && endDate) {
        filters.push(`完成日期: ${startDate} 至 ${endDate}`);
      } else if (startDate) {
        filters.push(`完成日期: ${startDate} 起`);
      } else if (endDate) {
        filters.push(`完成日期: ${endDate} 止`);
      }
    }

    return filters.length > 0 ? filters.join(' | ') : '無篩選條件';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '已完成';
      case 'PROCESSING':
        return '處理中';
      case 'PENDING':
        return '等待中';
      case 'FAILED':
        return '失敗';
      case 'CANCELLED':
        return '已取消';
      default:
        return status;
    }
  };

  const getReportDescription = (job: JobStatus): string => {
    const metadata = job.metadata || {};
    const paymentMethod = metadata.paymentMethod || job.metadata?.paymentMethod;
    const startDate = metadata.startDate || metadata.date;
    const endDate = metadata.endDate || metadata.date;

    const paymentMethodName = paymentMethod
      ? PaymentMethodDisplayNames[
          paymentMethod as keyof typeof PaymentMethodDisplayNames
        ] || paymentMethod
      : '未知';

    if (startDate && endDate && startDate !== endDate) {
      return `${paymentMethodName} - ${startDate} 至 ${endDate}`;
    } else if (startDate) {
      return `${paymentMethodName} - ${startDate}`;
    }
    return paymentMethodName;
  };

  return (
    <div className="p-8">
      <div className="w-full min-w-full space-y-6">
        <h1 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          匯出下載
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 pb-4 sm:pb-0">
          <div className="px-0 py-4 w-full">
            <div className="sm:hidden">
              <label className="sr-only">Select a tab</label>
              <select
                id="export-tabs"
                name="tabs"
                value={selectedTab}
                onChange={(e) => handleSelectTab(e.target.value)}
                className="block w-full border border-gray-200 px-4 py-2"
              >
                {Object.values(Tab).map((tab) => (
                  <option key={tab} value={tab}>
                    {tabDisplayNames[tab]}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-4">
                {Object.values(Tab).map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      tab === selectedTab
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700',
                      'px-3 py-2 text-sm font-medium',
                    )}
                    onClick={() => handleSelectTab(tab)}
                  >
                    {tabDisplayNames[tab]}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Balance Reports Tab */}
        {selectedTab === Tab.BalanceReports && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">載入中...</div>
            ) : balanceReportJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                尚無餘額報表匯出記錄
              </div>
            ) : (
              <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        建立時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        報表內容
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        狀態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        完成時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {balanceReportJobs.map((job) => (
                      <tr key={job.jobId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getReportDescription(job)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col gap-1">
                            <span
                              className={cn(
                                job.status === 'COMPLETED'
                                  ? 'text-emerald-600'
                                  : job.status === 'FAILED'
                                    ? 'text-red-600'
                                    : job.status === 'PROCESSING'
                                      ? 'text-gray-600'
                                      : 'text-gray-500',
                              )}
                            >
                              {getStatusText(job.status)}
                            </span>
                            {job.status === 'PROCESSING' && (
                              <span className="text-xs text-gray-500">
                                {job.progress}%
                              </span>
                            )}
                            {job.status === 'FAILED' && job.error && (
                              <span
                                className="text-xs text-red-600 max-w-xs truncate"
                                title={job.error}
                              >
                                {job.error}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.completedAt ? formatDate(job.completedAt) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {job.status === 'COMPLETED' && job.gcsUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(job.gcsUrl!)}
                              className="rounded-none border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                              下載
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transaction Exports Tab */}
        {selectedTab === Tab.TransactionExports && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">載入中...</div>
            ) : transactionExportJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                尚無交易匯出記錄
              </div>
            ) : (
              <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        建立時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        篩選條件
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        狀態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        完成時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionExportJobs.map((job) => (
                      <tr key={job.jobId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-col gap-1">
                            {getTransactionExportFilters(job)
                              .split(' | ')
                              .map((filter, idx) => (
                                <div key={idx} className="text-sm">
                                  {filter}
                                </div>
                              ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col gap-1">
                            <span
                              className={cn(
                                job.status === 'COMPLETED'
                                  ? 'text-emerald-600'
                                  : job.status === 'FAILED'
                                    ? 'text-red-600'
                                    : job.status === 'PROCESSING'
                                      ? 'text-gray-600'
                                      : 'text-gray-500',
                              )}
                            >
                              {getStatusText(job.status)}
                            </span>
                            {job.status === 'PROCESSING' && (
                              <span className="text-xs text-gray-500">
                                {job.progress}%
                              </span>
                            )}
                            {job.status === 'FAILED' && job.error && (
                              <span
                                className="text-xs text-red-600 max-w-xs truncate"
                                title={job.error}
                              >
                                {job.error}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.completedAt ? formatDate(job.completedAt) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {job.status === 'COMPLETED' && job.gcsUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(job.gcsUrl!)}
                              className="rounded-none border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                              下載
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

