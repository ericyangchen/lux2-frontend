// import {
//   PaymentChannelDisplayNames,
//   PaymentMethodDisplayNames,
//   Transaction,
//   TransactionStatusDisplayNames,
//   TransactionTypeDisplayNames,
// } from "@/lib/types/transaction";
// import {
//   formatNumberInPercentage,
//   formatNumberWithoutMinFraction,
// } from "@/lib/number";

// import { ApplicationError } from "@/lib/types/applicationError";
// import { Button } from "@/components/shadcn/ui/button";
// import { Input } from "@/components/shadcn/ui/input";
// import { Label } from "@/components/shadcn/ui/label";
// import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
// import { copyToClipboard } from "@/lib/copyToClipboard";
// import { getApplicationCookies } from "@/lib/cookie";
// import { getTransactionByIdApi } from "@/lib/apis/transactions";
// import { useState } from "react";
// import { useToast } from "@/components/shadcn/ui/use-toast";

// export function TroubleApiTransaction() {
//   const { toast } = useToast();

//   // 1. search by transactionId
//   const [transactionId, setTransactionId] = useState<string>("");

//   const [isLoading, setIsLoading] = useState(false);

//   const [transaction, setTransaction] = useState<Transaction>();

//   const handleSearch = async (isLoadMore: boolean = false) => {
//     const { accessToken, organizationId } = getApplicationCookies();

//     if (!accessToken || !organizationId || !transactionId) {
//       return;
//     }

//     if (!isLoadMore) {
//       setIsLoading(true);
//     }

//     try {
//       const response = await getTransactionByIdApi({
//         transactionId,
//         accessToken,
//       });
//       const data = await response.json();

//       if (response.ok) {
//         setTransaction(data?.transaction);
//       } else {
//         throw new ApplicationError(data);
//       }
//     } catch (error) {
//       if (error instanceof ApplicationError) {
//         toast({
//           title: `${error.statusCode} - 自動訂單查詢失敗`,
//           description: error.message,
//           variant: "destructive",
//         });
//       } else {
//         toast({
//           title: `自動訂單查詢失敗`,
//           description: "Unknown error",
//           variant: "destructive",
//         });
//       }
//       setTransaction(undefined);
//     }

//     setIsLoading(false);
//   };

//   const handleClearAll = () => {
//     setTransactionId("");
//     setTransaction(undefined);
//   };

//   const [isManualOperationButtonLoading, setIsManualOperationButtonLoading] =
//     useState(false);

//   return (
//     <div
//       className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll"
//       id="scrollableDiv"
//     >
//       {/* search bar */}
//       <div className="flex flex-col divide-y pb-4">
//         {/* search by transactionId */}
//         <div className="pb-4 flex flex-col gap-4">
//           <Label className="whitespace-nowrap font-bold text-md">
//             輸入系統自動訂單號查詢
//           </Label>
//           {/* transactionId */}
//           <div className="flex items-center gap-4 w-full lg:w-fit px-4">
//             <Label className="whitespace-nowrap">
//               系統自動訂單號(TX)<span className="text-red-500">*</span>
//             </Label>
//             <Input
//               id="transactionId"
//               className="w-full sm:min-w-[220px] font-mono"
//               value={transactionId}
//               onChange={(e) => setTransactionId(e.target.value)}
//             />
//           </div>

//           {/* search button */}
//           <div className="flex justify-center sm:justify-start gap-4 px-4">
//             <Button
//               onClick={handleClearAll}
//               className="w-[120px] border border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 hover:bg-inherit"
//               variant="outline"
//             >
//               清除
//             </Button>
//             <Button
//               onClick={() => handleSearch()}
//               disabled={isLoading || !transactionId}
//               className="w-[120px]"
//             >
//               {isLoading ? "查詢中..." : "查詢"}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* transaction */}
//       {transaction && (
//         <div className="flex gap-16 flex-row flex-wrap">
//           {/* transaction info */}
//           <div className="flex flex-col gap-4">
//             <Label className="whitespace-nowrap font-bold text-md">
//               訂單資訊
//             </Label>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 系統自動訂單號:
//               </Label>
//               <div
//                 className="font-mono cursor-pointer"
//                 onClick={() =>
//                   copyToClipboard({
//                     toast,
//                     copyingText: transaction.id,
//                     title: "已複製系統自動訂單號",
//                   })
//                 }
//               >
//                 {transaction.id}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 單位 ID:
//               </Label>
//               <div
//                 className="font-mono cursor-pointer"
//                 onClick={() =>
//                   copyToClipboard({
//                     toast,
//                     copyingText: transaction.merchantId,
//                     title: "已複製單位 ID",
//                   })
//                 }
//               >
//                 {transaction.merchantId}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 商戶訂單號:
//               </Label>
//               <div
//                 className="font-mono cursor-pointer"
//                 onClick={() =>
//                   copyToClipboard({
//                     toast,
//                     copyingText: transaction.merchantOrderId,
//                     title: "已複製商戶訂單號",
//                   })
//                 }
//               >
//                 {transaction.merchantOrderId}
//               </div>
//             </div>

