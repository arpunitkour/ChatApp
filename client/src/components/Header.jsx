import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { BsFillPersonFill } from "react-icons/bs";
import { BsBoxArrowLeft } from "react-icons/bs";
import io from "socket.io-client";
import { Switch } from "@mui/material"; 
import axios from "../axios/axios";

const socket = io.connect("http://localhost:3000");


const Header = () => {
  const [isAvailable, setIsAvailable] = useState(true); 
  const navigate = useNavigate();
  const [userId, setUserId] = useState(Cookies.get("user_id"));

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

  const logoutHandler = () => {
    socket.emit("user-loggedout", Cookies.get("username"));
    Cookies.remove("jwtToken");
    Cookies.remove("user_id");
    Cookies.remove("username");
    navigate("/");
  };

  

  const toggleAvailability = async(e) => {
    setIsAvailable(e.target.checked?1:0);
    Cookies.set("isActive", e.target.checked ? 1 : 0, {
      expires: 7,
      path: "/chat",
    });
    try {
      const res = await axios.post("set-avalability", {
        user_id: Cookies.get("user_id"),
        isActive: e.target.checked ? 1 : 0,
      });
      console.log(res.data.message )
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <nav>
      {/* Availability Switch */}
      <div className="online">
        <Switch
          checked={isAvailable} 
          onChange={toggleAvailability} 
          color="primary" 
          style={{
            color: isAvailable ? "green" : "red", 
          }}
        />
        <BsFillPersonFill />
        <span>{isAvailable ? "Available" : "Busy"}</span>
      </div>

      {/* Logout Button */}
      <div className="logout" onClick={logoutHandler}>
        <input
          type="button"
          value="Logout"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "15px",
          }}
        />
        <BsBoxArrowLeft />
      </div>
    </nav>
  );
};

export default Header;
