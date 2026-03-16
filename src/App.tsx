import { useState, type ChangeEvent } from 'react';

const LIGHT_PRESETS = [
  { name: '평판등 1285x320', defaultOld: 50, defaultNew: 25 },
  { name: '평판등 640x640', defaultOld: 50, defaultNew: 25 },
  { name: '6인치 다운라이트', defaultOld: 20, defaultNew: 10 },
  { name: '투광등', defaultOld: 100, defaultNew: 50 },
  { name: '레이스웨이등', defaultOld: 40, defaultNew: 20 },
  { name: '직접 입력 (기타)', defaultOld: 0, defaultNew: 0 },
];

interface LightItem {
  id: number;
  type: string;
  oldW: number;
  newW: number;
  qty: number;
}

export default function App() {
  const formatNum = (num: number) => new Intl.NumberFormat('ko-KR').format(Math.round(num));

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [lights, setLights] = useState<LightItem[]>([]);
  const [formType, setFormType] = useState(LIGHT_PRESETS[0].name);
  const [formOldW, setFormOldW] = useState<number | string>(LIGHT_PRESETS[0].defaultOld);
  const [formNewW, setFormNewW] = useState<number | string>(LIGHT_PRESETS[0].defaultNew);
  const [formQty, setFormQty] = useState<number | string>(100);

  const [hours, setHours] = useState<number | string>(11);
  const [days, setDays] = useState<number | string>(365);
  const [rate, setRate] = useState<number | string>(145);
  const [dimmingRate, setDimmingRate] = useState(0); 

  const [quoteA, setQuoteA] = useState('');
  const [quoteB, setQuoteB] = useState('');
  const [quoteC, setQuoteC] = useState('');

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setFormType(selected);
    const preset = LIGHT_PRESETS.find(p => p.name === selected);
    if (preset) {
      setFormOldW(preset.defaultOld || '');
      setFormNewW(preset.defaultNew || '');
    }
  };

  const handleAddLight = () => {
    if (!formOldW || !formNewW || !formQty) return alert('W(와트)와 수량을 입력해주세요.');
    const newItem: LightItem = {
      id: Date.now(), type: formType, oldW: Number(formOldW), newW: Number(formNewW), qty: Number(formQty),
    };
    setLights([...lights, newItem]);
  };

  const handleRemoveLight = (id: number) => setLights(lights.filter(l => l.id !== id));

  const handleNumChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setter(rawValue ? parseInt(rawValue, 10).toLocaleString('ko-KR') : '');
  };

  const totalOldW = lights.reduce((sum, light) => sum + (light.oldW * light.qty), 0);
  const totalNewW = lights.reduce((sum, light) => sum + (light.newW * light.qty), 0);
  const totalQty = lights.reduce((sum, light) => sum + light.qty, 0);

  const numHours = Number(hours) || 0;
  const numDays = Number(days) || 0;
  const numRate = Number(rate) || 0;

  const oldEnergy = (totalOldW * numHours * numDays) / 1000;
  const oldCost = oldEnergy * numRate;
  const newLedEnergy = (totalNewW * numHours * numDays) / 1000;
  const smartCost = newLedEnergy * numRate * (1 - dimmingRate / 100);
  const totalSave = oldCost - smartCost;

  const numQuoteA = parseInt(quoteA.replace(/,/g, '') || '0', 10);
  const numQuoteB = parseInt(quoteB.replace(/,/g, '') || '0', 10);
  const numQuoteC = parseInt(quoteC.replace(/,/g, '') || '0', 10);
  const totalCost = numQuoteA + numQuoteB + numQuoteC;

  const roi = totalCost > 0 && totalSave > 0 ? (totalSave / totalCost) * 100 : 0;
  const paybackYears = totalSave > 0 && totalCost > 0 ? (totalCost / totalSave) : 0;

  return (
    <div className={`min-h-screen font-sans pb-20 print:pb-0 selection:bg-blue-500 selection:text-white print:m-0 print:p-0 bg-[#020617] print:bg-white`}>
      
      <style>
        {`
          @media print {
            @page { margin: 8mm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}
      </style>

      {/* 시연 모드: 플로팅 버튼 */}
      {isPreviewMode && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col md:flex-row gap-3 print:hidden animate-fade-in">
          <button 
            onClick={() => setIsPreviewMode(false)}
            className="bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md text-white px-5 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(30,58,138,0.5)] border border-blue-500 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path></svg>
            대시보드로 복귀
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-slate-200/90 hover:bg-white backdrop-blur-md text-slate-900 px-5 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(0,0,0,0.3)] border border-slate-300 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            인쇄 / PDF 저장
          </button>
        </div>
      )}

      {/* ===================== 상단: 대시보드 ===================== */}
      {!isPreviewMode && (
        <div className="print:hidden">
          <div className="text-center py-6 bg-slate-900/50 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white mb-1">데이터 입력 대시보드 (내부용)</h1>
            <p className="text-slate-400 text-xs">입력한 데이터는 하단의 제안서에 자동으로 동기화됩니다.</p>
          </div>

          <div className="container mx-auto px-4 max-w-5xl mt-6 space-y-5 mb-10">
            <div className="bg-[#050b14] p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-6 shadow-lg">
              <div className="flex-1 w-full overflow-hidden">
                <h2 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>조명 구성 추가</h2>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 mb-3">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-3">
                      <label className="text-[11px] text-slate-400 mb-1 block">조명 종류</label>
                      <select value={formType} onChange={handleTypeChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none">
                        {LIGHT_PRESETS.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div><label className="text-[11px] text-slate-400 mb-1 block">기존 조명</label>
                      <div className="relative"><input type="number" value={formOldW} onChange={(e)=>setFormOldW(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white pr-7 focus:border-blue-500 outline-none" /><span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">W</span></div>
                    </div>
                    <div><label className="text-[11px] text-amber-500 font-bold mb-1 block">신규 LED</label>
                      <div className="relative"><input type="number" value={formNewW} onChange={(e)=>setFormNewW(e.target.value)} className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-amber-500 font-bold pr-7 focus:border-amber-500 outline-none" /><span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-500/70 text-xs font-bold">W</span></div>
                    </div>
                    <div><label className="text-[11px] text-slate-400 mb-1 block">수량</label>
                      <div className="relative"><input type="number" value={formQty} onChange={(e)=>setFormQty(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white pr-7 focus:border-blue-500 outline-none" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">구</span></div>
                    </div>
                  </div>
                  <button onClick={handleAddLight} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-colors">리스트에 추가하기</button>
                </div>
                
                {lights.length > 0 && (
                  <div className="mt-2 border border-slate-700 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
                    <table className="w-full text-xs text-left min-w-[300px]">
                      <thead className="bg-slate-800 text-slate-400 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 whitespace-nowrap font-bold">종류</th>
                          <th className="px-3 py-2 text-right whitespace-nowrap font-bold">W변화</th>
                          <th className="px-3 py-2 text-right whitespace-nowrap font-bold">수량</th>
                          <th className="px-3 py-2 text-center whitespace-nowrap font-bold">삭제</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 bg-[#050b14]">
                        {lights.map(l => (
                          <tr key={l.id}>
                            <td className="px-3 py-2 text-white whitespace-nowrap">{l.type}</td>
                            <td className="px-3 py-2 text-right text-slate-300 whitespace-nowrap">{l.oldW} <span className="text-amber-500 font-bold mx-1">→</span> <span className="text-amber-500 font-bold">{l.newW}</span></td>
                            <td className="px-3 py-2 text-right text-white font-bold whitespace-nowrap">{formatNum(l.qty)}구</td>
                            <td className="px-3 py-2 text-center whitespace-nowrap"><button onClick={() => handleRemoveLight(l.id)} className="text-slate-500 hover:text-red-400">✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-800 pt-5 md:pt-0 md:pl-6">
                <h2 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>환경 및 제어 설정</h2>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div><label className="text-[11px] text-slate-500 mb-1 block whitespace-nowrap">일 점등(h)</label><input type="number" value={hours} onChange={(e)=>setHours(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" /></div>
                  <div><label className="text-[11px] text-slate-500 mb-1 block whitespace-nowrap">연 가동(d)</label><input type="number" value={days} onChange={(e)=>setDays(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" /></div>
                  <div><label className="text-[11px] text-slate-500 mb-1 block whitespace-nowrap">단가(원)</label><input type="number" value={rate} onChange={(e)=>setRate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400 whitespace-nowrap">디밍 절감률</span><span className="text-amber-500 font-bold">{dimmingRate}%</span></div>
                  <input type="range" min="0" max="100" step="1" value={dimmingRate} onChange={(e) => setDimmingRate(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-5 rounded-2xl border-2 border-dashed border-slate-600">
              <h2 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>협력사 견적 합산 (내부 원가)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {[
                  { label: 'A사 견적 (예: 자재)', val: quoteA, setter: setQuoteA },
                  { label: 'B사 견적 (예: 제어)', val: quoteB, setter: setQuoteB },
                  { label: 'C사 견적 (예: 시공)', val: quoteC, setter: setQuoteC }
                ].map((q, i) => (
                  <div key={i}><label className="text-[11px] text-slate-400 mb-1 block whitespace-nowrap">{q.label}</label>
                    <div className="relative"><input type="text" value={q.val} onChange={handleNumChange(q.setter)} placeholder="0" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-right font-bold pr-8 focus:border-blue-500 outline-none" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">원</span></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-baseline gap-3 pt-3 border-t border-slate-700">
                <span className="text-slate-400 text-xs whitespace-nowrap">총 사업비 합산 :</span>
                <span className="text-xl font-black text-amber-500 whitespace-nowrap">{formatNum(totalCost)} 원</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 pb-12 border-b-4 border-slate-800 border-dashed">
              <button onClick={() => setIsPreviewMode(true)} className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600 font-black px-6 py-3 rounded-xl transition-all text-sm md:text-base whitespace-nowrap shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                고객 시연 화면으로 띄우기
              </button>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-white text-slate-900 font-black px-6 py-3 rounded-xl shadow-lg transition-colors text-sm md:text-base whitespace-nowrap">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                제안서 인쇄 / PDF 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 하단: 제안서 영역 ===================== */}
      <div className={`container mx-auto print:max-w-[200mm] print:px-0 transition-all duration-500 print:mt-0 ${isPreviewMode ? 'max-w-5xl px-0 mt-0 mb-0' : 'max-w-5xl px-4 mt-8'}`}>
        
        <div className={`bg-[#050b14] print:bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] print:shadow-none relative overflow-hidden text-white print:text-slate-900 print:border print:border-slate-300 ${isPreviewMode ? 'rounded-none border-x-0 border-b-0 print:rounded-none print:border-none' : 'md:rounded-2xl border border-slate-700'}`}>
          
          <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-blue-600 print:bg-blue-800 print:h-2"></div>

          <div className={`px-5 sm:px-8 lg:px-12 print:px-8 print:pt-6 ${isPreviewMode ? 'pt-6 md:pt-10' : 'pt-8 md:pt-14'}`}>
            <div className={`flex flex-col lg:flex-row lg:justify-between lg:items-end pb-4 print:pb-2 border-b-[3px] border-slate-700 print:border-slate-300 mb-6 print:mb-3`}>
              <div className="mb-3 lg:mb-0">
                <p className="text-blue-400 print:text-blue-700 font-black tracking-widest text-[10px] sm:text-xs lg:text-sm print:text-[10px] mb-1 lg:mb-2 print:mb-1 whitespace-nowrap">FLOLIM ENERGY SOLUTION</p>
                <h1 className="text-2xl sm:text-[28px] md:text-[32px] lg:text-4xl print:text-[22px] font-black tracking-tight leading-tight break-keep text-white print:text-slate-900 whitespace-nowrap sm:whitespace-normal">스마트 조명 도입 성과 분석 리포트</h1>
              </div>
              <div className="text-left lg:text-right text-[11px] sm:text-xs lg:text-sm print:text-[10px] text-slate-400 print:text-slate-500 font-bold whitespace-nowrap inline-block">
                분석 기준일 : {new Date().toLocaleDateString('ko-KR')}
              </div>
            </div>
            
            <p className={`text-slate-400 text-xs sm:text-sm lg:text-base print:text-[11px] font-medium break-keep leading-relaxed mb-8 print:mb-4 print:text-slate-600 ${isPreviewMode ? 'hidden print:block' : 'block'}`}>
              귀사의 현장 운영 데이터를 기반으로 산출된 초고효율 LED 및 IoT 스마트 제어 시스템 도입에 따른 <strong className="text-white print:text-slate-900 whitespace-nowrap">예상 에너지 절감액 및 투자 회수(ROI) 분석 결과</strong>입니다.
            </p>
          </div>

          <div className={`px-5 sm:px-8 lg:px-12 pb-10 lg:pb-12 print:px-8 print:pb-6 print:pt-0 ${isPreviewMode ? 'pt-2 lg:pt-4' : ''}`}>
            
            {/* 1. 핵심 지표: 💡 print:grid-cols-2 추가하여 인쇄 시 강제 좌우 배치! */}
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 print:gap-3 print:mb-4">
              <div className="bg-slate-800 print:bg-slate-50 border-2 border-slate-700 print:border-slate-200 rounded-2xl lg:rounded-3xl print:rounded-xl p-5 lg:p-8 print:p-4 shadow-sm flex flex-col justify-center print:text-center">
                <p className="text-slate-400 print:text-slate-500 text-[11px] lg:text-base print:text-[11px] font-bold mb-1 lg:mb-2 print:mb-0.5 break-keep whitespace-nowrap">총 투자 사업비</p>
                <p className="text-3xl lg:text-5xl print:text-2xl font-black text-white print:text-slate-800 tracking-tight break-keep whitespace-nowrap">
                  {formatNum(totalCost)} <span className="text-base lg:text-xl print:text-sm font-bold text-slate-500">원</span>
                </p>
              </div>
              <div className="bg-blue-900/20 print:bg-orange-50 border-2 border-blue-500/30 print:border-orange-300 rounded-2xl lg:rounded-3xl print:rounded-xl p-5 lg:p-8 print:p-4 shadow-sm flex flex-col justify-center relative overflow-hidden print:text-center">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-amber-500/10 print:hidden rounded-full blur-3xl"></div>
                <p className="text-amber-500 print:text-orange-700 text-[11px] lg:text-base print:text-[11px] font-bold mb-1 lg:mb-2 print:mb-0.5 relative z-10 break-keep whitespace-nowrap">연간 전기요금 예상 절감액</p>
                <p className="text-3xl lg:text-5xl print:text-2xl font-black text-amber-400 print:text-orange-700 tracking-tight relative z-10 break-keep whitespace-nowrap">
                  {formatNum(totalSave)} <span className="text-base lg:text-xl print:text-sm font-bold text-amber-500/70 print:text-orange-700/80">원/년</span>
                </p>
              </div>
            </div>

            {/* 2. ROI & 회수 기간: 💡 print:grid-cols-2 추가, 선(divide) 설정 추가 */}
            <div className="bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-200 text-white print:text-slate-800 rounded-2xl lg:rounded-3xl print:rounded-xl p-6 lg:p-12 print:p-5 mb-6 lg:mb-12 print:mb-4 shadow-xl print:shadow-none">
              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 lg:gap-10 print:gap-4 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-slate-700 print:divide-slate-300">
                <div className="text-center pt-2 md:pt-0 print:pt-0">
                  <p className="text-slate-400 print:text-slate-500 text-[11px] lg:text-base print:text-[11px] font-bold tracking-widest mb-2 lg:mb-4 print:mb-1 break-keep whitespace-nowrap">예상 투자수익률 (ROI)</p>
                  <p className="text-4xl lg:text-7xl print:text-3xl font-black text-amber-500 print:text-blue-700 drop-shadow-lg print:drop-shadow-none whitespace-nowrap">
                    {totalCost > 0 ? formatNum(roi) : '0'} <span className="text-xl lg:text-3xl print:text-xl font-bold">%</span>
                  </p>
                </div>
                <div className="text-center pt-6 md:pt-0 print:pt-0">
                  <p className="text-slate-400 print:text-slate-500 text-[11px] lg:text-base print:text-[11px] font-bold tracking-widest mb-2 lg:mb-4 print:mb-1 break-keep whitespace-nowrap">투자금 전액 회수 기간</p>
                  <p className="text-4xl lg:text-7xl print:text-3xl font-black text-amber-500 print:text-blue-700 drop-shadow-lg print:drop-shadow-none whitespace-nowrap">
                    {totalSave > 0 && totalCost > 0 ? paybackYears.toFixed(1) : '0'} <span className="text-xl lg:text-3xl print:text-xl font-bold">년</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. 상세 분석 & 조명 내역: 💡 print:grid-cols-2 강제 적용 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-8 lg:gap-10 print:gap-6 print:mb-0">
              
              <div>
                <h3 className="text-base lg:text-xl print:text-[13px] font-black border-l-[4px] lg:border-l-[5px] border-blue-600 print:border-blue-700 pl-3 lg:pl-4 print:pl-3 mb-3 lg:mb-5 print:mb-3 text-white print:text-slate-800 break-keep whitespace-nowrap">요금 절감 상세 비교</h3>
                
                <div className="space-y-3 lg:space-y-4 print:space-y-2">
                  <div className="bg-slate-800 print:bg-slate-100 p-4 lg:p-5 print:p-3 rounded-xl print:rounded-lg border border-slate-700 print:border-slate-300 shadow-sm print:shadow-none flex justify-between items-end">
                    <span className="text-slate-400 print:text-slate-500 font-bold text-[11px] lg:text-sm print:text-[10px] break-keep whitespace-nowrap">개선 전 (기존 요금)</span>
                    <span className="text-lg lg:text-2xl print:text-sm font-black text-white print:text-slate-800 whitespace-nowrap">{formatNum(oldCost)} 원</span>
                  </div>
                  
                  <div className="bg-slate-800 border-2 border-blue-500/50 print:bg-orange-50 p-4 lg:p-5 print:p-3 rounded-xl print:rounded-lg print:border-orange-300 shadow-[0_5px_20px_rgba(59,130,246,0.15)] print:shadow-none flex justify-between items-center relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 lg:w-2 print:w-1.5 bg-blue-500 print:bg-orange-500"></div>
                    <span className="text-blue-400 print:text-orange-700 font-bold text-[11px] lg:text-sm print:text-[11px] pl-3 lg:pl-4 print:pl-3 break-keep whitespace-nowrap">도입 후 절감 요금</span>
                    <span className="text-xl lg:text-3xl print:text-lg font-black text-blue-400 print:text-orange-700 whitespace-nowrap">{formatNum(smartCost)} 원</span>
                  </div>
                </div>
                
                <div className="mt-4 print:mt-3 bg-slate-800/50 print:bg-slate-50 p-3 lg:p-4 print:p-2 rounded-lg lg:rounded-xl border border-slate-700 print:border-slate-300">
                  <p className="text-[10px] lg:text-sm print:text-[9px] font-bold text-slate-300 print:text-slate-600 mb-1 whitespace-nowrap">※ 시뮬레이션 적용 기준</p>
                  <p className="text-[10px] lg:text-xs print:text-[9px] text-slate-400 print:text-slate-500">
                    전력 단가 <strong className="text-slate-300 print:text-slate-700">{rate}원/kWh</strong> | 운영 <strong className="text-slate-300 print:text-slate-700">{hours}h/365d</strong> | 스마트 디밍 <strong className="text-slate-300 print:text-slate-700">{dimmingRate}%</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col h-full">
                <h3 className="text-base lg:text-xl print:text-[13px] font-black border-l-[4px] lg:border-l-[5px] border-blue-600 print:border-blue-700 pl-3 lg:pl-4 print:pl-3 mb-3 lg:mb-5 print:mb-3 text-white print:text-slate-800 break-keep whitespace-nowrap">교체 대상 조명 내역</h3>
                
                {/* 💡 print:overflow-visible로 인쇄 시 스크롤바 생성 방지 및 짤림 방지 */}
                <div className="bg-slate-800 print:bg-white border border-slate-700 print:border-slate-300 rounded-xl lg:rounded-2xl print:rounded-lg overflow-x-auto print:overflow-visible shadow-sm print:shadow-none flex-1">
                  <table className="w-full text-[11px] lg:text-sm print:text-[10px] text-left min-w-max print:text-center print:min-w-0">
                    <thead className="bg-slate-900 print:bg-slate-100 text-slate-300 print:text-slate-600 border-b border-slate-700 print:border-slate-300">
                      <tr>
                        <th className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-1.5 font-bold whitespace-nowrap print:text-left">종류</th>
                        <th className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-1.5 text-right font-bold whitespace-nowrap">수량</th>
                        <th className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-1.5 text-right font-bold text-amber-500 print:text-orange-600 whitespace-nowrap">전력 절감</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 print:divide-slate-200">
                      {lights.length > 0 ? (
                        lights.map(l => (
                          <tr key={l.id} className="hover:bg-slate-700 print:hover:bg-slate-50 transition-colors">
                            <td className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-1.5 text-white print:text-slate-800 font-medium whitespace-nowrap print:text-left">{l.type}</td>
                            <td className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-1.5 text-right text-white print:text-slate-800 font-bold whitespace-nowrap">{formatNum(l.qty)}구</td>
                            <td className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-1.5 text-right text-slate-400 print:text-slate-600 whitespace-nowrap">
                              {l.oldW}W <span className="text-amber-500 print:text-orange-600 font-black mx-0.5 lg:mx-1">→</span> <span className="text-amber-500 print:text-orange-700 font-bold">{l.newW}W</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="px-3 lg:px-4 py-5 lg:py-8 print:py-4 text-center text-slate-500 print:text-slate-400 whitespace-nowrap">등록된 조명이 없습니다.</td></tr>
                      )}
                    </tbody>
                    {lights.length > 0 && (
                      <tfoot className="bg-slate-900 print:bg-slate-50 border-t border-slate-700 print:border-slate-300 font-bold">
                        <tr>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-2 text-center text-slate-300 print:text-slate-600 whitespace-nowrap">합계</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 print:px-2 print:py-2 text-right text-amber-500 print:text-orange-700 print:text-sm whitespace-nowrap">{formatNum(totalQty)}구</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}