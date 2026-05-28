"use client"
import { useState, useEffect } from 'react'

export default function Home() {
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  // 1. PAGE LOAD ZALYAVAR DATA PARAT AAN
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitflow-data')
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }, [])

  // 2. JEVHA HABITS BADALTIL TEVHA SAVE KAR
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habitflow-data', JSON.stringify(habits))
    }
    if (habits.length === 0) {
      localStorage.removeItem('habitflow-data')
    }
  }, [habits])

  // 3. NOTIFICATION SETUP - 9 PM LA BEEP
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission()
    }

    const checkTime = () => {
      const now = new Date()
      if (now.getHours() === 21 && now.getMinutes() === 0) {
        new Notification('HabitFlow Reminder 🔥', {
          body: 'Time to check your habits!',
          icon: '/icon-192x192.png'
        })
      }
    }
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const addHabit = () => {
    if (habitName.trim() === '') return
    const newHabit = {
      id: Date.now(),
      name: habitName,
      completedDates: [],
      streak: 0
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
    setHabits(habits.filter(habit => habit.id!== id))
  }

  const getTodayCompleted = () => {
    const today = new Date().toISOString().split('T')[0]
    return habits.filter(h => h.completedDates.includes(today)).length
  }

  const getTotalStreak = () => {
    return habits.reduce((total, habit) => total + habit.completedDates.length, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🔥 HabitFlow
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => Notification.requestPermission()}
                className="bg-orange-100 text-orange-600 px-3 py-2 rounded-lg text-sm font-semibold"
              >
                🔔 Enable Notifications
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
            <div className="text-2xl font-bold">{getTotalStreak()}</div>
            <div className="text-xs text-gray-500">Total Streaks</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl text-green-600">✓</div>
            <div className="text-2xl font-bold">{getTodayCompleted()}</div>
            <div className="text-xs text-gray-500">Completed Today</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl text-purple-600">+</div>
            <div className="text-2xl font-bold">{habits.length}</div>
            <div className="text-xs text-gray-500">Total Habits</div>
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="space-y-3">
            {habits.length === 0? (
              <div className="bg-white rounded-xl p-8 text-center shadow">
                <div className="text-5xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
                <p className="text-gray-500 text-sm mb-4">Start building better habits today!</p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  + Add Your First Habit
                </button>
              </div>
            ) : (
              habits.map(habit => {
                const today = new Date().toISOString().split('T')[0]
                const isDone = habit.completedDates.includes(today)
                return (
                  <div key={habit.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{habit.name}</h3>
                      <p className="text-sm text-gray-500">Streak: {habit.completedDates.length} days</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`px-4 py-2 rounded-lg font-semibold ${isDone? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                      >
                        {isDone? '✓ Done' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-500 px-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Add New Habit</h2>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g., Drink Water, Exercise"
                className="w-full border rounded-lg px-3 py-2 mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addHabit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                >
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