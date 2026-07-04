"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const quickReplies = [
  "Show RaaS pricing",
  "Deploy time in GTA?",
  "ROI for 50k sqft",
  "Level 5 quality?",
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi, I'm Forge. DryForge AI Site Assistant. Ask me anything about autonomous drywall robots in Ontario & GTA.", isBot: true },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const getResponse = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("price") || t.includes("raas") || t.includes("cost")) 
      return "Professional RaaS is $2.85/sqft all-in (robot + operator + platform + maintenance). Enterprise volume: $1.95/sqft. Includes everything. Full pricing in /pricing.";
    if (t.includes("deploy") || t.includes("gta") || t.includes("timeline") || t.includes("ontario")) 
      return "9-14 days typical deployment in GTA from signed MSA. We manage calibration, safety certs, first 2 weeks of production support. Current fleet availability: 3 weeks lead.";
    if (t.includes("roi") || t.includes("savings") || t.includes("50k") || t.includes("payback")) 
      return "50,000 sqft project: ~$87,000 labor cost reduction. Payback period 3.8–4.5 months on Professional tier. 3 robots recommended. Open the ROI Calculator above for your exact numbers.";
    if (t.includes("level") || t.includes("finish") || t.includes("quality")) 
      return "Level 4.8–5.0 finish on >94% of passes. Proprietary closed-loop sanding + vision QC. 91% reduction in punch list items. Every sqft has timestamped 3D scan record.";
    return "The contractors winning right now are the ones switching to DryForge RaaS. Book your 14-day pilot or site assessment today and see the difference on your own floor.";
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text: text.trim(), isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = { id: Date.now() + 1, text: getResponse(text), isBot: true };
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
        aria-label="Open DryForge AI Assistant"
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
            {/* Professional Header */}
            <div className="flex items-center justify-between bg-[#0F172A] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F97316]">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-semibold tracking-[-0.3px]">Forge • DryForge AI</div>
                  <div className="text-emerald-400 text-xs flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> 
                    Live • 200+ Ontario deployments
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
                  <Bot className="h-3.5 w-3.5 text-[#F97316]" /> Forge is pulling real job data...
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
                placeholder="Ask about robots, pricing, deployment in Ontario..."
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
            <div className="bg-white px-4 pb-2.5 text-center text-[10px] text-slate-400">Trained on 847 real GTA drywall robot deployments</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
