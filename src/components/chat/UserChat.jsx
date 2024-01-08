import React, { useContext } from "react";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { Stack } from "react-bootstrap";
import avatar from "../../assets/avatar.svg";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import moment from "moment";
import { useFetchLatesMessage } from "../../hooks/useFetchLatestMessage";

const UserChat = ({ chat, user }) => {
  const recipient = useFetchRecipientUser(chat, user);
  const latestMessage = useFetchLatesMessage(chat);
  const { onlineUsers, newMessage, notifications, markThisUserNotification } =
    useContext(ChatContext);
  const unreadNotifications = unreadNotificationsFunc(notifications);
  const thisUserNotifications = unreadNotifications?.filter(
    (n) => n.senderId == recipient?._id
  );
  const isOnline = onlineUsers?.some((user) => user.userId === recipient?._id);
  const truncateText = (text) => {
    let shortText = text.substring(0, 20);
    if (text.length > 20) {
      shortText = shortText + "...";
    }
    return shortText;
  };
  return (
    <Stack
      direction="horizontal"
      className="user-card align-items-center p-2 justify-content-between "
      gap={3}
      role="button"
      onClick={() => {
        if (thisUserNotifications?.length !== 0) {
          markThisUserNotification(thisUserNotifications, notifications);
        }
      }}
    >
      <div className="d-flex">
        <div className="me-2">
          <img src={avatar} height={40} alt="" />
        </div>
        <div className="text-content">
          <div className="name">{recipient?.name}</div>
          <div className="text">
            {latestMessage?.text && (
              <span>{truncateText(latestMessage?.text)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date">
          {moment(latestMessage?.createdAt).calendar()}
        </div>
        <div
          className={
            thisUserNotifications?.length > 0 ? "this-user-notifications" : ""
          }
        >
          {thisUserNotifications?.length > 0
            ? thisUserNotifications?.length
            : ""}
        </div>
        <span className={isOnline ? "user-online" : ""}></span>
      </div>
    </Stack>
  );
};

export default UserChat;
