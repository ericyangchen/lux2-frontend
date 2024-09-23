import { backendUrl } from "@/lib/constants";

export const getUserByIdApi = async ({
  organizationId,
  userId,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/users/${encodeURIComponent(userId)}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getUsersByOrganizationIdApi = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/users`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createUserApi = async ({
  organizationId,
  name,
  email,
  password,
  role,
  accessToken,
}: {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/users`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      organizationId,
      name,
      email,
      password,
      role,
    }),
  });
};

export const updateUserApi = async ({
  organizationId,
  userId,
  name,
  email,
  password,
  role,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/users/${encodeURIComponent(userId)}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });
};

export const deleteUserApi = async ({
  organizationId,
  userId,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/users/${encodeURIComponent(userId)}`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
