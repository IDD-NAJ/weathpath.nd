"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Course {
  id: number
  title: string
  slug: string
  description: string
  price_cents: number
  category: string
  level: string
  lessons: number
  is_visible: boolean
  status: string
}

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price_cents: 9999,
    category: "general",
    level: "beginner",
    lessons: 10,
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses")
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (err) {
      console.error("[v0] Failed to fetch courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.slug) {
      alert("Title and slug are required")
      return
    }

    try {
      const url = editingId 
        ? `/api/admin/courses/${editingId}`
        : "/api/admin/courses"
      
      const method = editingId ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchCourses()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          title: "",
          slug: "",
          description: "",
          price_cents: 9999,
          category: "general",
          level: "beginner",
          lessons: 10,
        })
      }
    } catch (err) {
      console.error("[v0] Failed to save course:", err)
      alert("Failed to save course")
    }
  }

  const handleEdit = (course: Course) => {
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description,
      price_cents: course.price_cents,
      category: course.category,
      level: course.level,
      lessons: course.lessons,
    })
    setEditingId(course.id)
    setShowForm(true)
  }

  const handleToggleVisibility = async (course: Course) => {
    try {
      await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !course.is_visible }),
      })
      await fetchCourses()
    } catch (err) {
      console.error("[v0] Failed to toggle visibility:", err)
    }
  }

  const handleDelete = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" })
      await fetchCourses()
    } catch (err) {
      console.error("[v0] Failed to delete course:", err)
      alert("Failed to delete course")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-lg text-foreground md:text-2xl">
          Manage Courses
        </h3>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData({
              title: "",
              slug: "",
              description: "",
              price_cents: 9999,
              category: "general",
              level: "beginner",
              lessons: 10,
            })
            setShowForm(!showForm)
          }}
          className="w-full gap-2 rounded-sm sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-sm border border-border bg-card p-6 space-y-4">
          <h4 className="font-semibold text-foreground">
            {editingId ? "Edit Course" : "Create New Course"}
          </h4>

          <input
            type="text"
            placeholder="Course Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground"
          />

          <input
            type="text"
            placeholder="Slug (e.g., investing-101)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Price (cents)
              </label>
              <input
                type="number"
                value={formData.price_cents}
                onChange={(e) => setFormData({ ...formData, price_cents: parseInt(e.target.value) })}
                className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground"
              >
                <option value="general">General</option>
                <option value="investing">Investing</option>
                <option value="entrepreneurship">Entrepreneurship</option>
                <option value="coding">Coding</option>
                <option value="travel">Travel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Lessons
              </label>
              <input
                type="number"
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: parseInt(e.target.value) })}
                className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full rounded-sm sm:flex-1">
              {editingId ? "Update Course" : "Create Course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="w-full rounded-sm sm:flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Courses Table */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading courses...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-foreground font-medium">{course.title}</td>
                  <td className="px-4 py-3 text-foreground text-sm">{course.slug}</td>
                  <td className="px-4 py-3 text-foreground">
                    ${(course.price_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-foreground text-sm">{course.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-sm px-2 py-1 text-xs font-medium ${
                        course.is_visible
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {course.is_visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-1">
                    <Button
                      onClick={() => handleToggleVisibility(course)}
                      variant="outline"
                      size="sm"
                      className="rounded-sm"
                      title={course.is_visible ? "Hide" : "Show"}
                    >
                      {course.is_visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      onClick={() => handleEdit(course)}
                      variant="outline"
                      size="sm"
                      className="rounded-sm"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(course.id)}
                      variant="outline"
                      size="sm"
                      className="rounded-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
