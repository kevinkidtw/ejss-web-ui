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
    <div className="flex-1 bg-paper overflow-y-auto p-5" style={{ backgroundImage: 'radial-gradient(circle, #E5E1D8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
      <div className="text-xs font-bold text-ink-muted uppercase mb-3">選擇背景模板</div>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {BACKDROP_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className={`rounded-card border-2 overflow-hidden text-left transition-all shadow-xs cursor-pointer
              ${activeBackdrop === t.id ? 'border-primary ring-2 ring-primary/20 bg-card' : 'border-line hover:border-line/80 bg-card'}`}
          >
            <div className="bg-card flex items-center justify-center h-32 overflow-hidden">
              <img
                src={import.meta.env.BASE_URL.replace(/\/$/, '') + t.preview}
                alt={t.label}
                className="max-h-28 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="bg-paper px-3.5 py-2.5 border-t border-line">
              <div className="text-sm font-bold text-ink">{t.label}</div>
              <div className="text-xs text-ink-muted mt-0.5">{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
