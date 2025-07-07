import { useEffect, useMemo, useState } from "react";

import { ApiGetAvailableGroups } from "@/lib/apis/telegram-broadcast/get";
import { ApiSendBroadcastMessage } from "@/lib/apis/telegram-broadcast/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { TelegramGroup } from "@/lib/types/telegram-group";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useToast } from "@/components/shadcn/ui/use-toast";

// Component to display organization info
function OrganizationInfo({ organizationId }: { organizationId: string }) {
  const { organization, isLoading } = useOrganization({ organizationId });

  if (isLoading) {
    return <div>Loading org...</div>;
  }

  const orgName = organization?.name || "Unknown Organization";
  return <div>{orgName}</div>;
}

export default function AdminTelegramBroadcastPage() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  // State
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");

  // Load groups on mount
  useEffect(() => {
    const loadGroups = async () => {
      if (!accessToken) {
        toast({
          title: "Error",
          description: "No access token available",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        const response = await ApiGetAvailableGroups({ accessToken });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApplicationError(errorData);
        }

        const groupsData = await response.json();
        setGroups(groupsData);
      } catch (error) {
        console.error("Error loading groups:", error);
        toast({
          title: "Error",
          description: "Failed to load telegram groups",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, [accessToken, toast]);

  const handleGroupToggle = (groupId: string) => {
    const newSelected = new Set(selectedGroupIds);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroupIds(newSelected);
  };

  const handleSelectAll = () => {
    const filteredGroups = getFilteredGroups();
    if (selectedGroupIds.size === filteredGroups.length) {
      // Deselect all
      setSelectedGroupIds(new Set());
    } else {
      // Select all filtered groups
      setSelectedGroupIds(new Set(filteredGroups.map((g) => g.telegramChatId)));
    }
  };

  const getFilteredGroups = () => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    return groups.filter(
      (group) =>
        group.organizationId.toLowerCase().includes(query) ||
        group.chatInfo?.title?.toLowerCase().includes(query) ||
        group.telegramChatId.includes(query)
    );
  };

  const handleSendBroadcast = async () => {
    if (!accessToken) {
      toast({
        title: "Error",
        description: "No access token available",
        variant: "destructive",
      });
      return;
    }

    if (selectedGroupIds.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one group",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);

      const response = await ApiSendBroadcastMessage({
        accessToken,
        data: {
          message: message.trim(),
          telegramChatIds: Array.from(selectedGroupIds),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: `Broadcast sent to ${selectedGroupIds.size} groups`,
      });

      // Reset form
      setMessage("");
      setSelectedGroupIds(new Set());
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast({
        title: "Error",
        description: "Failed to send broadcast message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredGroups = getFilteredGroups();

  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="Telegram Broadcast" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Select Groups</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading}
            >
              {selectedGroupIds.size === filteredGroups.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search Groups</Label>
            <Input
              id="search"
              placeholder="Search by organization ID, chat name, or chat ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border rounded-lg max-h-96 lg:max-h-[calc(100vh-252px)] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading groups...
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery
                  ? "No groups match your search"
                  : "No groups found"}
              </div>
            ) : (
              <div className="space-y-0">
                {filteredGroups.map((group) => (
                  <div
                    key={group.telegramChatId}
                    className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleGroupToggle(group.telegramChatId)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.has(group.telegramChatId)}
                      onChange={() => handleGroupToggle(group.telegramChatId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate">
                          <OrganizationInfo
                            organizationId={group.organizationId}
                          />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {group.chatInfo?.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Org ID: {group.organizationId}</div>
                        <div>
                          Chat:{" "}
                          {group.chatInfo?.title ||
                            `Chat ${group.telegramChatId}`}
                        </div>
                        <div>Chat ID: {group.telegramChatId}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {selectedGroupIds.size} of {filteredGroups.length} groups selected
          </div>
        </div>

        {/* Message Composition */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Broadcast Message</h3>

          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              placeholder="Enter your broadcast message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              {message.length} characters
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Preview</h4>
            <div className="border rounded-lg p-3 bg-gray-50 min-h-[100px]">
              {message.trim() ? (
                <div className="whitespace-pre-wrap text-sm">{message}</div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Message preview will appear here...
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSendBroadcast}
            disabled={
              isSending || selectedGroupIds.size === 0 || !message.trim()
            }
            className="w-full"
          >
            {isSending
              ? "Sending..."
              : `Send to ${selectedGroupIds.size} Groups`}
          </Button>
        </div>
      </div>
    </div>
  );
}
