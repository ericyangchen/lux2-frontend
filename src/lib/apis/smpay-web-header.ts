export const SMPayWebHeader = () => {
  return {
    "Content-Type": "application/json",
    "X-Infra-Client": "web",
  };
};

export const SMPayWebHeaderWithAccessToken = (accessToken: string) => {
  return {
    ...SMPayWebHeader(),
    Authorization: `Bearer ${accessToken}`,
  };
};
