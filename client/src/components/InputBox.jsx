import { BsFillSendFill } from "react-icons/bs";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "../axios/axios";

const InputBox = ({ sendMessage, setMessage, message }) => {

  const [userId, setUserId] = useState(Cookies.get("user_id"));
  const [isAvailable, setIsAvailable] = useState(true);
  useEffect(() => {
    const fetchUserAvailability = async () => {
      try {
        const res = await axios.get(`get-user/${userId}`);
        setIsAvailable(res.data.user.isActive);
      } catch (error) {
        console.log("Error fetching user availability:", error);
      }
    };

    fetchUserAvailability();
  }, [userId]);
  return (
    <form className="send-msg-container" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        disabled={!isAvailable}
      />
      <button
        onClick={() => {
          setMessage("");
          sendMessage();
        }}
      >
        Send
        <BsFillSendFill />
      </button>
    </form>
  );
};

export default InputBox;
