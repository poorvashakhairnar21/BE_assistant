const TextToSpeech = () => {
    const [text, setText] = useState("");
    

    const speak = (text) => {
        if (!text.trim()) return;
        
        utteranceRef.current.text = text;
        utteranceRef.current.rate = 1;
        utteranceRef.current.pitch = 1;
        
        synthRef.current.speak(utteranceRef.current);
    };

    const stopSpeaking = () => {
        synthRef.current.cancel();
    };

    git checkout c14f4cf46a737512ddebc8daaa59e569556b0dcb
