import { useEffect, useState } from "react";
import { baseUrl, getRequest } from "../utils/service";

export const useFetchRecipientUser = (chat, user) => {
  const [recipient, setRecipient] = useState(null);
  const [error, setError] = useState(null);

  const recipientId = chat?.members?.find((id) => id !== user?._id);

  useEffect(() => {
    const getUser = async () => {
      if (!recipientId) return null;
      const response = await getRequest(`${baseUrl}/users/find/${recipientId}`);
      // console.log(response);
      if (response?.error) {
        return setError(response);
      }
      setRecipient(response);
    };
    getUser();
  }, [recipientId]);
  return recipient;
};
