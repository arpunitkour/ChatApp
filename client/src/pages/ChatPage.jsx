import { useEffect, useState } from "react";
import { DotWave } from "@uiball/loaders";
import ChatZone from "../components/ChatZone";
import SideBar from "../components/SideBar";
import axios from "../axios/axios";
import Cookies from "js-cookie";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3000");

export const ChatPage = () => {
  const [chat, setChat] = useState([]);
  const [senderid, setSenderid] = useState([]);
  const currentUser = Cookies.get("username");
  const currentUserId = Cookies.get("user_id");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const token = Cookies.get("jwtToken");
  const [userId, setUserId] = useState(Cookies.get("user_id"));
  const [user, setUser] = useState({});
  const [flag, setFlag] = useState(true);

  useEffect(() => {
    const fetchUserAvailability = async () => {
      try {
        const res = await axios.get(`get-user/${userId}`);
        setUser(res.data.user);
      } catch (error) {
        console.log("Error fetching user availability:", error);
      }
    };

    fetchUserAvailability();
  }, [userId]);

  const fetchChat = async () => {
    const { data } = await axios.get("chat/getChat", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setChat(data.chat);
    setSenderid(data.chat[data.chat.length - 1].sender_id);
  };

  const sendMessage = () => {
    const msgToDb = async () => {
      try {
        const { data } = await axios.post(
          "chat/saveMessage",
          {
            sender_username: currentUser,
            text: message,
            sender_id: currentUserId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        socket.emit("send-message", data);
        setChat((prev) => [...prev, data]);
      } catch (error) {
        console.log(error);
      }
    };
    msgToDb();
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("user-loggedout", currentUser);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (token) {
      setIsLoading(false);
      fetchChat();
    } else
      setTimeout(() => {
        window.location.reload();
      }, 1500);
  }, []);

  const getLLMResponse = async (prompt,flag) => {
    if(flag)
      return new Promise((resolve) => {
        setFlag(false);
        const timeout = Math.random() * (15000 - 5000) + 5000;
        setTimeout(() => {
          resolve('This is a mock response from the LLM based on user input');
        }, timeout);
      });
  };

  useEffect(() => {
    socket.on("user-connected", () => {
      socket.emit("user-online", currentUser);
      socket.on("users-online", (OnlineUsers) => {
        setOnlineUsers(OnlineUsers);
      });
    });
    socket.on("receive-message",async  (data) => {
      debugger;
      setChat((prev) => [...prev, data]);
      if(!user.isActive && senderid!==data.sender_id){
        const response = await getLLMResponse("This is a prompt based on the inactive user",flag);
        console.log(response);
        try {
          const { data } = await axios.post(
            "chat/saveMessage",
            {
              sender_username: currentUser,
              text: response,
              sender_id: currentUserId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          socket.emit("send-message", data);
        } catch (error) {
          console.log(error);
        }
      }
      
    });
    socket.on("user-disconnected", (OnlineUsers) => {
      setOnlineUsers(OnlineUsers);
    });
  }, [socket]);

  if (isLoading) {
    return (
      <div className="loading">
        <DotWave size={47} speed={1} color="black" backgroundColor="red" />
      </div>
    );
  }
  return (
    <div className="container">
      <SideBar onlineUsers={onlineUsers} currentUser={currentUser} />
      <ChatZone
        chat={chat}
        sender_id={senderid}
        sendMessage={sendMessage}
        setMessage={setMessage}
        currentUser={currentUser}
        message={message}
      />
    </div>
  );
};
