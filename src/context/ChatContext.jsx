import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, postRequest, getRequest } from "../utils/service";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUsersChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUsersChatsError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState(null);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    socket.emit("addNewUser", user?._id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });
    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res.chatId) {
        return;
      }
      setMessage((prev) => [...prev, res]);
    });
    socket.on("getNotification", (res) => {
      const isChatOpened = currentChat?.members.some(
        (id) => id === res.senderId
      );
      if (isChatOpened) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
      }
    });
    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    const recipientId = currentChat?.members?.find((id) => id !== user?._id);
    socket.emit("sendMessage", { ...newMessage, recipientId });
    return () => {
      socket.off("getOnlineUsers");
    };
  }, [newMessage]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`);

      if (response.error) {
        return console.log("Error fetching users", response);
      }
      const pChats = response.filter((u) => {
        let isChatCreated = false;
        if (user?._id === u._id) return false;
        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat.members[0] === u._id || chat.members[1] === u._id;
          });
        }
        return !isChatCreated;
      });
      setPotentialChats(pChats);
      setAllUsers(response);
    };
    getUsers();
  }, [userChats]);

  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setIsUserChatsLoading(true);

        const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

        setIsUserChatsLoading(false);

        if (response.error) {
          return setUsersChatsError(response);
        }

        setUsersChats(response);
      }
    };
    getUserChats();
  }, [user,notifications]);

  useEffect(() => {
    const getMessages = async () => {
      setIsMessageLoading(true);
      setMessageError(null);
      const response = await getRequest(
        `${baseUrl}/messages/${currentChat?._id}`
      );

      setIsMessageLoading(false);

      if (response.error) {
        return setMessageError(response);
      }

      setMessage(response);
    };
    getMessages();
  }, [currentChat]);

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats`,
      JSON.stringify({ firstId, secondId })
    );
    if (response.error) {
      return console.log("Error creating chat", response);
    }
    setUsersChats((prev) => [...prev, response]);
  }, []);
  const sendTextMessage = useCallback(
    async (currentChatId, text, sender, setTextMessage) => {
      if (!text) {
        return console.log("You must type anything in the input field....");
      }
      const response = await postRequest(
        `${baseUrl}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          text,
          senderId: sender._id,
        })
      );
      if (response.error) {
        return sendTextMessageError(response);
      }
      setNewMessage(response);
      setMessage((prev) => [...prev, response]);
      setTextMessage("");
    }
  );

  const markAsAllRead = useCallback((notifications) => {
    const mNotification = notifications.map((n) => {
      return { ...n, isRead: true };
    });
    setNotifications(mNotification);
  }, []);

  const markNotificationAsRead = useCallback(
    (n, userChats, user, notifications) => {
      const desiredChat = userChats.find((chat) => {
        const chatMembers = [user._id, n.senderId];
        const isDesiredChat = chat?.members.every((member) => {
          return chatMembers.includes(member);
        });
        return isDesiredChat;
      });
      const mNotifications = notifications.map((el) => {
        if (n.senderId === el.senderId) {
          return { ...n, isRead: true };
        } else {
          return el;
        }
      });
      updateCurrentChat(desiredChat);
      setNotifications(mNotifications);
    },
    []
  );
  const markThisUserNotification = useCallback((thisUserNotifications,notifications) => {
    const mNotification = notifications.map((el) => {
      let notification;
      thisUserNotifications.forEach((n) => {
        if (n.senderId == el.senderId) {
          notification = { ...n, isRead: true };
        } else {
          notification = el;
        }
      });
      return notification;
    });
    setNotifications(mNotification);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        message,
        currentChat,
        isMessageLoading,
        messageError,
        sendTextMessage,
        newMessage,
        sendTextMessageError,
        isMessageLoading,
        setSendTextMessageError,
        onlineUsers,
        notifications,
        allUsers,
        markAsAllRead,
        markNotificationAsRead,
        markThisUserNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
