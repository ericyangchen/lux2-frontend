import { Calculator } from "./calculator";
import Decimal from "decimal.js";

export const formatNumberInInteger = (number: string) => {
  return parseFloat(number).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatNumber = (number: string) => {
  return Calculator.toFixedForDisplay(number);
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
