import React, { useState } from 'react';
import {
  Bot,
  Send,
  Terminal,
  Activity,
} from 'lucide-react';
import { AiMessage } from '../types';

export const AiCommandCenter: React.FC = () => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'NEXUS Operations Console initialized. All city subsystems streaming live telemetry. Enter a systems inquiry below.',
      timestamp: '10:00:02 AM',
      engineeringFocus: ['CSE', 'AI / Machine Learning', 'ECE']
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const presetQuestions = [
    'How is the city performing?',
    'Which area has high traffic?',
    'How much renewable energy is being generated?',
    'Which engineers manage the smart grid?',
    'What happens during a sudden flash flood?',
    'How does biomedical engineering integrate into the city?'
  ];

  const generateSimulatedResponse = (query: string): { text: string; disciplines: string[]; telemetry?: string } => {
    const q = query.toLowerCase();

    if (q.includes('performing') || q.includes('status') || q.includes('health') || q.includes('overall')) {
      return {
        text: 'NEXUS Smart City is currently operating at optimal 99.98% efficiency. Air Quality Index stands at 94 AQI (Pristine/Good), energy grid is 87% renewable-powered, and average arterial traffic speed is 48 km/h. All 14 engineering subsystems report zero critical alerts.',
        disciplines: ['CSE', 'ECE', 'AI / Machine Learning', 'Environmental Engineering'],
        telemetry: 'Grid Stability: 50.002 Hz · AQI: 94 · Water: 92% Reserve'
      };
    }

    if (q.includes('traffic') || q.includes('congestion') || q.includes('road') || q.includes('car')) {
      return {
        text: 'Metropolitan traffic is currently categorized as LOW across all 5 sectors. Sector 2 (Central Financial) exhibits moderate density (62% capacity), but adaptive green-wave light timing managed by AI/ML and ECE sensor radar has cleared downtown bottlenecks with zero queuing delays.',
        disciplines: ['Automobile Engineering', 'AI / Machine Learning', 'ECE', 'Civil Engineering'],
        telemetry: 'Congestion Index: 14% · Green Wave Active: 48 km/h'
      };
    }

    if (q.includes('energy') || q.includes('power') || q.includes('renewable') || q.includes('solar') || q.includes('wind')) {
      return {
        text: 'Total clean renewable generation is currently 524 MW, fulfilling 87% of instantaneous municipal demand. Solar arrays contribute 54%, while offshore floating wind turbines provide 33%. Excess midday energy (48 MW) is actively directed to PEM electrolyzers for green hydrogen synthesis.',
        disciplines: ['Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'Civil Engineering'],
        telemetry: 'Renewables: 87% · Solar: 54% · Wind: 33% · H2 Generation: 50t/day'
      };
    }

    if (q.includes('grid') || q.includes('electrical') || q.includes('manage the smart grid')) {
      return {
        text: 'The NEXUS Smart Grid is collaboratively managed by four core teams: Electrical Engineering (designs solid-state switchgear & HVDC lines), CSE (operates SCADA cloud and event brokers), ECE (installs sub-second PMU sensors), and Mechanical Engineering (maintains turbine kinetics & cooling).',
        disciplines: ['Electrical Engineering', 'CSE', 'ECE', 'Mechanical Engineering'],
        telemetry: 'Substation 7: Active · Islanding Ready: 16ms response'
      };
    }

    if (q.includes('flood') || q.includes('water leak') || q.includes('rain') || q.includes('disaster')) {
      return {
        text: 'During flood threats, ultrasonic river level sensors (ECE) alert the city OS in milliseconds. AI/ML runs hydrodynamic flood simulations, prompting Civil & Mechanical engineers to hydraulically engage floodgates and activate 150,000 L/min subterranean drainage pumps, diverting water into closed-loop reservoirs.',
        disciplines: ['Civil Engineering', 'Environmental Engineering', 'Mechanical Engineering', 'CSE', 'AI / Machine Learning'],
        telemetry: 'Stormwater Reserves: 18.4M Liters · Hydraulic Gates: Ready'
      };
    }

    if (q.includes('biomedical') || q.includes('health') || q.includes('hospital') || q.includes('patient')) {
      return {
        text: 'Biomedical Engineering links wearable citizen biosensors to the secure health cloud (CSE), detects abnormal cardiac rhythms in real time, and triggers Aerospace autonomous eVTOL drones carrying automated defibrillators within 2.1 minutes citywide.',
        disciplines: ['Biomedical Engineering', 'Aerospace Engineering', 'CSE', 'ECE'],
        telemetry: 'Trauma Response: 2.1 min · Active Monitored Vitals: 240 patients'
      };
    }

    return {
      text: `Telemetry inquiry received for: "${query}". All municipal telemetry streams verify interdisciplinary coordination. Every physical asset is monitored by ECE sensors, processed by CSE cloud servers, modeled by AI/ML, and maintained by Civil, Electrical, and Mechanical engineering divisions.`,
      disciplines: ['CSE', 'AI / Machine Learning', 'ECE', 'Civil Engineering'],
      telemetry: 'Query Telemetry Synced · System Verified'
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg: AiMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateSimulatedResponse(query);
      const assistantMsg: AiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString(),
        engineeringFocus: response.disciplines,
        telemetryRef: response.telemetry
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 300);
  };

  return (
    <section
      id="ai-command"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#09090d] text-[#f4f1ea] border-t border-white/[0.06]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            <Bot className="w-3.5 h-3.5" />
            <span>MUNICIPAL SYSTEMS TERMINAL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight mb-3">
            NEXUS Operations Console
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Query municipal telemetry, subsystem performance, or cross-engineering coordination workflows.
          </p>
        </div>

        {/* Preset Query Controls */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3.5 py-1.5 rounded-lg bg-[#111116] hover:bg-[#17171f] border border-white/[0.08] hover:border-[#d4a853]/40 text-zinc-300 hover:text-[#e8c678] text-xs font-mono transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Main Terminal Window */}
        <div className="rounded-2xl bg-[#111116] border border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col h-[480px]">
          {/* Terminal Title Bar */}
          <div className="px-5 py-3 bg-[#0d0d12] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-[#e8c678]">
              <Terminal className="w-4 h-4 text-[#d4a853]" />
              <span>NEXUS-OPS-TERMINAL · READY</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ONLINE</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-[#d4a853]/12 border border-[#d4a853]/30 text-[#d4a853] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#d4a853] text-[#09090d] font-medium rounded-tr-sm'
                      : 'bg-[#17171f] border border-white/[0.08] text-zinc-200 rounded-tl-sm'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.engineeringFocus && msg.engineeringFocus.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                        Divisions:
                      </span>
                      {msg.engineeringFocus.map((disc, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#0d0d12] border border-[#d4a853]/25 text-[#e8c678] text-[10px] font-mono"
                        >
                          {disc}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.telemetryRef && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 tabular-nums">
                      <Activity className="w-3 h-3 shrink-0" />
                      <span>{msg.telemetryRef}</span>
                    </div>
                  )}

                  <div
                    className={`mt-1.5 text-[10px] font-mono text-right tabular-nums ${
                      msg.sender === 'user' ? 'text-[#09090d]/70' : 'text-zinc-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-[#17171f] border border-white/[0.12] text-zinc-200 flex items-center justify-center shrink-0">
                    <span className="font-mono text-[10px] font-bold">ENG</span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-xs font-mono text-[#e8c678]">
                <div className="w-8 h-8 rounded-lg bg-[#d4a853]/12 border border-[#d4a853]/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#d4a853]" />
                </div>
                <span>Querying municipal telemetry streams...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-[#0d0d12] border-t border-white/[0.08]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about traffic, energy grid, floods, biomedical systems..."
                className="flex-1 bg-[#14141b] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-[#f4f1ea] placeholder-zinc-500 focus:outline-none focus:border-[#d4a853] font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>SEND</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
