"use client"
import { useState, useEffect } from 'react'

export default function Home() {
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState('')
  const [habitCategory, setHabitCategory] = useState('Health')
  const [habitImage, setHabitImage] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
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
  }, [])

  useEffect(() => {
    localStorage.setItem('habitflow-data', JSON.stringify(habits))
  }, [habits])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setHabitImage(reader.result)
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">🔥 HabitFlow</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            + Add Habit
          </button>
        </div>

        {/* CALENDAR VAR - EXACT PHOTO SARKHA */}
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="px-2 py-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h3 className="font-bold text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="px-2 py-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentMonth).map((date, idx) => (
              <div key={idx} className="aspect-square">
                {date && (
                  <div className={`h-full w-full rounded-lg flex items-center justify-center text-sm
                    ${selectedHabitForCal && isDateCompleted(selectedHabitForCal, date)? 'bg-green-500 text-white font-bold' : 'bg-gray-50 text-gray-400'}
                    ${date.toISOString().split('T')[0] === today? 'ring-2 ring-blue-500' : ''}`}>
                    {date.getDate()}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-50 rounded border"></div>
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* HABIT CARDS - MOTHA PHOTO SAKAT */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map(habit => {
              const isDone = habit.completedDates.includes(today)
              return (
                <div key={habit.id} className="bg-white rounded-xl shadow overflow-hidden">
                  {habit.image && (
                    <img src={habit.image} alt={habit.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{habit.name}</h3>
                        <p className="text-sm text-gray-500">{habit.category}</p>
                      </div>
                      <button onClick={() => deleteHabit(habit.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">🗑️</button>
                    </div>

                    <div className="flex items-center gap-1 text-orange-600 text-sm mb-3">
                      <span>🔥</span>
                      <span>{habit.completedDates.length} Day Streak</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`flex-1 py-2 rounded-lg font-semibold text-sm ${isDone? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {isDone? '✓ Done' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => setSelectedHabitForCal(habit)}
                        className="flex-1 py-2 rounded-lg font-semibold text-sm bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        📅 View Calendar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ADD HABIT POPUP */}
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
                <label className="block text-sm font-medium mb-2">Habit Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {habitImage && (
                  <img src={habitImage} alt="Preview" className="mt-2 w-full h-32 rounded-lg object-cover" />
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