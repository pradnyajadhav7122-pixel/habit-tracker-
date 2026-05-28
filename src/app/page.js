"use client"
import { useState, useEffect } from 'react'

export default function Home() {
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState('')
  const [habitCategory, setHabitCategory] = useState('Health')
  const [habitImage, setHabitImage] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [selectedHabitForCal, setSelectedHabitForCal] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const categories = ['Health', 'Study', 'Work', 'Personal']

  useEffect(() => {
    const saved = localStorage.getItem('habitflow-data')
    if (saved) {
      const parsedHabits = JSON.parse(saved)
      setHabits(parsedHabits)
      if (parsedHabits.length > 0) setSelectedHabitForCal(parsedHabits[0])
    }
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('habitflow-data', JSON.stringify(habits))
  }, [habits])

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setHabitImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addHabit = () => {
    if (!habitName.trim()) return
    const newHabit = {
      id: Date.now(),
      name: habitName,
      category: habitCategory,
      image: habitImage,
      completedDates: []
    }
    const updatedHabits = [...habits, newHabit]
    setHabits(updatedHabits)
    setSelectedHabitForCal(newHabit)
    setHabitName('')
    setHabitImage(null)
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
    const updatedHabits = habits.filter(h => h.id!== id)
    setHabits(updatedHabits)
    if (selectedHabitForCal?.id === id) {
      setSelectedHabitForCal(updatedHabits[0] || null)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const totalStreaks = habits.reduce((sum, h) => sum + h.completedDates.length, 0)
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length

  const categoryData = categories.map(cat => ({
    name: cat,
    count: habits.filter(h => h.category === cat).length
  })).filter(c => c.count > 0)

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">Streak Chart</h3>
                {habits.map(habit => (
                  <div key={habit.id} className="mb-3 flex items-center gap-2">
                    {habit.image && (
                      <img src={habit.image} alt={habit.name} className="w-8 h-8 rounded object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{habit.name}</span>
                        <span className="text-gray-500">{habit.completedDates.length} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{width: `${Math.min(habit.completedDates.length * 5, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-bold mb-3">Categories</h3>
                {categoryData.length > 0? categoryData.map(cat => (
                  <div key={cat.name} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-gray-500">{cat.count} habits</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{width: `${(cat.count / habits.length) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400">No categories yet</p>}
              </div>
            </div>
          </div>
        )}

        {habits.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow mb-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {habits.map(habit => (
                <button
                  key={habit.id}
                  onClick={() => setSelectedHabitForCal(habit)}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all flex items-center gap-1 ${selectedHabitForCal?.id === habit.id? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {habit.image && <img src={habit.image} alt="" className="w-4 h-4 rounded" />}
                  {habit.name}
                </button>
              ))}
            </div>

            {selectedHabitForCal && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    ←
                  </button>
                  <h3 className="font-bold text-center flex items-center gap-2">
                    {selectedHabitForCal.image && <img src={selectedHabitForCal.image} alt="" className="w-6 h-6 rounded" />}
                    {selectedHabitForCal.name} - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, idx) => (
                    <div key={idx} className="aspect-square">
                      {date && (
                        <div className={`h-full w-full rounded flex items-center justify-center text-sm transition-all
                          ${isDateCompleted(selectedHabitForCal, date)? 'bg-green-500 text-white font-bold' : 'bg-gray-50 hover:bg-gray-100'}
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
          {habits.length === 0? (
            <div className="bg-white rounded-xl p-8 text-center shadow">
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">No habits yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start building better habits today!</p>
              <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                + Add Your First Habit
              </button>
            </div>
          ) : (
            habits.map(habit => {
              const isDone = habit.completedDates.includes(today)
              return (
                <div key={habit.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {habit.image && (
                      <img src={habit.image} alt={habit.name} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <h3
                        onClick={() => setSelectedHabitForCal(habit)}
                        className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {habit.name}
                      </h3>
                      <p className="text-sm text-gray-500">Streak: {habit.completedDates.length} days | {habit.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${isDone? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {isDone? '✓ Done' : 'Mark Done'}
                    </button>
                    <button onClick={() => deleteHabit(habit.id)} className="text-red-500 px-2 hover:bg-red-50 rounded">🗑️</button>
                  </div>
                </div>
              )
            })
          )}
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
                className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <select
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Habit Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {habitImage && (
                  <img src={habitImage} alt="Preview" className="mt-2 w-20 h-20 rounded-lg object-cover" />
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => {setShowAdd(false); setHabitImage(null)}} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={addHabit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
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