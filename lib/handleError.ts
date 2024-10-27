import axios from "axios";

export default function handleError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
  } else {
    console.error("Unexpected error:", error);
  }
}
