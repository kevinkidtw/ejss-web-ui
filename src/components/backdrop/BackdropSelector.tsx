import { useSimulationStore } from '../../store/simulationStore';
import { BACKDROP_TEMPLATES } from '../../constants/backdropTemplates';

export default function BackdropSelector() {
  const { activeBackdrop, setActiveBackdrop, addViewElement, resetState, info, variables, odePages, constraintPages, initPages } = useSimulationStore();

  const handleSelect = (templateId: string) => {
    if (activeBackdrop === templateId) return;
    const template = BACKDROP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    resetState();
    // restore model data (don't wipe variables/ode etc)
    useSimulationStore.setState({ info, variables, odePages, constraintPages, initPages, viewElements: [], activeBackdrop: templateId });

    template.elements.forEach((el) => addViewElement(el));
    setActiveBackdrop(templateId);
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto p-4" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="text-xs font-bold text-gray-500 uppercase mb-3">選擇背景模板</div>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {BACKDROP_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className={`rounded-xl border-2 overflow-hidden text-left transition-all shadow-sm
              ${activeBackdrop === t.id ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <div className="bg-white flex items-center justify-center h-32 overflow-hidden">
              <img
                src={t.preview}
                alt={t.label}
                className="max-h-28 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
              <div className="text-sm font-bold text-gray-700">{t.label}</div>
              <div className="text-xs text-gray-500">{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
