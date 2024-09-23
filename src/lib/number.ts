export const formatNumber = (number: string) => {
  return parseFloat(number).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatNumberWithoutMinFraction = (number: string) => {
  return parseFloat(number).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatNumberInPercentage = (number: string) => {
  const percentageNumber = parseFloat(number) * 100;

  return `${percentageNumber.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
};
