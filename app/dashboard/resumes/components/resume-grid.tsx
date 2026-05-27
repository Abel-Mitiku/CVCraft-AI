import ResumeCard from "./resume-card";

interface Resume {
  id: string;
  title: string;
  template: string;
  updated_at: string;
  atsScore?: number;
  isPublic: boolean;
  downloads: number;
}

interface Props {
  resumes: Resume[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function ResumeGrid({
  resumes,
  onEdit,
  onDelete,
  onDuplicate,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}

      <button
        onClick={() => onEdit("new")}
        className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition group"
      >
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
          <span className="text-2xl text-gray-400 group-hover:text-blue-600 transition">
            +
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700 transition">
          Create New
        </span>
      </button>
    </div>
  );
}
