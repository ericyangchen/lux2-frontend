import { backendUrl } from "@/lib/constants";

export const loginApi = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
};
