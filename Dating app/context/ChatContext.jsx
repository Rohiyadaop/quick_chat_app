// import { useContext } from "react";
// import { useState } from "react";
// import { createContext } from "react";
// import { AuthContext } from "./AuthContext";
// import toast from "react-hot-toast";
// import { useEffect } from "react";



// export const ChatContext = createContext();

// export const ChatProvider = ({children})=>{

//     const [messages , setMessages] = useState([]);
//     const [users , setUsers] = useState([]);
//     const [selectedUser , setSelectedUser] = useState(null);
//     const [unseenMessages , setUnseenMessages] = useState([]);

//     const {socket , axios} = useContext(AuthContext);

//     // to get all user side bar 
//     const getUsers = async ()=>{
//         try {
//            const {data} =  await axios.get("/api/messages/users");
//            if(data.success){
//             setUsers(data.users)
//             setUnseenMessages(data.unseenMessages)

//            }
//         } catch (error) {
//             toast.error(error.messages)
//         }
//     }


// //  function to get message for selected user 
// const getMessages = async (userId)=>{
//     try {
//        const {data } =  await axios.get(`/api/messages/${userId}`)
//        if(data.success){
//         setMessages(data.messages)

//        }
//     } catch (error) {
//         toast.error(error.messages)
//     }
// }

// // function to send the message 
// const sendMessage = async (messageData)=>{
//     try {
//         const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
//         if(data.success){
//             setMessages((prevMessages)=>[...prevMessages , data.newMessage])
//         }else{
//             toast.error(data.message)
//         }

//     } catch (error) {
//         toast.error(error.message);
//     }
// } 

// // function to subscribe the message for selsectred user 

//     const subscribeToMessages = async ()=>{
//         if(!socket) return ;
        
//         socket.on("newMessage",(newMessage)=>{
//             if(selectedUser && newMessage.senderId === selectedUser._id){
//                 newMessage.seen = true; 
//                 setMessages((prevMessages)=>[...prevMessages,newMessage]);
//                 axios.put(`/api/messages/mark/${newMessage._id}`);

//             }else{
//                 setUnseenMessages((prevUnseenMessage)=>({
//                     ...prevUnseenMessage ,[newMessage.senderId] : prevUnseenMessage[newMessage.senderId] ? prevUnseenMessage[newMessage.senderId]+1 : 1
//                 }))
//             }
//         })
//     }

// //  to unsubscribe to message 
// const unsubscribeToMessages = ()=>{
//     if(socket) socket.off("newMessage");

// }


// useEffect(()=>{
//     subscribeToMessages();
//     return ()=> unsubscribeToMessages();

// } ,[socket, selectedUser])

// const value = {
//     messages, users, selectedUser , getUsers, getMessages, sendMessage , setSelectedUser, unseenMessages , setUnseenMessages
// }

//     return (
//         <ChatContext.Provider  value={value}>
//             {children}
//         </ChatContext.Provider>
//     )
// }


import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState([]);

  const { socket, axios } = useContext(AuthContext);

  // Get all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) setMessages(data.messages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message (text + base64 image)
  const sendMessage = async (messageData) => {
    try {
      const payload = {
        text: messageData.text || "",
        image: messageData.image || "", // base64 string
      };

      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Subscribe to socket messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Unsubscribe from socket
  const unsubscribeToMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
