import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog";

interface EnableToggleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  ruleTitle: string;
  enabled: boolean;
}

export const EnableToggleConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  ruleTitle,
  enabled,
}: EnableToggleConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            確認{enabled ? "啟用" : "停用"}規則
          </AlertDialogTitle>
          <AlertDialogDescription>
            您確定要{enabled ? "啟用" : "停用"}路由規則「{ruleTitle}」嗎？
            {enabled ? "啟用後該規則將開始生效。" : "停用後該規則將不再生效。"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {enabled ? "啟用" : "停用"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
