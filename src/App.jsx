import { useState, useEffect } from "react";
import './App.css'
export default function ChatApp() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Please select a language:", sender: "bot" },
  ]);
  const [step, setStep] = useState("language"); // Tracks chat steps
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState([]);

  const baseApiURL = "https://sheets.googleapis.com/v4/spreadsheets/1oxckE_yiPgTxAAbBCwEhtjdz0cNherZsKBj4r0WCTc0/values/";
  const apiKey = "AIzaSyBvFeS5X7YUVuxfwU1d3aRbwEj4vuqZ1eA";

  const daysMapping = { "1st day": "B", "2nd day": "C", "3rd day": "D", "4th day": "E", "5th day": "F", "6th day": "G", "7th day": "H" };
  const timeSlots = ["09:00 - 10:00", "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00", "13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00", "17:00 - 17:30", "17:30 - 18:00", "18:00 - 18:30", "18:30 - 19:00"];

  const handleUserResponse = (response) => {
    let newMessages = [...messages, { id: Date.now(), text: response, sender: "user" }];

    if (step === "language") {
      setSelectedLanguage(response);
      newMessages.push({ id: Date.now(), text: "Choose a weekday:", sender: "bot" });
      setStep("weekday");
    } else if (step === "weekday") {
      setSelectedDay(response);
      newMessages.push({ id: Date.now(), text: "Choose a time slot:", sender: "bot" });
      setStep("time");
    } else if (step === "time") {
      setSelectedTime(response);
      fetchAvailableTeachers(response);
      setStep("done");
    }

    setMessages(newMessages);
  };

  const fetchAvailableTeachers = async (timeSlot) => {
    try {
      const column = daysMapping[selectedDay];
      const rowIndex = timeSlots.indexOf(timeSlot) + 2; // Adjust for row offset
      if (!column || rowIndex < 2) return;

      const apiURL = `${baseApiURL}${selectedLanguage}!${column}${rowIndex}:${column}${rowIndex}?key=${apiKey}`;
      const response = await fetch(apiURL);
      const data = await response.json();

      const teachers = data.values ? data.values[0][0] : "No available teachers";

      setAvailableTeachers(teachers);
      setMessages((prev) => [...prev, { id: Date.now(), text: `Available teachers: ${teachers}`, sender: "bot" }]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const resetChat = () => {
    setMessages([{ id: 1, text: "Hello! Please select a language:", sender: "bot" }]);
    setStep("language");
    setSelectedLanguage("");
    setSelectedDay("");
    setSelectedTime("");
    setAvailableTeachers([]);
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          <button className="reset-button" onClick={resetChat}>🔄 Restart</button>
        </div>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          {step === "language" && (
            <div className="button-group">
              <button className="chat-button" onClick={() => handleUserResponse("AzDili")}>AZ</button>
              <button className="chat-button" onClick={() => handleUserResponse("RusDili")}>RUS</button>
              <button className="chat-button" onClick={() => handleUserResponse("EngDili")}>ENG</button>
            </div>
          )}
          {step === "weekday" && (
            <div className="button-group">
              {Object.keys(daysMapping).map((day) => (
                <button key={day} className="chat-button" onClick={() => handleUserResponse(day)}>{day}</button>
              ))}
            </div>
          )}
          {step === "time" && (
            <div className="button-group">
              {timeSlots.map((time) => (
                <button key={time} className="chat-button" onClick={() => handleUserResponse(time)}>{time}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
