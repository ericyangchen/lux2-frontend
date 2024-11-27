// import { Dialog, DialogContent } from "@/components/shadcn/ui/dialog";
// import { useMemo, useState } from "react";

// import { Button } from "@/components/shadcn/ui/button";
// import { Input } from "@/components/shadcn/ui/input";
// import { Label } from "@/components/shadcn/ui/label";
// import { Transaction } from "@/lib/types/transaction";
// import { useToast } from "@/components/shadcn/ui/use-toast";

// const checkIfAllTransactionsHaveSamePaymentChannel = (
//   transactions: Transaction[],
//   selectedTransactionIds: string[]
// ) => {
//   if (!transactions) return false;

//   const selectedTransactions = transactions.filter((transaction) =>
//     selectedTransactionIds.includes(transaction.id)
//   );

//   const paymentChannels = selectedTransactions.map(
//     (transaction) => transaction.paymentChannel
//   );

//   return paymentChannels.every(
//     (paymentChannel) => paymentChannel === paymentChannels[0]
//   );
// };

// export function BatchModifyTransactionsDialog({
//   isOpen,
//   closeDialog,
//   transactions,
//   selectedTransactionIds,
// }: {
//   isOpen: boolean;
//   closeDialog: () => void;
//   transactions: Transaction[];
//   selectedTransactionIds: string[];
// }) {
//   const { toast } = useToast();

//   const handleCloseDialog = () => {
//     closeDialog();
//   };

//   // paymentChannel
//   const [paymentChannel, setPaymentChannel] = useState("");
//   const canBatchUpdatePaymentChannel = useMemo(
//     () =>
//       checkIfAllTransactionsHaveSamePaymentChannel(
//         transactions,
//         selectedTransactionIds
//       ),
//     [transactions, selectedTransactionIds]
//   );

//   // note
//   const [note, setNote] = useState("");

//   return (
//     <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
//       <DialogContent className="max-w-[600px] max-h-[100vh] overflow-y-auto">
//         <div className="flex flex-col gap-4">
//           <Label className="whitespace-nowrap font-semibold text-2xl text-red-600">
//             批量操作 {selectedTransactionIds?.length} 筆訂單
//           </Label>

//           <div className="flex flex-col gap-2">
//             <Label className="whitespace-nowrap font-bold text-md mt-8">
//               重送訂單
//             </Label>
//             <div className="flex flex-col items-start gap-2 w-full min-h-6">
//               <div>
//                 <Button variant="destructive">批量重送訂單</Button>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col gap-2">
//             <Label className="whitespace-nowrap font-bold text-md mt-8">
//               渠道
//             </Label>
//             <div className="flex flex-col items-start gap-2 w-full min-h-6">
//               <div>
//                 <Button
//                   variant="destructive"
//                   disabled={canBatchUpdatePaymentChannel}
//                 >
//                   批量更新渠道 -{">"} 重送訂單
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col gap-2">
//             <Label className="whitespace-nowrap font-bold text-md mt-8">
//               備註
//             </Label>
//             <div className="flex flex-col items-start gap-2 w-full min-h-6">
//               <Input value={note} onChange={(e) => setNote(e.target.value)} />
//               <div>
//                 <Button variant="destructive">批量更新備注</Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
