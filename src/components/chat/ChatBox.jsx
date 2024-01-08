import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const [textMessage, setTextMessage] = useState("");
  const { currentChat, message, isMessageLoading, sendTextMessage } =
    useContext(ChatContext);
  const scroll = useRef();
  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);
  const recipient = useFetchRecipientUser(currentChat, user);
  if (!recipient) {
    return (
      <p style={{ textAlign: "center", width: "100%" }}>
        No conversation selected yet...
      </p>
    );
  }

  return (
    <>
      <Stack gap={4} className="chat-box">
        <div className="chat-header">
          <strong>{recipient.name}</strong>
        </div>
        <Stack gap={3} className="messages">
          {message &&
            message.map((message, index) => {
              return (
                <Stack
                  key={index}
                  className={`${
                    message?.senderId === user._id
                      ? "message self align-self-end flex-grow-0"
                      : "message align-self-start flex-grow-0"
                  }`}
                  ref={scroll}
                >
                  <span>{message.text}</span>
                  <span className="message-footer">
                    {moment(message.createdAt).calendar()}
                  </span>
                </Stack>
              );
            })}
        </Stack>
        <Stack
          className="chat-input flex-grow-0"
          direction="horizontal"
          gap={3}
        >
          <InputEmoji
            value={textMessage}
            onChange={setTextMessage}
            borderColor="rgba(71,112,223,0.2)"
          />
          <button
            onClick={() =>
              sendTextMessage(
                currentChat._id,
                textMessage,
                user,
                setTextMessage
              )
            }
            className="send-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-send"
              viewBox="0 0 16 16"
            >
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
            </svg>
          </button>
        </Stack>
      </Stack>
    </>
  );
};

export default ChatBox;
