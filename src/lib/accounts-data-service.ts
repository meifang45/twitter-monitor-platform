import { MonitoredAccount } from './types';
import { mockTwitterService } from './mock-twitter-service';

// Simple in-memory data store for monitored accounts
// In a real application, this would be replaced with a database
class AccountsDataService {
  private static instance: AccountsDataService;
  private accounts: MonitoredAccount[] = [];

  private constructor() {
    // Initialize with default accounts
    this.accounts = mockTwitterService.getDefaultMonitoredAccounts();
  }

  static getInstance(): AccountsDataService {
    if (!AccountsDataService.instance) {
      AccountsDataService.instance = new AccountsDataService();
    }
    return AccountsDataService.instance;
  }

  getAllAccounts(): MonitoredAccount[] {
    return [...this.accounts]; // Return a copy to prevent external modification
  }

  getActiveAccounts(): MonitoredAccount[] {
    return this.accounts.filter(account => account.isActive);
  }

  getAccountById(id: string): MonitoredAccount | null {
    return this.accounts.find(account => account.id === id) || null;
  }

  getAccountByUsername(username: string): MonitoredAccount | null {
    return this.accounts.find(account => 
      account.username.toLowerCase() === username.toLowerCase()
    ) || null;
  }

  addAccount(account: MonitoredAccount): MonitoredAccount {
    // Check if account already exists
    const existing = this.getAccountByUsername(account.username);
    if (existing) {
      throw new Error(`Account @${account.username} already exists`);
    }

    this.accounts.push(account);
    return account;
  }

  updateAccount(id: string, updates: Partial<MonitoredAccount>): MonitoredAccount | null {
    const index = this.accounts.findIndex(account => account.id === id);
    if (index === -1) {
      return null;
    }

    // Merge updates with existing account
    this.accounts[index] = {
      ...this.accounts[index],
      ...updates,
      id, // Ensure ID cannot be changed
      username: this.accounts[index].username, // Ensure username cannot be changed
    };

    return this.accounts[index];
  }

  removeAccount(id: string): MonitoredAccount | null {
    const index = this.accounts.findIndex(account => account.id === id);
    if (index === -1) {
      return null;
    }

    const removedAccount = this.accounts.splice(index, 1)[0];
    return removedAccount;
  }

  updateLastFetched(username: string): void {
    const account = this.getAccountByUsername(username);
    if (account) {
      account.lastFetched = new Date().toISOString();
    }
  }

  getAccountsCount(): number {
    return this.accounts.length;
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter(account => account.isActive).length;
  }
}

// Export singleton instance
export const accountsDataService = AccountsDataService.getInstance();