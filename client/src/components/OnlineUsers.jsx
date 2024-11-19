import { useEffect, useState } from "react";
import { BsFillPersonFill } from "react-icons/bs";
import axios from "../axios/axios"; // Ensure this is correctly imported

const OnlineUsers = ({ currentUser }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Fetch users and their isActive status
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("all-users");

        setOnlineUsers(data.users); 
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <div className="online-users-h">
        Users <BsFillPersonFill />
      </div>
      <div className="o-u-container">
        {onlineUsers.map((usr) => {
          return (
            <div className="online-user" key={usr.username}>
              {usr.username === currentUser ? "You" : usr.username}
              <p style={{ color: usr.isActive ? "#00FF00" : "#FF0000" }}>
                {usr.isActive ? "Available" : "Busy"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsers;
