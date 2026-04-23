import Link from "next/link";
export default function ResumeGrid({ resumes }: any) {
  if (resumes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No resumes yet
        </h3>
        <p className="text-gray-600 mb-4">
          Create your first resume to get started
        </p>
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          <span>+</span> Create Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Resumes</h2>
        <Link
          href="/dashboard/resumes"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.slice(0, 6).map((resume: any) => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}

        <Link
          href="/dashboard/templates"
          className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100">
            <span className="text-2xl text-gray-400 group-hover:text-blue-600">
              +
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700">
            Create New
          </span>
        </Link>
      </div>
    </div>
  );
}

function ResumeCard({ resume }: any) {
  return (
    <Link
      href={`/dashboard/editor?template=${resume.template_id}&resume=${resume.id}`}
      className="aspect-[3/4] border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition group"
    >
      <div className="h-3/4 bg-gray-50 flex items-center justify-center">
        <div className="w-4/5 h-5/6 bg-white shadow-md p-3">
          <div className="h-2 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-1 w-full bg-gray-100 rounded mb-1" />
          <div className="h-1 w-5/6 bg-gray-100 rounded" />
        </div>
      </div>

      <div className="h-1/4 p-3 border-t border-gray-100">
        <p className="font-medium text-gray-900 truncate">{resume.title}</p>
        <p className="text-xs text-gray-500">
          Updated {new Date(resume.updated_at).toLocaleDateString()}
        </p>
        {resume.atsScore && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs text-green-600">✅</span>
            <span className="text-xs text-gray-600">
              {resume.atsScore}% ATS
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
