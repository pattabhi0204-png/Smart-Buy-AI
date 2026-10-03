import React, { useState, useEffect, useRef } from 'react';
import { ProductSpecification, FitAnalysis, UserPreferences, ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  HelpCircle,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  StopCircle,
} from 'lucide-react';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/useVoice';

interface ProductQAChatProps {
  product: ProductSpecification;
  analysis: FitAnalysis;
  userPreferences: UserPreferences;
}

export const ProductQAChat: React.FC<ProductQAChatProps> = ({
  product,
  analysis,
  userPreferences,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `I've analyzed the specifications of ${product.name} against your criteria. What specific doubts, scenarios, or trade-offs do you want an honest verdict on? You can type or speak to me directly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition hook
  const {
    isListening,
    transcript,
    error: speechError,
    hasSupport: hasSpeechSupport,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Speech Synthesis hook
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    speakingId,
    isSupported: hasAudioOutputSupport,
  } = useSpeechSynthesis();

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, loading]);

  // Update input while speech recognition is actively dictating
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  const sampleQuestions = [
    `Will the battery last my full daily routine?`,
    `Are there cheaper accessories or proprietary traps?`,
    `How does it hold up over 3+ years of daily use?`,
    `Is this overkill for what I actually do?`,
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    // Stop listening and stop existing speech if any
    stopListening();
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    resetTranscript();
    setLoading(true);

    try {
      const res = await fetch('/api/product-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          product,
          analysis,
          userPreferences,
          chatHistory: messages.slice(-6),
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        const assistantMsgId = 'a_' + Date.now();
        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // If Voice Mode is active, read the response aloud
        if (voiceModeActive && hasAudioOutputSupport) {
          speak(data.reply, assistantMsgId);
        }
      } else {
        throw new Error(data.error || 'Failed to get answer.');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: `Apologies, I encountered an issue: ${err.message || 'Please try asking again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening((text) => {
        setInput(text);
      });
    }
  };

  const handlePlayMessageAudio = (msg: ChatMessage) => {
    if (speakingId === msg.id && isSpeaking) {
      stopSpeaking();
    } else {
      speak(msg.text, msg.id);
    }
  };

  return (
    <div className="bg-[#131519]/90 backdrop-blur-md rounded-2xl border border-zinc-800/80 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Ambient background glow for Voice Mode */}
      {voiceModeActive && (
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-100">
                Unbiased Product Advisor
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Voice Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Ask any follow-up question or talk in real time for candid, zero-hype advice.
            </p>
          </div>
        </div>

        {/* Voice Conversation Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const nextState = !voiceModeActive;
              setVoiceModeActive(nextState);
              if (!nextState) {
                stopSpeaking();
                stopListening();
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              voiceModeActive
                ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-950/50'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${voiceModeActive ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'}`} />
            <span>Voice Conversation Mode</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                voiceModeActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {voiceModeActive ? 'ON' : 'OFF'}
            </span>
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 transition-colors"
              title="Stop Speaking"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Mode Interactive Banner */}
      {voiceModeActive && (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 animate-pulse'
                  : isSpeaking
                  ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/50 animate-bounce'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
              }`}
            >
              {isListening ? (
                <Mic className="w-4 h-4" />
              ) : isSpeaking ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200">
                  {isListening
                    ? 'Listening to your voice...'
                    : isSpeaking
                    ? 'Advisor is speaking verdict...'
                    : loading
                    ? 'Consulting specifications & benchmarks...'
                    : 'Voice Assistant Active'}
                </span>
                {(isListening || isSpeaking) && (
                  <span className="flex space-x-0.5 items-end h-3">
                    <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_100ms] h-full rounded" />
                    <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_200ms] h-2/3 rounded" />
                    <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_300ms] h-full rounded" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {isListening
                  ? 'Speak freely. Tap Stop or Send when done.'
                  : isSpeaking
                  ? 'Audio response playing automatically via Web Speech.'
                  : 'Tap the mic below or click a suggested prompt to speak with the advisor.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/50'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Push to Speak</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading || isListening}
            className="text-[11px] font-medium bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60 px-2.5 py-1 rounded-full transition-colors text-left flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="space-y-3.5 max-h-88 overflow-y-auto pr-1 mb-4 scrollbar-thin">
        {messages.map((m) => {
          const isMsgSpeaking = speakingId === m.id && isSpeaking;

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/30'
                    : isMsgSpeaking
                    ? 'bg-cyan-500 text-zinc-950 ring-2 ring-cyan-400 shadow-md shadow-cyan-500/40 animate-pulse'
                    : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                }`}
              >
                {m.sender === 'user' ? (
                  <User className="w-3.5 h-3.5" />
                ) : isMsgSpeaking ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed transition-all ${
                  m.sender === 'user'
                    ? 'bg-amber-500/15 border border-amber-500/30 text-zinc-100 rounded-tr-xs'
                    : isMsgSpeaking
                    ? 'bg-zinc-900 border border-cyan-500/60 text-zinc-100 rounded-tl-xs shadow-lg shadow-cyan-950/50'
                    : 'bg-zinc-900/90 text-zinc-200 rounded-tl-xs border border-zinc-800'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                <div className="flex items-center justify-between gap-3 mt-2 pt-1.5 border-t border-zinc-800/60">
                  <span
                    className={`text-[9px] ${
                      m.sender === 'user' ? 'text-amber-300/60' : 'text-zinc-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>

                  {/* Audio Readout button for assistant answers */}
                  {m.sender === 'assistant' && hasAudioOutputSupport && (
                    <button
                      type="button"
                      onClick={() => handlePlayMessageAudio(m)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                        isMsgSpeaking
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                      title={isMsgSpeaking ? 'Stop speaking' : 'Read aloud with voice'}
                    >
                      {isMsgSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-cyan-400" />
                          <span>Speaking...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-amber-400/90 py-1.5 px-3 rounded-xl bg-amber-950/20 border border-amber-900/40 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Consulting technical specs &amp; unbiased benchmarks...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Transcription Live Preview if listening */}
      {isListening && (
        <div className="mb-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between gap-2 text-xs text-rose-200">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="truncate">
              {input ? input : 'Listening... Speak your question now'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="shrink-0 px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] disabled:opacity-40"
          >
            Send Spoken Question
          </button>
        </div>
      )}

      {speechError && (
        <div className="mb-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300">
          {speechError}
        </div>
      )}

      {/* Input box form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your speech...'
                : `Ask about ${product.brand} ${product.model || 'this item'} or speak your doubts...`
            }
            disabled={loading}
            className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:ring-2 bg-zinc-900/90 shadow-2xs transition-all ${
              isListening
                ? 'border-rose-500 ring-2 ring-rose-500/30'
                : 'border-zinc-800 focus:ring-amber-500/20 focus:border-amber-500'
            }`}
          />

          {/* Inline Mic toggle */}
          {hasSpeechSupport && (
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/50 animate-pulse'
                  : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak your question'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold rounded-xl transition-all disabled:opacity-40 shadow-xs cursor-pointer"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
