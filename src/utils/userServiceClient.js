import axios from "axios";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://127.0.0.1:3006";

export const validateUserToken = async (token) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/validate-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User validation failed");
  }
};

export default validateUserToken;
