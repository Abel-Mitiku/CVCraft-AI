interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

interface Props {
  data: PersonalInfo;
  onChange: (updates: Partial<PersonalInfo>) => void;
}

export default function PersonalInfoForm({ data, onChange }: Props) {
  const fields = [
    {
      key: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "john@example.com",
      required: true,
    },
    {
      key: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "+1 (555) 123-4567",
    },
    {
      key: "location",
      label: "Location",
      type: "text",
      placeholder: "San Francisco, CA",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      type: "url",
      placeholder: "linkedin.com/in/johndoe",
    },
    {
      key: "portfolio",
      label: "Portfolio",
      type: "url",
      placeholder: "johndoe.com",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Personal Information
        </h2>
        <p className="text-sm text-gray-600">
          Add your contact details so employers can reach you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={data[field.key as keyof PersonalInfo] || ""}
              onChange={(e) => onChange({ [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
        ))}
      </div>

      {data.fullName && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> {data.fullName} • {data.email}{" "}
            {data.phone && `• ${data.phone}`}{" "}
            {data.location && `• ${data.location}`}
          </p>
        </div>
      )}
    </div>
  );
}
