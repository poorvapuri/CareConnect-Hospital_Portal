import React, { useState, useRef, useEffect } from 'react';
import stringSimilarity from "string-similarity";

// Synonym helper (smart matching)
const symptomSynonyms = {
  "pain": ["ache", "hurting", "hurt", "sore", "paining"],
  "breathing difficulty": ["hard to breathe", "can't breathe", "trouble breathing", "difficulty breathing", "breath problem"],
  "headache": ["head pain", "head is hurting", "my head hurts"],
  "vomiting": ["throwing up", "throw up"],
  "diarrhea": ["loose motions", "loose motion"],
  "fatigue": ["tired", "weakness", "exhausted", "low energy"]
};

// FINAL COMPLETE, CLEAN, NON-DUPLICATE SYMPTOM MAP
const symptomMap = {
  "fever": "You can visit a General Physician",
  "high temperature": "You can visit a General Physician",
  "chills": "You can visit a General Physician",
  "fatigue": "You can visit a General Physician",
  "cold": "You can visit a General Physician",
  "flu": "You can visit a General Physician",
  "cough": "You can visit a General Physician",
  "dry cough": "You can visit a General Physician",
  "wet cough": "You can visit a General Physician",
  "sore throat": "You can visit a General Physician",
  "runny nose": "You can visit a General Physician",

  "headache": "You can visit a General Physician",
  "severe headache": "You can visit a Neurologist",
  "migraine": "You can visit a Neurologist",
  "dizziness": "You can visit a General Physician",

  "eye pain": "You can visit an Ophthalmologist",
  "blurry vision": "You can visit an Ophthalmologist",
  "red eyes": "You can visit an Ophthalmologist",
  "dry eyes": "You can visit an Ophthalmologist",

  "ear pain": "You can visit an ENT Specialist",
  "ringing in ears": "You can visit an ENT Specialist",
  "hearing problem": "You can visit an ENT Specialist",
  "blocked nose": "You can visit an ENT Specialist",
  "sinus": "You can visit an ENT Specialist",
  "sinus pain": "You can visit an ENT Specialist",

  "tooth pain": "You can visit a Dentist",
  "toothache": "You can visit a Dentist",
  "teeth pain": "You can visit a Dentist",
  "gum bleeding": "You can visit a Dentist",
  "cavity": "You can visit a Dentist",
  "bad breath": "You can visit a Dentist",
  "jaw pain": "You can visit a Dentist",

  "neck pain": "You can visit an Orthopedic",
  "stiff neck": "You can visit an Orthopedic",
  "back pain": "You can visit an Orthopedic",

  "arm pain": "You can visit an Orthopedic",
  "shoulder pain": "You can visit an Orthopedic",
  "wrist pain": "You can visit an Orthopedic",

  "leg pain": "You can visit an Orthopedic",
  "knee pain": "You can visit an Orthopedic",
  "foot pain": "You can visit an Orthopedic",
  "ankle pain": "You can visit an Orthopedic",
  "bone fracture": "You can visit an Orthopedic",

  "muscle pain": "You can visit a Physiotherapist",
  "sprain": "You can visit a Physiotherapist",

  "chest pain": "You can visit a Cardiologist",
  "heart pain": "You can visit a Cardiologist",
  "palpitations": "You can visit a Cardiologist",
  "fast heartbeat": "You can visit a Cardiologist",
  "high blood pressure": "You can visit a Cardiologist",

  "shortness of breath": "You can visit a Pulmonologist",
  "breathing difficulty": "You can visit a Pulmonologist",
  "difficulty in breathing": "You can visit a Pulmonologist",
  "trouble breathing": "You can visit a Pulmonologist",
  "asthma": "You can visit a Pulmonologist",

  "stomach pain": "You can visit a Gastroenterologist",
  "tummy pain": "You can visit a Gastroenterologist",
  "gas": "You can visit a Gastroenterologist",
  "acidity": "You can visit a Gastroenterologist",
  "constipation": "You can visit a Gastroenterologist",
  "diarrhea": "You can visit a Gastroenterologist",
  "nausea": "You can visit a Gastroenterologist",
  "vomiting": "You can visit a Gastroenterologist",

  "skin rash": "You can visit a Dermatologist",
  "skin allergy": "You can visit a Dermatologist",
  "itching": "You can visit a Dermatologist",
  "acne": "You can visit a Dermatologist",
  "hair fall": "You can visit a Dermatologist",

  "stress": "You can visit a Psychiatrist",
  "anxiety": "You can visit a Psychiatrist",
  "depression": "You can visit a Psychiatrist",
  "mood swings": "You can visit a Psychiatrist",
  "panic attack": "You can visit a Psychiatrist",
  "insomnia": "You can visit a Psychiatrist",

  "period pain": "You can visit a Gynecologist",
  "irregular periods": "You can visit a Gynecologist",
  "pregnancy care": "You can visit a Gynecologist",
  "pcos": "You can visit a Gynecologist",
  "vaginal discharge": "You can visit a Gynecologist",

  "urinary pain": "You can visit a Urologist",
  "frequent urination": "You can visit a Urologist",
  "blood in urine": "You can visit a Urologist",
  "difficulty urinating": "You can visit a Urologist",
  "stones": "You can visit a Urologist",

  "kidney pain": "You can visit a Nephrologist",

  "liver problem": "You can visit a Hepatologist",
  "jaundice": "You can visit a Hepatologist",

  "diabetes": "You can visit an Endocrinologist",
  "thyroid": "You can visit an Endocrinologist",
  "hormonal imbalance": "You can visit an Endocrinologist",

  "weight management": "You can visit a Dietitian",
  "nutrition advice": "You can visit a Dietitian"
};

const fixedResponses = (text) => {
  const t = (text || '').toLowerCase().trim();
  if (!t) return "Please type something so I can help.";

  // Normal chatbot quick replies remain unchanged...

  // SMART SYMPTOM MATCHING START
  const clean = t.replace(/[^\w\s]/gi, "");
  const words = clean.split(/\s+/);
  const keys = Object.keys(symptomMap);

  // 1) Word-order-free matching
  for (let key of keys) {
    const parts = key.split(" ");
    if (parts.every(p => words.includes(p))) return symptomMap[key];
  }

  // 2) Fuzzy matching
  for (let word of words) {
    const best = stringSimilarity.findBestMatch(word, keys).bestMatch;
    if (best.rating >= 0.65) return symptomMap[best.target];
  }

  // 3) Synonym expansion
  for (let base in symptomSynonyms) {
    if (words.some(w => symptomSynonyms[base].includes(w))) {
      const related = keys.find(k => k.includes(base));
      if (related) return symptomMap[related];
    }
  }

  return "Sorry, I don't understand that yet. You can ask me about symptoms, booking appointments, lab reports, or prescriptions.";
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi — I am CareConnect assistant. How may I help you?' }
  ]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: 'user', text: trimmed }]);
    setInput('');
    const reply = fixedResponses(trimmed);
    setTimeout(() => setMessages((m) => [...m, { from: 'bot', text: reply }]), 400);
  };

  return (
    <div className="chatbot">
      <button className="chatbot-button btn-float" onClick={() => setOpen((s) => !s)}>
        {open ? '✖' : '💬'}
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <strong>CareConnect Assistant</strong>
          </div>

          <div className="chatbot-messages" ref={messagesRef}>
            {messages.map((m, i) => <div key={i} className={`chatbot-message ${m.from}`}>{m.text}</div>)}
          </div>

          <form className="chatbot-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input type="text" placeholder="Describe your problem..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
