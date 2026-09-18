/* =========================================================
   data.js — Firestore Data Layer
   ========================================================= */

import { db } from './firebase.js';
import {
  doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const DATA_DOC = doc(db, 'portfolio', 'main');

const DEFAULT_DATA = {
  hero: {
    badge: '● Available for learning & collaboration',
    title: "Hi, I'm Wahid Bin Kouser",
    subtitle: 'Computer Science & Engineering Student | Aspiring Programmer | Problem Solver',
    description: "I'm passionate about programming, problem-solving, technology, and continuous self-development. I'm currently building my programming foundation while exploring web development, competitive programming, Artificial Intelligence, and Machine Learning."
  },
  about: {
    heading: 'A curious mind, building step by step.',
    paragraphs: [
      "I'm Wahid Bin Kouser, a Computer Science and Engineering student at International Islamic University Chittagong (IIUC), from Chattogram, Bangladesh. I'm an enthusiastic learner who is passionate about programming, problem-solving, technology, and continuous self-development.",
      "My journey in Computer Science is still at an early stage, but I'm genuinely interested in understanding how things work rather than simply learning them for the sake of completing a course. I'm currently building a strong foundation in programming, especially in C and C++, while practicing different programming problems to improve my logical thinking, analytical skills, and ability to approach problems step by step.",
      "I'm also learning web development with HTML, CSS, and JavaScript, where I enjoy creating clean, responsive, and user-friendly interfaces and turning ideas into functional digital experiences.",
      "Alongside my programming journey, I'm gradually exploring different areas of Computer Science, including Artificial Intelligence, Machine Learning, Data Science, and modern technologies that are shaping the future of software development.",
      "I believe that becoming a good programmer is not only about knowing programming languages or frameworks; it is also about developing the ability to think logically, solve unfamiliar problems, learn from mistakes, communicate ideas clearly, and continuously adapt to new technologies.",
      "My long-term goal is to become a skilled and versatile programmer with strong problem-solving abilities and a solid understanding of Computer Science."
    ],
    facts: [
      { label: 'Name',       value: 'Wahid Bin Kouser' },
      { label: 'Location',   value: 'Chattogram, BD' },
      { label: 'University', value: 'IIUC' },
      { label: 'Department', value: 'CSE' },
      { label: 'Focus',      value: 'C / C++ / Web' },
      { label: 'Exploring',  value: 'AI / ML' }
    ]
  },
  skills: [
    { id: 's1', title: 'Programming',          icon: 'code',  tags: ['C', 'C++', 'Problem Solving'] },
    { id: 's2', title: 'Web Development',      icon: 'web',   tags: ['HTML', 'CSS', 'JavaScript'] },
    { id: 's3', title: 'Tools',                icon: 'tools', tags: ['Git', 'GitHub', 'VS Code'] },
    { id: 's4', title: 'Learning / Exploring', icon: 'ai',    tags: ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'NLP'] }
  ],
  education: [
    { id: 'e1', period: '2026 – Present', degree: 'B.Sc. in Computer Science & Engineering', place: 'International Islamic University Chittagong (IIUC)', meta: [], badge: 'Current' },
    { id: 'e2', period: '2024', degree: 'Higher Secondary Certificate (HSC)', place: 'Government City College, Chattogram', meta: ['Science', 'GPA 5.00'], badge: '' },
    { id: 'e3', period: '2022', degree: 'Secondary School Certificate (SSC)', place: 'Government Muslim High School, Chattogram', meta: ['Science', 'GPA 5.00'], badge: '' }
  ],
  projects: [
    { id: 'p1', category: 'Web', status: 'In progress', title: 'Personal Portfolio Website', description: 'This evolving digital identity — built with HTML, CSS and JavaScript to document what I learn and make the next step visible.', tags: ['HTML', 'CSS', 'JavaScript'], github: '', demo: '' },
    { id: 'p2', category: 'C / C++', status: 'Ongoing', title: 'C / C++ Programming Projects', description: 'A growing collection of small programs built while learning logic, loops, functions and data handling in C and C++.', tags: ['C', 'C++', 'Logic'], github: '', demo: '' },
    { id: 'p3', category: 'Web', status: 'Planned', title: 'Web Development Projects', description: "Responsive interfaces and small web apps I'll build while strengthening my front-end and JavaScript skills.", tags: ['HTML', 'CSS', 'JavaScript'], github: '', demo: '' },
    { id: 'p4', category: 'Problem Solving', status: 'Ongoing', title: 'Problem Solving Projects', description: 'Practice problems and algorithmic exercises to sharpen logical and analytical thinking.', tags: ['C', 'C++', 'Algorithms'], github: '', demo: '' },
    { id: 'p5', category: 'AI / ML', status: 'On the horizon', title: 'Future AI / ML Projects', description: 'A reserved space for experiments in Artificial Intelligence and Machine Learning as my foundations grow.', tags: ['Python', 'AI', 'ML'], github: '', demo: '' }
  ],
  contact: {
    email: 'wahid@example.com',
    github: 'github.com/wahid',
    linkedin: 'linkedin.com/in/wahid'
  },
  messages: []
};

const PortfolioData = {
  async load() {
    try {
      const snap = await getDoc(DATA_DOC);
      if (!snap.exists()) {
        await setDoc(DATA_DOC, DEFAULT_DATA);
        return structuredClone(DEFAULT_DATA);
      }
      return { ...structuredClone(DEFAULT_DATA), ...snap.data() };
    } catch (e) {
      console.error('Firestore load failed:', e);
      return structuredClone(DEFAULT_DATA);
    }
  },

  async save(data) {
    try {
      await setDoc(DATA_DOC, data);
      return true;
    } catch (e) {
      console.error('Firestore save failed:', e);
      return false;
    }
  },

  subscribe(callback) {
    return onSnapshot(DATA_DOC,
      (snap) => {
        if (snap.exists()) {
          callback({ ...structuredClone(DEFAULT_DATA), ...snap.data() });
        }
      },
      (err) => console.error('Subscribe error:', err)
    );
  },

  async reset() {
    await setDoc(DATA_DOC, DEFAULT_DATA);
    return structuredClone(DEFAULT_DATA);
  },

  export(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  import(file, cb) {
    const reader = new FileReader();
    reader.onload = () => {
      try { cb(null, JSON.parse(reader.result)); }
      catch (e) { cb(e); }
    };
    reader.readAsText(file);
  }
};

window.PortfolioData = PortfolioData;
window.DEFAULT_DATA = DEFAULT_DATA;