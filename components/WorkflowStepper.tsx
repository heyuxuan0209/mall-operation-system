import React from 'react';

interface WorkflowStepperProps {
  currentStage: string;
}

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ currentStage }) => {
  const steps = [
    { id: 'planning', label: '措施制定', icon: 'fa-clipboard-list' },
    { id: 'executing', label: '帮扶执行', icon: 'fa-person-digging' },
    { id: 'evaluating', label: '效果评估', icon: 'fa-scale-balanced' },
    { id: 'result', label: '结案/升级', icon: 'fa-flag-checkered' },
  ];

  const getStepStatus = (stepId: string) => {
    // Map result stage to the last step
    const effectiveStage = (currentStage === 'completed' || currentStage === 'escalated' || currentStage === 'exit') ? 'result' : currentStage;

    const currentIndex = steps.findIndex(s => s.id === effectiveStage);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>

        {steps.map((step) => {
          const status = getStepStatus(step.id);
          let circleClass = "bg-slate-100 text-slate-400 border-slate-200";
          let textClass = "text-slate-400";

          if (status === 'completed') {
            circleClass = "bg-green-500 text-white border-green-500";
            textClass = "text-green-600 font-medium";
          } else if (status === 'current') {
            circleClass = "bg-brand-600 text-white border-brand-600 ring-4 ring-brand-100";
            textClass = "text-brand-700 font-bold";
          }

          return (
            <div key={step.id} className="flex flex-col items-center bg-white px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${circleClass}`}>
                <i className={`fa-solid ${step.icon}`}></i>
              </div>
              <span className={`text-xs mt-2 transition-colors ${textClass}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
