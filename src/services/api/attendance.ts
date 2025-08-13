import apiClient from './config';
import {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  AttendanceReport,
  PaginationParams,
  PaginatedResponse,
} from './types';

class AttendanceService {
  private readonly baseUrl = '/attendance';

  /**
   * Check in for the day
   */
  async checkIn(checkInData: CheckInRequest): Promise<AttendanceRecord> {
    try {
      const response = await apiClient.post<AttendanceRecord>(
        `${this.baseUrl}/check-in`,
        checkInData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check out for the day
   */
  async checkOut(checkOutData: CheckOutRequest): Promise<AttendanceRecord> {
    try {
      const response = await apiClient.post<AttendanceRecord>(
        `${this.baseUrl}/check-out`,
        checkOutData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get today's attendance record
   */
  async getTodayRecord(): Promise<AttendanceRecord | null> {
    try {
      const response = await apiClient.get<AttendanceRecord | null>(
        `${this.baseUrl}/today`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get attendance records for a specific date range
   */
  async getRecords(
    startDate: string,
    endDate: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        ...(params?.page && { page: params.page.toString() }),
        ...(params?.limit && { limit: params.limit.toString() }),
        ...(params?.sortBy && { sortBy: params.sortBy }),
        ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      });

      const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
        `${this.baseUrl}/records?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get attendance records for current month
   */
  async getCurrentMonthRecords(): Promise<AttendanceRecord[]> {
    try {
      const response = await apiClient.get<AttendanceRecord[]>(
        `${this.baseUrl}/current-month`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get attendance report for a specific month
   */
  async getMonthlyReport(
    month: number,
    year: number
  ): Promise<AttendanceReport> {
    try {
      const response = await apiClient.get<AttendanceReport>(
        `${this.baseUrl}/report/${year}/${month}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get attendance statistics
   */
  async getStatistics(): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
    averageHours: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/statistics`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update attendance record (for corrections)
   */
  async updateRecord(
    recordId: string,
    updates: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    try {
      const response = await apiClient.put<AttendanceRecord>(
        `${this.baseUrl}/records/${recordId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request attendance correction
   */
  async requestCorrection(
    recordId: string,
    reason: string,
    requestedChanges: Partial<AttendanceRecord>
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/correction-request`,
        {
          recordId,
          reason,
          requestedChanges,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending correction requests
   */
  async getCorrectionRequests(): Promise<{
    id: string;
    recordId: string;
    reason: string;
    requestedChanges: Partial<AttendanceRecord>;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/correction-requests`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export attendance data
   */
  async exportAttendance(
    startDate: string,
    endDate: string,
    format: 'csv' | 'pdf' | 'excel'
  ): Promise<{ downloadUrl: string }> {
    try {
      const response = await apiClient.post<{ downloadUrl: string }>(
        `${this.baseUrl}/export`,
        {
          startDate,
          endDate,
          format,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AttendanceService();
