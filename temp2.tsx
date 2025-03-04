import React, { useState, useRef } from "react";
import { useSpeechSynthesis } from "react-speech-kit";

const SpeechComponent = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const forceStopRecognitionRef = useRef(false);
  const { speak, cancel, voices } = useSpeechSynthesis();

  const handleSpeechEnd = () => {
    console.log("Speech ended.");
    setIsSpeaking(false);

    setTimeout(() => {
      if (forceStopRecognitionRef.current) {
        forceStopRecognitionRef.current = false;
        console.log("Stop speaking forcefully...");
      } else {
        console.log("Stop speaking...");
        startListening(); // Ensure this function exists
      }
    }, 500);
  };

  const speakText = (text: string) => {
    if (!text.trim()) return;

    console.log("Start speaking...");
    setIsSpeaking(true);

    // Create a SpeechSynthesisUtterance instance for better event handling
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[0]; // Select voice dynamically if needed
    utterance.rate = 1; // Adjust speed
    utterance.pitch = 1; // Adjust pitch
    utterance.onend = handleSpeechEnd;
    utterance.onerror = (e) => console.error("Speech Error:", e);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeakingText = () => {
    console.log("Stopping speech...");
    cancel(); // Stop speech
    setIsSpeaking(false);
    if (forceStopRecognitionRef.current) {
      forceStopRecognitionRef.current = false;
      console.log("Stop speaking forcefully...");
    }
  };

  return (
    <div>
      <button onClick={() => speakText("Hello, welcome to React Speech Synthesis!")}>
        Speak
      </button>
      <button onClick={stopSpeakingText}>Stop</button>
    </div>
  );
};

export default SpeechComponent;
