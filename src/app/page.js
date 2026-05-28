"use client";
import { useState, useEffect } from 'react';
import { Plus, Check, X, Trophy, Flame, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [category, setCategory] = useState('Health');
  const [time, setTime] = useState('09:00');
  const [xp, setXp] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('habits-final');
    if (saved) setHabits(JSON.parse(saved));
    const savedXp = localStorage.getItem('xp-final');
    if (savedXp) setXp(parseInt(savedXp));
  }, []);

  useEffect(() => {
    localStorage.setItem('habits-final', JSON.stringify(habits));
    localStorage.setItem('xp-final', xp.toString());
  }, [habits, xp]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const habit = {
      id: Date.now(),
      name: newHabit,
      category,
      time,
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    setHabits([...habits, habit]);
    setNewHabit('');
  };

  const toggleHabit = (id) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(habits.map(h => {
      if (h.id === id) {
        const done = h.completedDates.includes(today);
        if (done) {
          setXp(xp - 10);
          return {...h, completedDates: h.completedDates.filter(d => d!== today), streak: Math.max(0, h.streak - 1) };
        } else {
          setXp(xp + 10);
          const newStreak = h.streak + 1;
          return {...h, completedDates: [...h.completedDates, today], streak: newStreak, bestStreak: Math.max(h.bestStreak, newStreak) };
        }
      }
      return h;
    }));
  };

  const deleteHabit = (id) => setHabits(habits.filter(h => h.id!== id));

  const level = Math.floor(xp / 100) + 1;
  const nextLevelXp = level * 100;

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isDateCompleted = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return habits.some(h => h.completedDates.includes(dateStr));
  };

  const monthDays = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const images = {
    Yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    Reading: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    Exercise: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    Meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    Health: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    Fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    Learning: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    Work: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Habit Tracker Pro
              </h1>
              <p className="text-gray-500 mt-1">Level {level} • {xp} XP Total</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Next Level</div>
              <div className="text-2xl font-bold text-indigo-600">{nextLevelXp - xp} XP</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${(xp % 100)}%` }}></div>
          </div>

          <div className="flex gap-2 mb-4">
            <input type="text" value={newHabit} onChange={(e) => setNewHabit(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addHabit()} placeholder="Add New Habit..." className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none">
              <option>Health</option><option>Fitness</option><option>Learning</option><option>Work</option><option>Yoga</option><option>Reading</option><option>Exercise</option><option>Meditation</option>
            </select>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none" />
            <button onClick={addHabit} className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-semibold">
              <Plus size={20} /> Add
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Calendar className="text-indigo-600" /> {monthName}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-2 text-sm bg-indigo-100 text-indigo-600 rounded-lg font-semibold">Today</button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">{day}</div>
            ))}
            {monthDays.map((date, i) => (
              <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-sm ${!date? '' : isDateCompleted(date)? 'bg-green-500 text-white font-bold' : date.toDateString() === new Date().toDateString()? 'bg-indigo-100 text-indigo-600 font-bold border-2 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                {date?.getDate()}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {habits.map(habit => {
            const today = new Date().toISOString().split('T')[0];
            const done = habit.completedDates.includes(today);
            return (
              <div key={habit.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img src={images[habit.name] || images[habit.category] || images.Health} alt={habit.name} className="w-full h-48 object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{habit.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-semibold">{habit.category}</span>
                        <span>⏰ {habit.time}</span>
                      </div>
                    <button onClick={() => deleteHabit(habit.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><X size={20} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-orange-500"><Flame size={18} /><span className="font-bold">{habit.streak} day streak</span></div>
                      <div className="flex items-center gap-1 text-gray-500"><Award size={16} /><span className="text-sm">Best: {habit.bestStreak}</span></div>
                    </div>
                    <button onClick={() => toggleHabit(habit.id)} className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition ${done? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {done? <><Check size={20} /> Done</> : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No habits yet. Add your first habit above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}