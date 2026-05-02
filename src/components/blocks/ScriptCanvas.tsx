import { useSimulationStore } from '../../store/simulationStore';
import VariableBlock from './blocks/VariableBlock';
import OdeBlock from './blocks/OdeBlock';
import ConstraintBlock from './blocks/ConstraintBlock';

export default function ScriptCanvas() {
  const { variables, odePages, constraintPages, initPages } = useSimulationStore();
  const globalVars = variables.filter((v) => v.scope === 'global');
  const empty = !globalVars.length && !odePages.length && !constraintPages.length && !initPages.length;

  return (
    <div className="h-full bg-gray-100 overflow-y-auto p-4" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {empty && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-5xl mb-4">🧩</div>
          <p className="text-lg font-medium">從左側面板新增積木</p>
          <p className="text-sm mt-1">或點選元件後新增元件專屬變數</p>
        </div>
      )}

      {initPages.length > 0 && (
        <section className="mb-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2" title="模擬開始時只執行一次的程式碼，用來設定初始條件">🟢 初始化</div>
          {initPages.map((p) => (
            <ConstraintBlock key={p.id} page={p} kind="init" />
          ))}
        </section>
      )}

      {globalVars.length > 0 && (
        <section className="mb-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2" title="整個模擬都能使用的數值，例如位置 x、速度 vx、質量 m">📦 模型變數</div>
          {globalVars.map((v) => (
            <VariableBlock key={v.id} variable={v} />
          ))}
        </section>
      )}

      {odePages.length > 0 && (
        <section className="mb-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2" title="描述變數如何隨時間變化，例如 dx/dt=vx 表示位置由速度決定">🔵 微分方程組</div>
          {odePages.map((p) => (
            <OdeBlock key={p.id} page={p} />
          ))}
        </section>
      )}

      {constraintPages.length > 0 && (
        <section className="mb-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2" title="每個時間步都重新計算的算式，例如 F=k*x 或 E=0.5*m*vx^2">🔴 計算 / 約束</div>
          {constraintPages.map((p) => (
            <ConstraintBlock key={p.id} page={p} kind="constraint" />
          ))}
        </section>
      )}
    </div>
  );
}
