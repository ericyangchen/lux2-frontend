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

interface OrgEnableToggleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  organizationName: string;
  ruleTitle: string;
  enabled: boolean;
}

export const OrgEnableToggleConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  organizationName,
  ruleTitle,
  enabled,
}: OrgEnableToggleConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            確認{enabled ? "啟用" : "停用"}組織綁定
          </AlertDialogTitle>
          <AlertDialogDescription>
            您確定要{enabled ? "啟用" : "停用"}組織「{organizationName}
            」對路由規則「{ruleTitle}」的綁定嗎？
            {enabled
              ? "啟用後該組織將開始使用此規則。"
              : "停用後該組織將不再使用此規則。"}
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
