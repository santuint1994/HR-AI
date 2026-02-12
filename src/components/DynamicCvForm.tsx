/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/DynamicCvForm.tsx
import { useState } from 'react'

interface DynamicCvFormProps {
  data: any // the full API response
}

export default function DynamicCvForm({ data }: DynamicCvFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  // Example: adapt this according to your real response structure
  const parsedData = data?.data || data || {}

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const renderField = (key: string, value: any) => {
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())

    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            type="text"
            value={formValues[key] ?? value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">{label}</h3>
          <ul className="list-disc pl-5 space-y-1">
            {value.map((item, idx) => (
              <li key={idx} className="text-gray-700">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </div>
      )
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="mb-6 border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">{label}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey}>
                {renderField(subKey, subValue)}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <p className="text-gray-600">{String(value)}</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <form className="space-y-6">
        {Object.entries(parsedData).map(([key, value]) => (
          <div key={key}>
            {renderField(key, value)}
          </div>
        ))}

        <div className="pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => alert('Form saved! (implement save logic)')}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  )
}