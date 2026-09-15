import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

export const VoiceSearch = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscript) {
          onTranscript(transcript);
        }
      };

      setRecognition(rec);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice Recognition is not supported by your current browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-full transition-all duration-300 ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
      }`}
      title={isListening ? "Stop listening" : "Search using your voice"}
    >
      {isListening ? <FaStop className="text-sm" /> : <FaMicrophone className="text-sm" />}
    </button>
  );
};

export default VoiceSearch;
