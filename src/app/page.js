"use client"
import { useState, useEffect } from 'react'

export default function Home() {
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState("")
  const [habitCategory, setHabitCategory] = useState("health")
  const [showModal, setShowModal] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)

  // Notification useEffect same ahe...
  useEffect(() => {
    if (!notificationsEnabled) return
    const checkTime = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      if (hours === 9 && minutes === 0) {
        new Notification("HabitFlow Reminder 💙", {
          body: "Good Morning Pradnya! Aj che habits complete kar 🚀",
          icon: "/icon-192.png",
          requireInteraction: true
        })
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE')
          audio.play()
        } catch (e) { console.log("Audio play failed:", e) }
      }
    }, 60000)
    return () => clearInterval(checkTime)
  }, [notificationsEnabled])

  // 1. Habit nusar Photo - Same ahe
  const getHabitImage = (name, category) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('reading') || nameLower.includes('book')) return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8"
    if (nameLower.includes('cycling') || nameLower.includes('cycle')) return "https://images.unsplash.com/photo-1571068316344-75bc76f77890"
    if (nameLower.includes('running') || nameLower.includes('run')) return "https://images.unsplash.com/photo-1552674605-db6ffd4facb5"
    if (nameLower.includes('walk')) return "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8"
    if (nameLower.includes('yoga')) return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"
    if (nameLower.includes('gym')) return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
    if (nameLower.includes('coding') || nameLower.includes('code')) return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
    if (nameLower.includes('meditation') || nameLower.includes('meditate')) return "https://images.unsplash.com/photo-1506126613408-eca07ce68773"
    if (nameLower.includes('journaling')) return "https://images.unsplash.com/photo-1517842645767-c6397d0e19c2"
    const categoryImages = {
      health: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
      fitness: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      study: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
      work: "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
      other: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
    }
    return categoryImages[category] || categoryImages.other
  }

  // 2. Notification Toggle - Same ahe
  const toggleNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Browser notifications support nahi")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      setNotificationsEnabled(true)
      new Notification("HabitFlow", { body: "Notifications chalu zalya! 💙", icon: "/icon-192.png" })
    } else {
      setNotificationsEnabled(false)
    }
  }

  // 3. Habit Add Karne - UPDATED: completedDates add kela
  const addHabit = () => {
    if (!habitName.trim()) {
      alert("Habit nav taka")
      return
    }
    const newHabit = {
      id: Date.now(),
      name: habitName,
      category: habitCategory,
      image: getHabitImage(habitName, habitCategory),
      streak: 0,
      completedDates: [], // 👈 Navin: Dates save karnar
      lastCompleted: null
    }
    setHabits([...habits, newHabit])
    setHabitName("")
    setHabitCategory("health")
    setShowModal(false)
  }

  // 4. Habit Complete Karne - UPDATED: date save karto
  const markComplete = (id) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const today = new Date().toDateString()
        if (habit.completedDates.includes(today)) return habit

        return {
         ...habit,
          streak: habit.streak + 1,
          completedDates: [...habit.completedDates, today], // 👈 Date add keli
          lastCompleted: today
        }
      }
      return habit
    }))
  }

  // 5. Habit Delete Karne
  const deleteHabit = (id) => {
    setHabits(habits.filter(habit => habit.id!== id))
    if (selectedHabit?.id === id) setSelectedHabit(null)
  }

  // 6. Stats
  const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0)
  const completedToday = habits.filter(h => h.lastCompleted === new Date().toDateString()).length
  const categoryData = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1
    return acc
  }, {})

  // 7. 👇 CALENDAR COMPONENT
  const CalendarView = ({ habit }) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    const days = []
    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toDateString()
      const isCompleted = habit.completedDates.includes(date)
      const isToday = day === today.getDate()

      days.push(
        <div
          key={day}
          className={`h-8 w-8 rounded flex items-center justify-center text-sm
            ${isCompleted? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-600'}
            ${isToday? 'ring-2 ring-blue-500' : ''}
          `}
        >
          {day}
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {habit.name} - {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="h-8 w-8 flex items-center justify-center text-xs font-bold text-gray-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-100 rounded"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 ring-2 ring-blue-500 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - Same ahe */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-2xl font-bold text-gray-800">HabitFlow</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleNotifications} className={`px-4 py-2 rounded-lg font-medium ${notificationsEnabled? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              🔔 {notificationsEnabled? "Notifications On" : "Enable Notifications"}
            </button>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              + Add Habit
            </button>
          </div>
        </div>

        {/* Stats Cards - Same ahe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-blue-600 text-3xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-gray-800">{totalStreaks}</div>
            <div className="text-gray-500">Total Streaks</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-green-600 text-3xl mb-2">✓</div>
            <div className="text-3xl font-bold text-gray-800">{completedToday}</div>
            <div className="text-gray-500">Completed Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-purple-600 text-3xl mb-2">+</div>
            <div className="text-3xl font-bold text-gray-800">{habits.length}</div>
            <div className="text-gray-500">Total Habits</div>
          </div>
        </div>

        {/* Charts Section - Same ahe */}
        {habits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Streak Chart</h2>
              <div className="space-y-3">
                {habits.map(habit => (
                  <div key={habit.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{habit.name}</span>
                      <span className="font-bold text-gray-800">{habit.streak} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full transition-all" style={{width: `${Math.min(habit.streak * 10, 100)}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Categories</h2>
              <div className="space-y-3">
                {Object.entries(categoryData).map(([category, count]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{category}</span>
                      <span className="font-bold text-gray-800">{count} habits</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-purple-600 h-3 rounded-full transition-all" style={{width: `${(count / habits.length) * 100}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 👇 CALENDAR VIEW - Habit var click kelyavar disnar */}
        {selectedHabit && <CalendarView habit={selectedHabit} />}

        {/* Habits Grid - UPDATED: Click var calendar disnar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img src={habit.image} alt={habit.name} className="w-full h-48 object-cover cursor-pointer" onClick={() => setSelectedHabit(habit)} />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800 cursor-pointer" onClick={() => setSelectedHabit(habit)}>{habit.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">{habit.category}</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 mb-4">
                  <span>🔥</span>
                  <span className="font-medium">{habit.streak} Day Streak</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markComplete(habit.id)} disabled={habit.lastCompleted === new Date().toDateString()} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {habit.lastCompleted === new Date().toDateString()? "✓ Done" : "Mark Done"}
                  </button>
                  <button onClick={() => deleteHabit(habit.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">🗑️</button>
                </div>
                <button onClick={() => setSelectedHabit(habit)} className="w-full mt-2 text-sm text-blue-600 hover:underline">📅 View Calendar</button>
              </div>
            </div>
          ))}
        </div>

        {habits.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No habits yet</h3>
            <p className="text-gray-500 mb-6">Start building better habits today!</p>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">+ Add Your First Habit</button>
          </div>
        )}

        {/* Add Habit Modal - Same ahe */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Habit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
                  <input type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="e.g. Reading, Cycling, Yoga" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={habitCategory} onChange={(e) => setHabitCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="study">Study</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={addHabit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">Add Habit</button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}