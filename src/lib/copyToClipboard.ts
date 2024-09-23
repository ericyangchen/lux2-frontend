import copy from "copy-to-clipboard";

export const copyToClipboard = ({
  toast,
  copyingText,
  title = "複製成功!",
  description,
}: {
  toast: any;
  copyingText: string;
  title?: string;
  description?: string;
}) => {
  copy(copyingText);

  toast({
    title,
    description: description ? description : copyingText,
    variant: "success",
  });
};
