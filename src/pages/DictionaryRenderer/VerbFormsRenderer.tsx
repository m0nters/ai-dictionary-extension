interface VerbFormsRendererProps {
  verbForms: string[];
}

export function VerbFormsRenderer({ verbForms }: VerbFormsRendererProps) {
  return (
    <div className="mb-4">
      <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-violet-400"></div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold tracking-wide text-violet-700">
            VERB FORMS
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {verbForms.map((form, formIndex) => (
            <div
              key={formIndex}
              className="rounded-lg border border-violet-200 bg-white px-4 py-2.5 text-center font-semibold text-violet-800 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="text-sm font-medium">{form}</div>
              {verbForms.length === 3 && (
                <div className="mt-1 text-xs text-violet-500">
                  {formIndex === 0 && "Infinitive"}
                  {formIndex === 1 && "Past tense"}
                  {formIndex === 2 && "Past participle"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
