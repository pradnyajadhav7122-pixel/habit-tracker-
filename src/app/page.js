"use client";
import { useState, useEffect } from 'react';
import { Plus, Check, X, Trophy, Flame, Calendar, Award, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

export default function Home() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [category, setCategory] = useState('Yoga');
  const [time, setTime] = useState('09:00');
  const [xp, setXp] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('habits-final-v3');
    if (saved) setHabits(JSON.parse(saved));
    const savedXp = localStorage.getItem('xp-final-v3');
    if (savedXp) setXp(parseInt(savedXp));
  }, []);

  useEffect(() => {
    localStorage.setItem('habits-final-v3', JSON.stringify(habits));
    localStorage.setItem('xp-final-v3', xp.toString());
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
          setXp(prev => Math.max(0, prev - 10));
          return {...h, completedDates: h.completedDates.filter(d => d!== today), streak: Math.max(0, h.streak - 1) };
        } else {
          setXp(prev => prev + 10);
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

  const getCompletionRate = (habit) => {
    const daysSince = Math.max(1, Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)));
    return Math.round((habit.completedDates.length / daysSince) * 100);
  };

  const monthDays = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const images = {
    Yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    Reading: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
    Exercise: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
    Meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
    Health: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    Fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    Learning: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop',
    Work: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop',
    Water: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=400&fit=crop',
    Sleep: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=400&fit=crop'
  };

  const categoryColors = {
    Yoga: 'bg-purple-100 text-purple-700',
    Reading: 'bg-blue-100 text-blue-700',
    Exercise: 'bg-red-100 text-red-700',
    Meditation: 'bg-indigo-100 text-indigo-700',
    Health: 'bg-green-100 text-green-700',
    Fitness: 'bg-orange-100 text-orange-700',
    Learning: 'bg-cyan-100 text-cyan-700',
    Work: 'bg-gray-100 text-gray-700',
    Water: 'bg-sky-100 text-sky-700',
    Sleep: 'bg-violet-100 text-violet-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3">
                <Trophy className="text-yellow-500" size={36} /> Habit Tracker Pro
              </h1>
              <p className="text-gray-500 mt-2 text-lg">Level {level} • {xp} XP Total • {habits.length} Habits</p>
            </div>
            <button onClick={() => setShowStats(!showStats)} className="bg-indigo-100 text-indigo-700 p-3 rounded-2xl hover:bg-indigo-200 transition">
              <BarChart3 size={24} />
            </button>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500" style={{ width: `${(xp % 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Level {level}</span>
            <span>{nextLevelXp - xp} XP to Level {level + 1}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="text" value={newHabit} onChange={(e) => setNewHabit(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addHabit()} placeholder="Add New Habit..." className="md:col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none font-medium" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none font-medium">
              <option>Yoga</option><option>Reading</option><option>Exercise</option><option>Meditation</option><option>Health</option><option>Fitness</option><option>Learning</option><option>Work</option><option>Water</option><option>Sleep</option>
            </select>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none font-medium" />
          </div>
          <button onClick={addHabit} className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-bold text-lg shadow-lg">
            <Plus size={24} /> Add Habit
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Calendar className="text-indigo-600" /> {monthName}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-xl transition"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-sm bg-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-200 transition">Today</button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-xl transition"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">{day}</div>
            ))}
            {monthDays.map((date, i) => (
              <div key={i} className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-all ${!date? '' : isDateCompleted(date)? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold shadow-lg scale-105' : date.toDateString() === new Date().toDateString()? 'bg-indigo-100 text-indigo-600 font-bold border-2 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105'}`}>
                {date?.getDate()}
              </div>
            ))}
          </div>
        </div>

        {showStats && habits.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="text-indigo-600" /> Streak Chart</h2>
            <div className="space-y-3">
              {habits.map(habit => (
                <div key={habit.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{habit.name}</span>
                    <span className="text-gray-500">{getCompletionRate(habit)}% • {habit.streak}🔥</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500" style={{ width: `${getCompletionRate(habit)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {habits.map(habit => {
            const today = new Date().toISOString().split('T')[0];
            const done = habit.completedDates.includes(today);
            const completionRate = getCompletionRate(habit);
            return (
              <div key={habit.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <img src={images[habit.name] || images[habit.category] || images.Health} alt={habit.name} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{habit.name}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`${categoryColors[habit.category] || categoryColors.Health} px-4 py-1.5 rounded-full font-bold`}>{habit.category}</span>
                        <span className="text-gray-500 font-medium">⏰ {habit.time}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteHabit(habit.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"><X size={22} /></button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Completion Rate</span>
                      <span className="font-bold">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2 text-orange-500">
                        <Flame size={20} />
                        <div>
                          <div className="font-black text-lg">{habit.streak}</div>
                          <div className="text-xs">day streak</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award size={18} />
                        <div>
                          <div className="font-bold text-lg">{habit.bestStreak}</div>
                          <div className="text-xs">best</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => toggleHabit(habit.id)} className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg ${done? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {done? <><Check size={22} /> Done Today</> : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-16 text-center text-gray-400 border border-indigo-100">
              <Calendar size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold">No habits yet</p>
              <p className="text-sm mt-2">Add your first habit above to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}