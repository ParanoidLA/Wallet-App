import axios from "axios";

const API_BASE_URL = "http://192.168.29.27:5001/api"; // Replace with your backend URL

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",

  },

});

// API Methods

// 1. Create user
export const createUser = async (clerkId: string, email: string, username: string) => {
  try {
    const response = await api.post("/users", { clerkId, email, username });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

// 2. Fetch user details by Clerk ID
// export const getUser = async (clerkId:string) => {
//   try {
//     const response = await api.get(`/users/${clerkId}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     throw new Error("Failed to fetch user details");
//   }
// };
export const getUser = async (clerkId: string) => {
  if (!clerkId) {
    console.error("Invalid clerkId provided:", clerkId);
    throw new Error("Invalid clerkId");
  }

  try {
    const response = await api.get(`/users/${clerkId}`);
    return response.data; // Return the user data if found
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        console.warn(`User not found for clerkId: ${clerkId}`);
        return null; // Return null if user is not found, instead of throwing an error
      } else if (error.response.status >= 500) {
        console.error("Server error occurred:", error.response.data);
        throw new Error("Server error while fetching user");
      }
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server while fetching user");
    } else {
      console.error("Unexpected error while fetching user:", error.message);
      throw new Error("Unexpected error occurred");
    }
  }
};

// 3. Update wallet balance
export const updateWalletBalance = async (walletId: string, balance: number) => {
  try {
    const response = await api.patch(`/wallets/${walletId}`, { balance });
    return response.data;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    throw new Error("Failed to update wallet balance");
  }
};

// 4. Add transaction
export const addTransaction = async (
  walletId: string,
  type: string,
  amount: number,
  category: string
) => {
  try {
    const response = await api.post(`/wallets/${walletId}/transactions`, {
      type,
      amount,
      category,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw new Error("Failed to add transaction");
  }
};

// 5. Get transaction history
export const getTransactionHistory = async (walletId: string) => {
  try {
    const response = await api.get(`/wallets/${walletId}/transactions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw new Error("Failed to fetch transaction history");
  }
};