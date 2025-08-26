import { AttendanceResponse } from "../../../services/api";

export interface AttendanceState {
  loading: boolean;
  error: string | null;
  response: AttendanceResponse | null;
}
