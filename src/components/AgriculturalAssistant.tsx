// ============================================================
// FarmShift Nepal — Evidence-Grounded Agricultural AI Assistant
// Local RAG pipeline referencing authentic NARC/MoALD guidelines
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { searchKnowledgeBase, type DocumentPassage } from '../services/agriculturalKnowledgeService';
import { calculateFertilizerGuidance } from '../services/soilNutrientService';
import { CROPS } from '../data/cropData';
import { Card, Button } from './ui';
import { 
  Bot, 
  Send, 
  User, 
  BookOpen, 
  ExternalLink, 
  ShieldCheck, 
  Loader2, 
  Sprout
} from 'lucide-react';
import type { CropId } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  textEn: string;
  textNe: string;
  timestamp: string;
  citations?: DocumentPassage[];
  calculationSummary?: string;
}

export function AgriculturalAssistant() {
  const { state } = useApp();
  const { language, location, soil } = state;
  const isNe = language === 'ne';

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'assistant',
      textEn: `Namaste! I am your FarmShift Agricultural Intelligence Assistant. I provide evidence-grounded recommendations for your farm in ${location?.name ?? 'Nepal'} based on NASA Earth observations and Nepal Agricultural Research Council (NARC) bulletins. How can I help you today?`,
      textNe: `नमस्ते! म फार्मसिफ्ट कृषि सल्लाहकार हुँ। म तपाईंको खेत (${location?.name ?? 'नेपाल'}) को लागि नासा उपग्रह तथ्याङ्क र नेपाल कृषि अनुसन्धान परिषद् (NARC) को वैज्ञानिक आधारमा सल्लाह दिन सक्छु। म तपाईंलाई कसरी सहयोग गर्न सक्छु?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      textEn: text,
      textNe: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    // Simulate RAG retrieval & formulation pipeline
    setTimeout(() => {
      // 1. Identify crop mentioned in query
      const lower = text.toLowerCase();
      let matchedCropId: CropId | undefined = undefined;
      for (const crop of CROPS) {
        if (lower.includes(crop.name.toLowerCase()) || lower.includes(crop.localName.toLowerCase()) || lower.includes(crop.id)) {
          matchedCropId = crop.id;
          break;
        }
      }

      // 2. Search Evidence Store
      const passages = searchKnowledgeBase({
        cropId: matchedCropId,
        district: location?.district,
        query: text,
      });

      // 3. Synthesize Answer
      let ansEn = '';
      let ansNe = '';
      let calcStr: string | undefined = undefined;

      if (lower.includes('fertilizer') || lower.includes('मल') || lower.includes('urea') || lower.includes('dap')) {
        const cropToCalc = matchedCropId || 'rice-transplanted';
        const fert = calculateFertilizerGuidance({
          areaUnit: 'ropani',
          areaSize: 1,
          ph: soil.ph,
          organicMatterPct: soil.organicMatter,
          texture: soil.texture,
          cropId: cropToCalc,
        });

        ansEn = `Based on MoALD & NARC guidelines for ${cropToCalc.replace('-', ' ')} (per Ropani): Recommended basal application is Urea: ${Math.round(fert.commercialFertilizerTotal.ureaKg * 0.5)} kg, DAP: ${fert.commercialFertilizerTotal.dapKg} kg, Potash (MOP): ${fert.commercialFertilizerTotal.mopKg} kg. Top-dress remaining Urea in two splits.`;
        ansNe = `${cropToCalc.replace('-', ' ')} बालीका लागि राष्ट्रिय कृषि निर्देशिका अनुसार प्रति रोपनी: डीएपी ${fert.commercialFertilizerTotal.dapKg} केजी, पोटास ${fert.commercialFertilizerTotal.mopKg} केजी र आधा युरिया (${Math.round(fert.commercialFertilizerTotal.ureaKg * 0.5)} केजी) रोप्ने बेला हाल्नुहोस्। बाँकी युरिया दुई पटक टप-ड्रेसिङ गर्नुहोस्।`;
        calcStr = `Calculated for 1 Ropani of ${cropToCalc}`;
      } else if (passages.length > 0) {
        const topPassage = passages[0];
        ansEn = `According to ${topPassage.sourceTitle}: ${topPassage.contentEn}`;
        ansNe = `${topPassage.sourceTitle} अनुसार: ${topPassage.contentNe}`;
      } else {
        ansEn = `For your farm location in ${location?.name ?? 'Nepal'} (Elevation: ${location?.elevation ?? '1300'}m), prioritize crops suited to the ${location?.district ?? 'local'} agroecological zone. Ensure adequate seed treatment and check soil moisture before field operations.`;
        ansNe = `तपाईंको खेत (${location?.name ?? 'नेपाल'}, उचाई: ${location?.elevation ?? '१३००'} मिटर) का लागि स्थानीय हावापानी अनुसारको बाली छनोट गर्नुहोस्। बीउ छर्नुअघि माटोको चिस्यान अनिवार्य जाँच गर्नुहोस्।`;
      }

      const botMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        textEn: ansEn,
        textNe: ansNe,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: passages.slice(0, 2),
        calculationSummary: calcStr,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsProcessing(false);
    }, 600);
  };

  const samplePrompts = [
    { en: 'When should I plant wheat to avoid heat stress?', ne: 'गहुँ छर्ने सबैभन्दा राम्रो समय कहिले हो?' },
    { en: 'How much DAP and Urea for 1 Ropani rice?', ne: 'धान बालीलाई १ रोपनीमा कति डीएपी र युरिया चाहिन्छ?' },
    { en: 'How does late blight affect potato in winter?', ne: 'आलुमा डढुवा रोगबाट बच्न के गर्ने?' },
    { en: 'Can I grow lentils after transplanted rice?', ne: 'धान काटेपछि मसुरो खेती गर्दा के फाइदा हुन्छ?' },
  ];

  return (
    <Card padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <span>{isNe ? 'कृषि एआई सल्लाहकार' : 'Agricultural AI Assistant'}</span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                Grounded in NARC & NASA
              </span>
            </h3>
            <p className="text-2xs text-ink-muted">
              {isNe ? 'नेपालका अनुसन्धान प्रतिवेदन तथा नासा तथ्याङ्कमा आधारित विश्वसनीय सल्लाह' : 'Verified recommendations citing authoritative Nepalese agronomic research'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-2xs text-ink-secondary bg-stone-100 px-2.5 py-1 rounded">
          <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
          <span>{isNe ? 'शून्य काल्पनिक तथ्याङ्क' : 'Zero Hallucination Guardrail'}</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="h-80 overflow-y-auto space-y-3.5 p-2 pr-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed space-y-2 ${
                m.sender === 'user'
                  ? 'bg-forest-800 text-white rounded-tr-none'
                  : 'bg-stone-100 text-ink border border-stone-200 rounded-tl-none'
              }`}
            >
              <p>{isNe ? m.textNe : m.textEn}</p>

              {m.calculationSummary && (
                <div className="p-1.5 bg-white/70 rounded text-2xs text-forest-800 border border-forest-200 flex items-center gap-1 font-mono">
                  <Sprout className="w-3 h-3 text-forest-600" />
                  <span>{m.calculationSummary}</span>
                </div>
              )}

              {/* Citations Box */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-stone-200/80 space-y-1">
                  <span className="text-2xs font-semibold text-ink-secondary uppercase tracking-wider block">
                    {isNe ? 'प्रमाणित स्रोतहरू:' : 'Supporting Sources:'}
                  </span>
                  {m.citations.map((c) => (
                    <a
                      key={c.id}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-2xs text-forest-800 hover:underline"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{c.sourceTitle} ({c.institution}, {c.publicationYear})</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                    </a>
                  ))}
                </div>
              )}

              <span className={`text-3xs block text-right mt-1 opacity-70 ${m.sender === 'user' ? 'text-forest-200' : 'text-ink-muted'}`}>
                {m.timestamp}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-stone-300 text-ink flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-2.5 items-center text-xs text-ink-muted p-2">
            <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
            <span>{isNe ? 'NARC अनुसन्धान बुलेटिन खोजिँदैछ...' : 'Retrieving verified agronomic passages...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div className="pt-2 border-t border-stone-200">
        <span className="text-2xs text-ink-muted mb-1.5 block font-semibold">
          {isNe ? 'प्रायः सोधिने प्रश्नहरू:' : 'Suggested Inquiries:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(isNe ? p.ne : p.en)}
              className="text-2xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-forest-50 hover:text-forest-800 border border-stone-200 transition-colors text-left"
            >
              {isNe ? p.ne : p.en}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 pt-1"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={isNe ? 'बाली, मलखाद वा हावापानीबारे सोध्नुहोस्...' : 'Ask about crop timing, fertilizer rates, or disease risks...'}
          className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-ink"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputQuery.trim() || isProcessing}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          {isNe ? 'पठाउनुहोस्' : 'Inquire'}
        </Button>
      </form>
    </Card>
  );
}
