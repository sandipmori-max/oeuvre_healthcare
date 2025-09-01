export interface SyncLocationState {
  loading: boolean;
  error: string | null;
  response: SyncLocationResponse | null;
}

export interface SyncLocationResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}