//             <div className="flex items-start gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px] mt-[5px]">
//                 交易資訊:
//               </Label>
//               <div className="font-mono">
//                 {transaction.paymentData && (
//                   <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
//                     {JSON.stringify(transaction.paymentData, null, 2)}
//                   </pre>
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 通知 URL:
//               </Label>
//               <div className="font-mono">{transaction.notifyUrl}</div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">類別:</Label>
//               <div className="font-mono">
//                 {TransactionTypeDisplayNames[transaction.type]}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">通道:</Label>
//               <div className="font-mono">
//                 {PaymentMethodDisplayNames[transaction.paymentMethod]}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">渠道:</Label>
//               <div className="font-mono">
//                 {PaymentChannelDisplayNames[transaction.paymentChannel]}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 結算天數:
//               </Label>
//               <div className="font-mono">{transaction.settlementInterval}</div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 手續費率:
//               </Label>
//               <div className="font-mono">
//                 {formatNumberInPercentage(transaction.percentageFee)}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 固定手續費:
//               </Label>
//               <div className="font-mono">
//                 {formatNumberWithoutMinFraction(transaction.fixedFee)}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">金額:</Label>
//               <div className="font-mono">
//                 {formatNumberWithoutMinFraction(transaction.amount)}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 總手續費:
//               </Label>
//               <div className="font-mono">
//                 {formatNumberWithoutMinFraction(transaction.totalFee)}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 餘額變動:
//               </Label>
//               <div className="font-mono">
//                 {formatNumberWithoutMinFraction(transaction.balanceChanged)}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 分潤狀態:
//               </Label>
//               <div className="font-mono">
//                 {transaction.revenueDistributed ? "已分潤" : "未分潤"}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">狀態:</Label>
//               <div className="font-mono">{`${transaction.status} (${
//                 TransactionStatusDisplayNames[transaction.status]
//               })`}</div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">訊息:</Label>
//               <div className="font-mono">{transaction.message}</div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 詳細狀態:
//               </Label>
//               <div className="font-mono">{transaction.detailedStatus}</div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 系統創建時間:
//               </Label>
//               <div className="font-mono">
//                 {convertDatabaseTimeToReadablePhilippinesTime(
//                   transaction.createdAt
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 系統更新時間:
//               </Label>
//               <div className="font-mono">
//                 {convertDatabaseTimeToReadablePhilippinesTime(
//                   transaction.updatedAt
//                 )}
//               </div>
//             </div>

//             <div className="flex items-start gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px] mt-[5px]">
//                 上游回覆:
//               </Label>
//               <div className="font-mono">
//                 {transaction.upstreamResponse && (
//                   <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
//                     {JSON.stringify(transaction.upstreamResponse, null, 2)}
//                   </pre>
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
//               <Label className="whitespace-nowrap min-w-[100px]">
//                 上游回覆時間:
//               </Label>
//               <div className="font-mono">
//                 {convertDatabaseTimeToReadablePhilippinesTime(
//                   transaction.upstreamNotifiedAt
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* handle trouble api transaction */}
//           <div className="flex flex-col gap-4 w-full sm:w-fit">
//             <Label className="whitespace-nowrap font-bold text-md">
//               手動處理
//             </Label>

//             {/* TODO: add functionality */}
//             <div className="flex flex-col gap-4 mx-4">
//               <div>
//                 <Label className="whitespace-nowrap font-bold">更換渠道</Label>
//               </div>
//               <div>
//                 <Label className="whitespace-nowrap font-bold">重新執行</Label>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
