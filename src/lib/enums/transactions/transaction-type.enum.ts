export enum TransactionType {
  // merchant: with api
  API_DEPOSIT = 'API_DEPOSIT',
  API_WITHDRAWAL = 'API_WITHDRAWAL',

  // merchant: with web, request a withdrawal
  MERCHANT_REQUESTED_WITHDRAWAL = 'MERCHANT_REQUESTED_WITHDRAWAL',
}
