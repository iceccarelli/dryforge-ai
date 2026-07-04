"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

let messageId = 1;

const quickReplies = [
  "How does pricing work?",
  "What is the pilot program?",
  "Is this deployed anywhere yet?",
  "How do robots handle quality?",
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi, I'm Forge — the DryForge site assistant. DryForge is a pre-launch venture building robot-assisted drywall finishing for the GTA. Ask me about the pilot program, pricing model, or the technology.", isBot: true },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const getResponse = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("price") || t.includes("pricing") || t.includes("raas") || t.includes("cost"))
      return "Our target model is a single all-in per-sqft rate (robots + operators + software + maintenance, no capex) aimed at undercutting fully-loaded manual finishing cost on large projects. Exact rates will be set and published from real pilot data — founding partners lock preferential pricing. See /pricing for the target model.";
    if (t.includes("pilot") || t.includes("program") || t.includes("founding"))
      return "The founding pilot: you contribute a bounded section of a real GTA project plus honest baseline data; we deploy supervised robots with our engineers on-site and measure everything against your manual crews. You get the full results — good or bad — and locked founding pricing if you continue. There's a defined exit for both sides.";
    if (t.includes("deploy") || t.includes("anywhere") || t.includes("customer") || t.includes("live"))
      return "Straight answer: no. DryForge is pre-launch with no deployed fleet yet. That's exactly why we're recruiting founding pilot partners — the first deployments will be measured openly with them. We won't show you a metric we didn't measure.";
    if (t.includes("level") || t.includes("finish") || t.includes("quality"))
      return "The design goal is Level 4/5 finishing with continuous vision-based quality measurement, so every square foot has a timestamped quality record. Humans supervise every robot and handle edges and complex geometry. These are engineering targets to be validated in pilots.";
    if (t.includes("roi") || t.includes("savings") || t.includes("payback"))
      return "Use the planning model on the homepage (#roi-calculator). It compares your manual finishing cost against our target rate using published industry productivity benchmarks — assumptions are disclosed right next to the results.";
    return "Good question — the honest answer is that DryForge is early and we'd rather discuss it directly. Email pilot@dryforge.ai or use the Apply button, and ask me about pricing, the pilot program, or the technology.";
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: ++messageId, text: text.trim(), isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = { id: ++messageId, text: getResponse(text), isBot: true };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 680);
  };

  const handleQuick = (reply: string) => sendMessage(reply);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-[0_10px_40px_rgb(15,23,42,0.35)] hover:bg-slate-800 active:scale-[0.96] transition-all"
        aria-label="Open DryForge site assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-[92px] right-6 z-[70] flex h-[490px] w-full max-w-[370px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#0F172A] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F97316]">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-semibold tracking-[-0.3px]">Forge • DryForge Assistant</div>
                  <div className="text-slate-400 text-xs">
                    Scripted assistant • Pre-launch venture
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 space-y-4 text-[13.5px] leading-relaxed">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[86%] rounded-2xl px-4 py-[13px] ${msg.isBot ? "bg-white border border-slate-200 text-slate-800" : "bg-[#0F172A] text-white"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 pl-1 text-xs text-slate-500">
                  <Bot className="h-3.5 w-3.5 text-[#F97316]" /> Forge is typing...
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div className="flex flex-wrap gap-1.5 border-t bg-white px-3.5 py-3">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuick(reply)}
                  className="rounded-2xl border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-600 transition hover:border-[#F97316] hover:text-[#F97316]"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t bg-white p-3.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about the pilot, pricing, or the robots..."
                className="flex-1 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-[#F97316] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F172A] text-white transition active:scale-95 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="bg-white px-4 pb-2.5 text-center text-[10px] text-slate-400">Scripted responses — not a live AI. For real answers: pilot@dryforge.ai</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
