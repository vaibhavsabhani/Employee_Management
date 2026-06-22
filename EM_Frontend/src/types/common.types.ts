export interface ApiErrorResponse {
  status: number;
  data: {
    message: string;
    error: string;
    statusCode: number;
  };
}

export type FilterQueryArg = {
  filters?: Record<string, string>;
  page?: number;
  limit?: number;
  offset?: number;
  projectId?: string;
};
export interface State {
  data: string[];
  isLoading: boolean;
  error: string | null;
  selectedData?: any;
}
