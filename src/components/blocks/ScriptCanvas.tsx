import { useSimulationStore } from '../../store/simulationStore';
import VariableBlock from './blocks/VariableBlock';
import OdeBlock from './blocks/OdeBlock';
import ConstraintBlock from './blocks/ConstraintBlock';

export default function ScriptCanvas() {
  const { variables, odePages, constraintPages, initPages } = useSimulationStore();
  const globalVars = variables.filter((v) => v.scope === 'global');
  const empty = !globalVars.length && !odePages.length && !constraintPages.length && !initPages.length;

  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-5" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
      <div className="w-full max-w-4xl mx-auto space-y-6">
      {empty && (
        <div className="flex flex-col items-center justify-center h-full text-slate-450 pt-20">
          <div className="text-5xl mb-4 opacity-40">🧩</div>
          <p className="text-base font-semibold">從左側面板新增積木</p>
          <p className="text-xs mt-1 text-slate-500">或點選元件後新增元件專屬變數</p>
        </div>
      )}

      {initPages.length > 0 && (
        <section>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1.5 flex items-center gap-1.5" title="模擬開始時只執行一次的程式碼，用來設定初始條件">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            初始化
          </div>
          {initPages.map((p) => (
            <ConstraintBlock key={p.id} page={p} kind="init" />
          ))}
        </section>
      )}

      {globalVars.length > 0 && (
        <section>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1.5 flex items-center gap-1.5" title="整個模擬都能使用的數值，例如位置 x、速度 vx、質量 m">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            模型變數
          </div>
          {globalVars.map((v) => (
            <VariableBlock key={v.id} variable={v} />
          ))}
        </section>
      )}

      {odePages.length > 0 && (
        <section>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1.5 flex items-center gap-1.5" title="描述變數如何隨時間變化，例如 dx/dt=vx 表示位置由速度決定">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            微分方程組
          </div>
          {odePages.map((p) => (
            <OdeBlock key={p.id} page={p} />
          ))}
        </section>
      )}

      {constraintPages.length > 0 && (
        <section>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1.5 flex items-center gap-1.5" title="每個時間步都重新計算的算式，例如 F=k*x 或 E=0.5*m*vx^2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            計算 / 約束
          </div>
          {constraintPages.map((p) => (
            <ConstraintBlock key={p.id} page={p} kind="constraint" />
          ))}
        </section>
      )}
      </div>
    </div>
  );
}
