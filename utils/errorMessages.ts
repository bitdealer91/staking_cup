/**
 * Convert technical error messages to user-friendly messages
 */
export function getErrorMessage(error: Error | unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // User rejection errors
  if (
    lowerMessage.includes("rejected") ||
    lowerMessage.includes("denied") ||
    lowerMessage.includes("cancelled") ||
    lowerMessage.includes("user denied")
  ) {
    return "User rejected transaction";
  }

  // Insufficient funds
  if (
    lowerMessage.includes("insufficient") ||
    lowerMessage.includes("balance") ||
    lowerMessage.includes("not enough")
  ) {
    return "Insufficient funds for this transaction";
  }

  // Gas related errors
  if (
    lowerMessage.includes("gas") ||
    lowerMessage.includes("out of gas") ||
    lowerMessage.includes("execution reverted")
  ) {
    return "Transaction failed due to network conditions. Please try again.";
  }

  // Network/connection errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("fetch")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // Contract/validation errors
  if (
    lowerMessage.includes("revert") ||
    lowerMessage.includes("require") ||
    lowerMessage.includes("assert")
  ) {
    return "Transaction requirements not met. Please check your inputs.";
  }

  // Wallet connection errors
  if (
    lowerMessage.includes("wallet") ||
    lowerMessage.includes("provider") ||
    lowerMessage.includes("injected")
  ) {
    return "Wallet connection issue. Please reconnect your wallet.";
  }

  // Default fallback for unknown errors
  return "An unexpected error occurred. Please try again.";
}

/**
 * Check if an error is a user rejection
 */
export function isUserRejection(error: Error | unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  return (
    lowerMessage.includes("rejected") ||
    lowerMessage.includes("denied") ||
    lowerMessage.includes("cancelled") ||
    lowerMessage.includes("user denied")
  );
}
