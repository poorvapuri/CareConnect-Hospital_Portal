import React, { useState, useRef, useEffect } from 'react';

const fixedResponses = (text) => {
  const t = (text || '').toLowerCase().trim();
  if (!t) return "Please type something so I can help.";

  // Simple greetings/help
  if (/^(hi|hello|hey)\b/.test(t)) return 'Hello! I am CareConnect assistant. How can I help you today?';
  if (t.includes('help')) return 'You can ask about booking appointments, lab reports, prescriptions, opening hours, or contact info.';

  // quick navigation intents
  if (t.includes('book') && t.includes('appointment')) return 'To book an appointment, go to the Book Appointment section in the dashboard or click the Book Appointment button in the nav.';
  if (t.includes('prescription')) return 'You can view your prescriptions under the Prescriptions section in your dashboard.';
  if (t.includes('lab') && t.includes('report')) return 'Lab reports are available under Lab Reports. If a report is missing, contact the lab technician.';
  if (t.includes('hours') || t.includes('open')) return 'Our clinic hours are Mon-Fri 9:00 AM - 5:00 PM. For urgent inquiries call the reception.';
  if (t.includes('contact') || t.includes('phone')) return 'Reception phone: +91 86717 44187. Email: reception@example.com';
  if (t.includes('thank')) return "You're welcome — happy to help!";

  // Clinical symptom -> specialist mapping (user-provided)
  const symptomMap = {
    'fever': 'You can visit a General Physician',
    'high temperature': 'You can visit a General Physician',
    'chills': 'You can visit a General Physician',
    'fatigue': 'You can visit a General Physician',

    'cold': 'You can visit a General Physician',
    'cough': 'You can visit a General Physician',
    'sore throat': 'You can visit a General Physician',
    'runny nose': 'You can visit a General Physician',
    'flu': 'You can visit a General Physician',

    'chest pain': 'You can visit a Cardiologist',
    'heart pain': 'You can visit a Cardiologist',
    'palpitations': 'You can visit a Cardiologist',
    'shortness of breath': 'You can visit a Cardiologist',
    'high blood pressure': 'You can visit a Cardiologist',

    'stomach pain': 'You can visit a Gastroenterologist',
    'acidity': 'You can visit a Gastroenterologist',
    'indigestion': 'You can visit a Gastroenterologist',
    'diarrhea': 'You can visit a Gastroenterologist',
    'constipation': 'You can visit a Gastroenterologist',

    'joint pain': 'You can visit an Orthopedic',
    'back pain': 'You can visit an Orthopedic',
    'bone fracture': 'You can visit an Orthopedic',
    'knee pain': 'You can visit an Orthopedic',

    'muscle pain': 'You can visit a Physiotherapist',
    'sprain': 'You can visit a Physiotherapist',
    'stiffness': 'You can visit a Physiotherapist',

    'skin allergy': 'You can visit a Dermatologist',
    'skin rash': 'You can visit a Dermatologist',
    'itching': 'You can visit a Dermatologist',
    'acne': 'You can visit a Dermatologist',
    'eczema': 'You can visit a Dermatologist',
    'hair fall': 'You can visit a Dermatologist',

    'tooth pain': 'You can visit a Dentist',
    'bleeding gums': 'You can visit a Dentist',
    'cavity': 'You can visit a Dentist',
    'bad breath': 'You can visit a Dentist',

    'eye pain': 'You can visit an Ophthalmologist',
    'blurred vision': 'You can visit an Ophthalmologist',
    'red eyes': 'You can visit an Ophthalmologist',
    'dry eyes': 'You can visit an Ophthalmologist',

    'ear pain': 'You can visit an ENT Specialist',
    'hearing loss': 'You can visit an ENT Specialist',
    'nose blockage': 'You can visit an ENT Specialist',
    'sinus': 'You can visit an ENT Specialist',

    'thyroid': 'You can visit an Endocrinologist',
    'diabetes': 'You can visit an Endocrinologist',
    'hormonal imbalance': 'You can visit an Endocrinologist',

    'anxiety': 'You can visit a Psychiatrist',
    'depression': 'You can visit a Psychiatrist',
    'insomnia': 'You can visit a Psychiatrist',
    'panic attacks': 'You can visit a Psychiatrist',

    'pregnancy': 'You can visit a Gynecologist',
    'irregular periods': 'You can visit a Gynecologist',
    'menstrual pain': 'You can visit a Gynecologist',
    'pcos': 'You can visit a Gynecologist',

    'kidney pain': 'You can visit a Nephrologist',
    'urine infection': 'You can visit a Urologist',
    'stones': 'You can visit a Urologist',
    'difficulty urinating': 'You can visit a Urologist',

    'asthma': 'You can visit a Pulmonologist',
    'breathing issues': 'You can visit a Pulmonologist',
    'chest congestion': 'You can visit a Pulmonologist',

    'seizures': 'You can visit a Neurologist',
    'migraine': 'You can visit a Neurologist',
    'numbness': 'You can visit a Neurologist',
    'memory loss': 'You can visit a Neurologist'
  };

  // check symptom map (longer keys first to avoid partial matches)
  const keys = Object.keys(symptomMap).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (t.includes(key)) return symptomMap[key];
  }

  return "Sorry, I don't understand that yet. You can ask me for help, book an appointment, for providing the lab report, or prescription.";
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
    // generate bot response
    const reply = fixedResponses(trimmed);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: reply }]);
    }, 400);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const quick = (q) => {
    send(q);
    setOpen(true);
  };

  return (
    <div className="chatbot">
      <button
        className="chatbot-button btn-float"
        onClick={() => setOpen((s) => !s)}
        aria-label="Open chat"
      >
        {open ? '✖' : '💬'}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Chatbot panel">
          <div className="chatbot-header">
            <strong>CareConnect Assistant</strong>
            <small>— quick help</small>
          </div>
          <div className="chatbot-messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-message ${m.from}`}>{m.text}</div>
            ))}
          </div>

          <form className="chatbot-input" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Type a question (e.g. 'book appointment')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary">Send</button>
          </form>

          <div className="chatbot-quick">
            <button onClick={() => quick('Help')} className="btn-secondary">Help</button>
            <button onClick={() => quick('Book appointment')} className="btn-secondary">Book Appointment</button>
            <button onClick={() => quick('Lab report')} className="btn-secondary">Lab Report</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
