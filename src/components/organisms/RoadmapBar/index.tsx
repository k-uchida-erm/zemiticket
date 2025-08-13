import IconCheck from '../../atoms/icons/Check';

interface RoadmapBarProps {
  stages: string[];
  currentStage: string;
}

export default function RoadmapBar({ stages, currentStage }: RoadmapBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = stages.indexOf(currentStage) > index;
          const isCurrent = stage === currentStage;
          
          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-[#00b393]'
                      : isCurrent
                      ? 'bg-[#00b393] animate-pulse'
                      : 'bg-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <IconCheck className="w-4 h-4 text-white" strokeWidth={2.2} />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {index + 1}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    isCompleted
                      ? 'text-[#00b393] font-medium'
                      : isCurrent
                      ? 'text-[#00b393] font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {stage}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-[#00b393]' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 