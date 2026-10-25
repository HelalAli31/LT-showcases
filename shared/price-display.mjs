export const discountPercent = (quote) =>
  `${quote.discountApproximate && quote.discountBps ? "כ־" : ""}${quote.discountBps / 100}%`;
