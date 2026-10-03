import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for cross-browser support
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSupport, setHasSupport] = useState(true);

  const recognitionRef = useRef<any>(null);
  const callbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          currentTranscript += item[0].transcript;
        }

        setTranscript(currentTranscript);
        if (callbackRef.current && currentTranscript.trim()) {
          callbackRef.current(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access blocked. Please grant microphone permission in your browser.');
        } else if (event.error === 'no-speech') {
          // Handled gracefully without alarming user
        } else {
          setError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e: any) {
      console.warn('SpeechRecognition initialization error:', e);
      setHasSupport(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const startListening = useCallback((onResultUpdate?: (text: string) => void) => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    callbackRef.current = onResultUpdate || null;

    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // If already started or aborting, stop and re-start
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (err: any) {
          setError('Could not start microphone: ' + err.message);
        }
      }, 150);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    hasSupport,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (text: string, id: string = 'default', onEnd?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      // Stop any existing speech
      window.speechSynthesis.cancel();

      // Clean text for speech (remove markdown symbols like **, ##, etc.)
      const cleanedText = text
        .replace(/[*#_`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\n+/g, ' ')
        .trim();

      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingId(id);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return {
    isSpeaking,
    speakingId,
    isSupported,
    speak,
    stopSpeaking,
  };
}
