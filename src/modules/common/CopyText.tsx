import {
  ClipboardDocumentCheckIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";

import copy from "copy-to-clipboard";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export default function CopyText({ text }: { text: string }) {
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    copy(text);

    setCopied(true);
    toast({
      title: "複製成功!",
      description: text,
      variant: "success",
    });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={text}
        readOnly
        className="pr-12 focus:outline-none h-10 w-full rounded-md border border-red-500 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium  dark:border-slate-800 dark:bg-slate-950 text-red-500"
      />
      <button
        onClick={handleCopy}
        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-white rounded-r focus:outline-none"
      >
        {copied ? (
          <ClipboardDocumentCheckIcon className="w-5 h-5 text-red-500" />
        ) : (
          <ClipboardIcon className="w-5 h-5 text-red-500" />
        )}
      </button>
    </div>
  );
}
