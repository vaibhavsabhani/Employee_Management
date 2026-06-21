export interface ApiErrorResponse {
  status: number;
  data: {
    message: string;
    error: string;
    statusCode: number;
  };
}