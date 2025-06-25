import Decimal from "decimal.js";

export const formatNumberInInteger = (number: string) => {
  return parseFloat(number).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatNumber = (number?: string) => {
  if (!number) return "0.000";

  const parsed = parseFloat(number);
  if (isNaN(parsed)) return "0.000";

  return parsed.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

export const formatNumberWithoutMinFraction = (number: string) => {
  return parseFloat(number).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatNumberInPercentage = (number: string) => {
  const percentageNumber = new Decimal(number).mul(100).toNumber();

  return `${percentageNumber.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
};

export const convertStringNumberToPercentageNumber = (number: string) => {
  return new Decimal(number).mul(100).toNumber();
};
