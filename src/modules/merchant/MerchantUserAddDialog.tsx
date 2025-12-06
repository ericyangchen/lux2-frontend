import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";

import { ApiMerchantCreateUser } from "@/lib/apis/users/post";
import { ApiAssignRolesToUserMerchant } from "@/lib/apis/user-roles/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { Role } from "@/lib/apis/roles/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUsersByOrganizationId } from "@/lib/hooks/swr/user";
import { KeyIcon } from "@heroicons/react/24/outline";

// Helper function to get display name for system roles (merchant only)
function getSystemRoleDisplayName(roleName: string): string {
  switch (roleName) {
    case "MERCHANT_OWNER":
      return "管理員";
    default:
      return roleName;
  }
}

export function MerchantUserAddDialog({
  isOpen,
  closeDialog,
  organizationId,
  orgType = OrgType.MERCHANT,
  organizationRoles,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  organizationId: string;
  orgType?: OrgType;
  organizationRoles?: Role[];
}) {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Generate a strong password with numbers, letters, and special characters
  const generateStrongPassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const allChars = lowercase + uppercase + numbers + specialChars;

    // Ensure at least one of each type
    let password = "";
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest randomly (total length 16)
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setPassword(newPassword);
    setShowPassword(true);
  };

  const { mutate } = useUsersByOrganizationId({
    organizationId,
  });

  // Sort roles by createdAt
  const sortedRoles = useMemo(() => {
    if (!organizationRoles) return [];
    return [...organizationRoles].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }, [organizationRoles]);

  // Set default role to MERCHANT_OWNER if available
  useEffect(() => {
    if (sortedRoles && sortedRoles.length > 0 && !selectedRoleId) {
      const ownerRole = sortedRoles.find(
        (r: Role) => r.name === "MERCHANT_OWNER" && r.isSystemRole
      );
      if (ownerRole) {
        setSelectedRoleId(ownerRole.id);
      } else {
        setSelectedRoleId(sortedRoles[0].id);
      }
    }
  }, [sortedRoles, selectedRoleId]);

  const handleAddUser = async () => {
    const { accessToken } = getApplicationCookies();

    if (
      !name ||
      !email ||
      !password ||
      !selectedRoleId ||
      !orgType ||
      !accessToken
    )
      return;

    try {
      setIsLoading(true);
      // Create user first
      const createResponse = await ApiMerchantCreateUser({
        organizationId,
        name,
        email,
        password,
        orgType,
        accessToken,
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new ApplicationError(errorData);
      }

      const userData = await createResponse.json();
      const userId = userData.user.id;

      // Assign role to user
      const assignResponse = await ApiAssignRolesToUserMerchant({
        userId,
        roleIds: [selectedRoleId],
        accessToken,
      });

      if (!assignResponse.ok) {
        const errorData = await assignResponse.json();
        throw new ApplicationError(errorData);
      }

      const selectedRole = sortedRoles?.find((r) => r.id === selectedRoleId);
      closeDialog();
      toast({
        title: `用戶新增成功`,
        description: `帳號: ${email}, 名字: ${name}, 角色: ${
          selectedRole
            ? selectedRole.isSystemRole
              ? getSystemRoleDisplayName(selectedRole.name)
              : selectedRole.name
            : "未知"
        }`,
        variant: "success",
      });
      mutate();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `用戶新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `用戶新增失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    closeDialog();
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRoleId("");
    setShowPassword(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增用戶</DialogTitle>
          <DialogDescription>新增一位用戶</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">帳號</Label>
            <Input
              id="email"
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">密碼</Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="flex-1 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入密碼或點擊生成"
              />
              <Button
                type="button"
                onClick={handleGeneratePassword}
                variant="outline"
                className="border-gray-200 hover:bg-gray-50 shadow-none rounded-none whitespace-nowrap"
                title="生成強密碼"
              >
                <KeyIcon className="w-4 h-4 mr-1" />
                生成
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">名字</Label>
            <Input
              id="name"
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">角色</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="col-span-3 border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                <SelectValue placeholder="選擇角色" />
              </SelectTrigger>
              <SelectContent>
                {sortedRoles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.isSystemRole
                      ? getSystemRoleDisplayName(role.name)
                      : role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddUser}
            disabled={!name || !email || !password || !selectedRoleId}
            className="bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none"
          >
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
