"use client"
import { useState, useEffect } from 'react'

export default function Home() {
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState('')
  const [habitCategory, setHabitCategory] = useState('Health')
  const [showAdd, setShowAdd] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [selectedHabitForCal, setSelectedHabitForCal] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const categories = ['Health', 'Study', 'Work', 'Personal']

  // 1. DATA LOAD + SAVE
  useEffect(() => {
    const saved = localStorage.getItem('habitflow-data')
    if (saved) setHabits(JSON.parse(saved))

    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('habitflow-data', JSON.stringify(habits))
  }, [habits])

  // 2. 9 PM NOTIFICATION
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 21 && now.getMinutes() === 0 && notificationsEnabled) {
        new Notification('HabitFlow Reminder 🔥', {
          body: 'Check your habits for today!',
          icon: '/icon-192x192.png'
        })
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [notificationsEnabled])

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
    }
  }

  const addHabit = () => {
    if (!habitName.trim()) return
    const newHabit = {
      id: Date.now(),
      name: habitName,
      category: habitCategory,
      completedDates: []
    }
    setHabits([...habits, newHabit])
    setHabitName('')
    setShowAdd(false)
  }

  const toggleHabit = (id) => {
    const today = new Date().toISOString().split('T')[0]
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(today)
        const newDates = isCompleted
        ? habit.completedDates.filter(d => d!== today)
          : [...habit.completedDates, today]
        return {...habit, completedDates: newDates }
      }
      return habit
    }))
  }

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id!== id))
  }

  // CALCULATIONS
  const today = new Date().toISOString().split('T')[0]
  const totalStreaks = habits.reduce((sum, h) => sum + h.completedDates.length, 0)
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length

  const categoryData = categories.map(cat => ({
    name: cat,
    count: habits.filter(h => h.category === cat).length
  })).filter(c => c.count > 0)

  // CALENDAR
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const isDateCompleted = (habit, date) => {
    if (!date ||!habit) return false
    const dateStr = date.toISOString().split('T')[0]
    return habit.completedDates.includes(dateStr)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">🔥 HabitFlow</h1>
            <div className="flex gap-2">
              <button
                onClick={enableNotifications}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${notificationsEnabled? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
              >
                🔔 {notificationsEnabled? 'Notifications On' : 'Enable Notifications'}
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
              >
                + Add Habit
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl">🔥</div>
            <div className="text-2xl font-bold">{totalStreaks}</div>
            <div className="text-xs text-gray-500">Total Streaks</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl text-green-600">✓</div>
            <div className="text-2xl font-bold">{completedToday}</div>
            <div className="text-xs text-gray-500">Completed Today</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl text-purple-600">+</div>
            <div className="text-2xl font-bold">{habits.length}</div>
            <div className="text-xs text-gray-500">Total Habits</div>
          </div>
        </div>

        {habits.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow mb-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">Streak Chart</h3>
                {habits.map(habit => (
                  <div key={habit.id} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{habit.name}</span>
                      <span>{habit.completedDates.length} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{width: `${Math.min(habit.completedDates.length * 10, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-bold mb-3">Categories</h3>
                {categoryData.map(cat => (
                  <div key={cat.name} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.name}</span>
                      <span>{cat.count} habits</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{width: `${(cat.count / habits.length) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {habits.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow mb-4">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {habits.map(habit => (
                <button
                  key={habit.id}
                  onClick={() => setSelectedHabitForCal(habit)}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${selectedHabitForCal?.id === habit.id? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  {habit.name}
                </button>
              ))}
            </div>

            {selectedHabitForCal && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                    ←
                  </button>
                  <h3 className="font-bold">
                    {selectedHabitForCal.name} - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, idx) => (
                    <div key={idx} className="aspect-square">
                      {date && (
                        <div className={`h-full w-full rounded flex items-center justify-center text-sm
                          ${isDateCompleted(selectedHabitForCal, date)? 'bg-green-500 text-white font-bold' : 'bg-gray-50'}
                          ${date.toISOString().split('T')[0] === today? 'ring-2 ring-blue-500' : ''}`}>
                          {date.getDate()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="space-y-3">
          {habits.map(habit => {
            const isDone = habit.completedDates.includes(today)
            return (
              <div key={habit.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{habit.name}</h3>
                  <p className="text-sm text-gray-500">Streak: {habit.completedDates.length} days | {habit.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`px-4 py-2 rounded-lg font-semibold ${isDone? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                  >
                    {isDone? '✓ Done' : 'Mark Done'}
                  </button>
                  <button onClick={() => deleteHabit(habit.id)} className="text-red-500 px-2">🗑️</button>
                </div>
              </div>
            )
          })}
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Add New Habit</h2>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g., Yoga, Reading"
                className="w-full border rounded-lg px-3 py-2 mb-3"
                autoFocus
              />
              <select
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                  Cancel
                </button>
                <button onClick={addHabit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}