import { useState, useEffect, type ChangeEvent } from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

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

const formatNum = (num: number) => new Intl.NumberFormat('ko-KR').format(Math.round(num));

Font.register({
  family: 'Pretendard',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-kr@0.2.3/NotoSansKR_400Regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-kr@0.2.3/NotoSansKR_700Bold.ttf', fontWeight: 'bold' },
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-kr@0.2.3/NotoSansKR_900Black.ttf', fontWeight: 'heavy' },
  ]
});

const pdfStyles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: '30px 40px 45px 40px', fontFamily: 'Pretendard' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: '#1e293b' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, backgroundColor: '#1e293b' },
  
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #cbd5e1', paddingBottom: 8, marginBottom: 8 },
  brandTitle: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  mainTitle: { color: '#0f172a', fontSize: 24, fontWeight: 'heavy' },
  siteTag: { marginTop: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: 6, alignSelf: 'flex-start' },
  siteTagLabel: { color: '#475569', fontSize: 10, fontWeight: 'bold', marginRight: 6 },
  siteTagValue: { color: '#0f172a', fontSize: 12, fontWeight: 'heavy' },
  dateText: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  descText: { color: '#64748b', fontSize: 11, marginBottom: 8, lineHeight: 1.3 },
  
  sectionTitle: { fontSize: 13, fontWeight: 'heavy', color: '#1e293b', borderLeft: '4px solid #94a3b8', paddingLeft: 8, marginBottom: 6 },
  
  tableContainer: { border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '6px 0' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e2e8f0', padding: '6px 0' },
  tableFooter: { flexDirection: 'row', backgroundColor: '#f8fafc', borderTop: '1px solid #cbd5e1', padding: '6px 0' },
  col1: { flex: 2, textAlign: 'center', fontSize: 10, color: '#475569', fontWeight: 'bold' },
  col2: { flex: 1, textAlign: 'center', fontSize: 10, color: '#475569', fontWeight: 'bold' },
  col3: { flex: 1.5, textAlign: 'center', fontSize: 10, color: '#d97706', fontWeight: 'bold' },
  cell1: { flex: 2, textAlign: 'center', fontSize: 10, color: '#1e293b' },
  cell2: { flex: 1, textAlign: 'center', fontSize: 10, color: '#1e293b', fontWeight: 'bold' },
  cell3: { flex: 1.5, textAlign: 'center', fontSize: 10, color: '#64748b' },

  giantBox: { flex: 1, flexDirection: 'column' },
  
  criteriaBoxFull: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '6px 0', marginBottom: 8 },
  
  splitRow: { flexDirection: 'row', gap: 12, flex: 1 },
  col: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },

  cardLight: { flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' },
  cardSlate: { flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px' },
  cardYellow: { flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fffbeb', border: '2px solid #fcd34d', borderRadius: 8, padding: '10px 12px' },

  cardLabelLight: { alignSelf: 'flex-start', color: '#64748b', fontSize: 11, fontWeight: 'bold' },
  cardLabelSlate: { alignSelf: 'flex-start', color: '#334155', fontSize: 11, fontWeight: 'bold' },
  cardLabelYellow: { alignSelf: 'flex-start', color: '#b45309', fontSize: 12, fontWeight: 'heavy' },

  valContainer: { alignSelf: 'flex-end', alignItems: 'flex-end', marginTop: 6 },
  
  valLight: { color: '#475569', fontSize: 18, fontWeight: 'heavy' },
  valSlate: { color: '#0f172a', fontSize: 22, fontWeight: 'heavy' },
  valYellow: { color: '#d97706', fontSize: 26, fontWeight: 'heavy' },
  
  unitLight: { color: '#475569', fontSize: 10, fontWeight: 'bold' },
  unitSlate: { color: '#0f172a', fontSize: 11, fontWeight: 'bold' },
  unitYellow: { color: '#d97706', fontSize: 12, fontWeight: 'heavy' },
  
  subLight: { color: '#64748b', fontSize: 9, marginBottom: 2 },
  subSlate: { color: '#475569', fontSize: 9, marginBottom: 2 },
  subYellow: { color: '#b45309', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },

  footer: { position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center' },
  footerNotice: { fontSize: 8, color: '#64748b', marginBottom: 2 },
  footerBrand: { fontSize: 10, color: '#334155', fontWeight: 'bold' }
});

const ProposalPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.topBar} fixed />
      <View style={pdfStyles.bottomBar} fixed />

      <View style={pdfStyles.headerContainer}>
        <View>
          <Text style={pdfStyles.brandTitle}>FLOLIM ENERGY SOLUTION</Text>
          <Text style={pdfStyles.mainTitle}>스마트 조명 도입 성과 분석 리포트</Text>
          <View style={pdfStyles.siteTag}>
            <Text style={pdfStyles.siteTagLabel}>대상 현장</Text>
            <Text style={{ ...pdfStyles.siteTagValue, color: data.siteName ? '#0f172a' : '#94a3b8' }}>
              {data.siteName || '현장명 미입력'}
            </Text>
          </View>
        </View>
        <Text style={pdfStyles.dateText}>분석 기준일 : {data.date}</Text>
      </View>

      <Text style={pdfStyles.descText}>
        귀사의 현장 운영 데이터를 기반으로 산출된 초고효율 LED 및 IoT 스마트 제어 시스템 도입에 따른 예상 에너지 절감액 및 투자 회수(ROI) 분석 결과입니다.
      </Text>

      <View style={{ flex: 1 }}>
        <View>
          <Text style={pdfStyles.sectionTitle}>교체 대상 조명 내역</Text>
          <View style={pdfStyles.tableContainer}>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.col1}>종류</Text>
              <Text style={pdfStyles.col2}>수량</Text>
              <Text style={pdfStyles.col3}>전력 절감</Text>
            </View>
            {data.lights.length > 0 ? (
              <>
                {data.lights.slice(0, 5).map((l: any, i: number) => (
                  <View key={i} style={{ ...pdfStyles.tableRow, borderBottom: i === 4 || i === data.lights.length -1 ? 'none' : '1px solid #e2e8f0' }}>
                    <Text style={pdfStyles.cell1}>{l.type}</Text>
                    <Text style={pdfStyles.cell2}>{formatNum(l.qty)}구</Text>
                    <Text style={pdfStyles.cell3}>{l.oldW}W → {l.newW}W</Text>
                  </View>
                ))}
                {data.lights.length > 5 && (
                  <View style={{ padding: 6, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Text style={{ textAlign: 'center', fontSize: 9, color: '#64748b', fontWeight: 'bold' }}>... 외 {data.lights.length - 5}건 추가됨</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={{ padding: 15, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#94a3b8' }}>등록된 조명이 없습니다.</Text>
              </View>
            )}
            {data.lights.length > 0 && (
              <View style={pdfStyles.tableFooter}>
                <Text style={{ flex: 2, textAlign: 'center', fontSize: 10, color: '#334155', fontWeight: 'bold' }}>합계</Text>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#d97706', fontWeight: 'bold' }}>{formatNum(data.totalQty)}구</Text>
                <Text style={{ flex: 1.5 }}></Text>
              </View>
            )}
          </View>
        </View>

        <View style={pdfStyles.giantBox}>
          <View style={pdfStyles.criteriaBoxFull}>
            <Text style={{ fontSize: 10, color: '#475569', fontWeight: 'bold', marginRight: 8 }}>※ 시뮬레이션 적용 기준</Text>
            <Text style={{ fontSize: 9, color: '#64748b' }}>전력 단가 {data.rate || 0}원/kWh | 운영 {data.hours || 0}h/365d | 스마트 디밍 {data.dimmingRate}%</Text>
          </View>

          <View style={pdfStyles.splitRow}>
            <View style={pdfStyles.col}>
              <Text style={pdfStyles.sectionTitle}>요금 절감 상세 비교</Text>
              <View style={pdfStyles.cardLight}>
                <Text style={pdfStyles.cardLabelLight}>개선 전 (기존 요금)</Text>
                <View style={pdfStyles.valContainer}>
                  <Text style={pdfStyles.subLight}>월 평균 {formatNum(data.monthlyOldCost)} 원</Text>
                  <Text>
                    <Text style={pdfStyles.valLight}>{formatNum(data.oldCost)}</Text>
                    <Text style={pdfStyles.unitLight}> 원</Text>
                  </Text>
                </View>
              </View>

              <View style={pdfStyles.cardSlate}>
                <Text style={pdfStyles.cardLabelSlate}>도입 후 예상 요금</Text>
                <View style={pdfStyles.valContainer}>
                  <Text style={pdfStyles.subSlate}>월 평균 {formatNum(data.monthlySmartCost)} 원</Text>
                  <Text>
                    <Text style={pdfStyles.valSlate}>{formatNum(data.smartCost)}</Text>
                    <Text style={pdfStyles.unitSlate}> 원</Text>
                  </Text>
                </View>
              </View>

              <View style={pdfStyles.cardYellow}>
                <Text style={pdfStyles.cardLabelYellow}>순수 요금 절감액</Text>
                <View style={pdfStyles.valContainer}>
                  <Text style={pdfStyles.subYellow}>월 평균 {formatNum(data.monthlySave)} 원</Text>
                  <Text>
                    <Text style={pdfStyles.valYellow}>{formatNum(data.totalSave)}</Text>
                    <Text style={pdfStyles.unitYellow}> 원</Text>
                  </Text>
                </View>
              </View>
            </View>

            <View style={pdfStyles.col}>
              <Text style={pdfStyles.sectionTitle}>투자 성과 요약</Text>
              <View style={pdfStyles.cardLight}>
                <Text style={pdfStyles.cardLabelLight}>총 투자 사업비</Text>
                <View style={pdfStyles.valContainer}>
                  <Text style={{ ...pdfStyles.subLight, color: 'transparent' }}>spacer</Text>
                  <Text>
                    <Text style={pdfStyles.valLight}>{formatNum(data.totalCost)}</Text>
                    <Text style={pdfStyles.unitLight}> 원</Text>
                  </Text>
                </View>
              </View>

              <View style={pdfStyles.cardSlate}>
                <Text style={pdfStyles.cardLabelSlate}>예상 투자수익률 (ROI)</Text>
                <View style={pdfStyles.valContainer}>
                  <Text style={{ ...pdfStyles.subSlate, color: 'transparent' }}>spacer</Text>
                  <Text>
                    <Text style={pdfStyles.valSlate}>{data.roi.toFixed(1)}</Text>
                    <Text style={pdfStyles.unitSlate}> %</Text>
                  </Text>
                </View>
              </View>

              <View style={pdfStyles.cardYellow}>
                <Text style={pdfStyles.cardLabelYellow}>투자금 전액 회수 기간</Text>
                <View style={pdfStyles.valContainer}>
                  <Text style={{ ...pdfStyles.subYellow, color: 'transparent' }}>spacer</Text>
                  <Text>
                    <Text style={pdfStyles.valYellow}>{data.totalSave > 0 && data.totalCost > 0 ? data.paybackYears.toFixed(1) : '0'}</Text>
                    <Text style={pdfStyles.unitYellow}> 년</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={pdfStyles.footer} fixed>
        <Text style={pdfStyles.footerNotice}>본 분석 리포트의 데이터는 입력된 시뮬레이션 수치를 기반으로 산출된 예상치이며, 실제 현장 상황에 따라 차이가 발생할 수 있습니다.</Text>
        <Text style={pdfStyles.footerBrand}>주식회사 플로림 | 1660-0687</Text>
      </View>
    </Page>
  </Document>
);

function CountUp({ value, animate, isCurrency = false, decimals = 0 }: { value: number, animate: boolean, isCurrency?: boolean, decimals?: number }) {
  const [count, setCount] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setCount(value);
      return;
    }
    let start: number | null = null;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(ease * value);
      if (progress < 1) window.requestAnimationFrame(step);
      else setCount(value);
    };
    window.requestAnimationFrame(step);
  }, [value, animate]);

  return <span>{isCurrency ? new Intl.NumberFormat('ko-KR').format(Math.round(count)) : count.toFixed(decimals)}</span>;
}

export default function App() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const [siteName, setSiteName] = useState('');
  const [lights, setLights] = useState<LightItem[]>([]);
  const [formType, setFormType] = useState(LIGHT_PRESETS[0].name);
  const [formOldW, setFormOldW] = useState<number | string>(LIGHT_PRESETS[0].defaultOld);
  const [formNewW, setFormNewW] = useState<number | string>(LIGHT_PRESETS[0].defaultNew);
  const [formQty, setFormQty] = useState<number | string>('');

  const [hours, setHours] = useState<number | string>(11);
  const [days, setDays] = useState<number | string>(365);
  const [rate, setRate] = useState<number | string>(145);
  const [dimmingRate, setDimmingRate] = useState<number>(40); 

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
    setFormQty('');
  };

  const handleRemoveLight = (id: number) => setLights(lights.filter(l => l.id !== id));

  const handleNumChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setter(rawValue ? parseInt(rawValue, 10).toLocaleString('ko-KR') : '');
  };

  const handleModeToggle = (mode: boolean) => {
    setIsPreviewMode(mode);
    if (mode) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
  
  const monthlySave = totalSave > 0 ? totalSave / 12 : 0;
  const monthlyOldCost = oldCost > 0 ? oldCost / 12 : 0;
  const monthlySmartCost = smartCost > 0 ? smartCost / 12 : 0;

  const numQuoteA = parseInt(quoteA.replace(/,/g, '') || '0', 10);
  const numQuoteB = parseInt(quoteB.replace(/,/g, '') || '0', 10);
  const numQuoteC = parseInt(quoteC.replace(/,/g, '') || '0', 10);
  const totalCost = numQuoteA + numQuoteB + numQuoteC;

  const roi = totalCost > 0 && totalSave > 0 ? (totalSave / totalCost) * 100 : 0;
  const paybackYears = totalSave > 0 && totalCost > 0 ? (totalCost / totalSave) : 0;

  const handleDownloadPDF = async () => {
    if (lights.length === 0) {
      alert('조명 데이터를 최소 1개 이상 추가해 주세요.');
      return;
    }
    
    setIsPdfGenerating(true);
    
    try {
      const pdfData = {
        siteName, date: new Date().toLocaleDateString('ko-KR'), totalCost, paybackYears, roi, 
        oldCost, smartCost, totalSave, monthlyOldCost, monthlySmartCost, monthlySave, 
        rate, hours, dimmingRate, lights, totalQty
      };

      const doc = <ProposalPDF data={pdfData} />;
      const blob = await pdf(doc).toBlob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${siteName || '플로림'}_스마트에너지_제안서.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('PDF 생성 상세 에러:', error);
      alert(`PDF 생성 중 오류가 발생했습니다.\n상세: ${error.message || error}`);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen font-['Pretendard',sans-serif] pb-24 selection:bg-yellow-500 selection:text-slate-900 bg-[#020617]`}>
      
      <style>
        {`
          @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
          
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}
      </style>

      <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50 flex flex-col-reverse sm:flex-row items-end gap-3 animate-fade-in">
        <button 
          onClick={handleDownloadPDF}
          disabled={isPdfGenerating}
          className="bg-[#050b14]/90 hover:bg-slate-800 backdrop-blur-md text-slate-300 hover:text-white px-6 py-3.5 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-xl border border-slate-700 transition-all whitespace-nowrap disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          {isPdfGenerating ? 'PDF 굽는 중...' : '제안서 PDF 다운로드'}
        </button>

        <button 
          onClick={() => handleModeToggle(!isPreviewMode)}
          className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-6 py-3.5 rounded-full font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(250,204,21,0.3)] transition-all whitespace-nowrap"
        >
          {isPreviewMode ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path></svg>
              대시보드로 복귀
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              고객 시연 화면으로 띄우기
            </>
          )}
        </button>
      </div>

      {!isPreviewMode && (
        <div className={isPdfGenerating ? "hidden" : "block"}>
          <div className="border-b border-slate-800 bg-[#050b14] py-10 text-center relative overflow-hidden">
            {/* 💡 롤백 완료: 큰 제목과 아이콘 없애고 원래대로 복구 */}
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight relative z-10">스마트 에너지 솔루션 시뮬레이터</h1>
            <p className="text-slate-400 text-sm md:text-base font-medium relative z-10">데이터를 입력하시면 하단 리포트에 실시간 동기화됩니다.</p>
          </div>

          <div className="container mx-auto px-4 max-w-5xl mt-8 space-y-6 mb-10">
            <div className="bg-[#050b14] p-6 lg:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row gap-8 shadow-xl">
              <div className="flex-1 flex flex-col w-full min-h-0">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-base"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>조명 구성 추가</h2>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 mb-4 shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="sm:col-span-3">
                      <label className="text-xs text-slate-400 mb-1 block">조명 종류</label>
                      <select value={formType} onChange={handleTypeChange} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-200 focus:border-slate-500 outline-none transition-colors cursor-pointer">
                        {LIGHT_PRESETS.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">기존 조명</label>
                      <div className="relative"><input type="number" value={formOldW} onChange={(e)=>setFormOldW(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-200 pr-7" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">W</span></div>
                    </div>
                    <div>
                      <label className="text-xs text-yellow-500 font-bold mb-1 block">신규 LED</label>
                      <div className="relative"><input type="number" value={formNewW} onChange={(e)=>setFormNewW(e.target.value)} className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2.5 text-base text-yellow-400 font-bold pr-7" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500/70 text-sm font-bold pointer-events-none">W</span></div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">수량</label>
                      <div className="relative"><input type="number" value={formQty} onChange={(e)=>setFormQty(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-200 pr-7" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">구</span></div>
                    </div>
                  </div>
                  <button onClick={handleAddLight} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-base transition-colors shadow-sm">리스트에 추가하기</button>
                </div>
                {lights.length > 0 && (
                  <div className="mt-2 border border-slate-800 rounded-xl flex-1 flex flex-col min-h-[150px] max-h-[250px] overflow-hidden bg-[#020617]/30">
                    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                      <table className="w-full text-sm text-left min-w-[300px] relative">
                        <thead className="bg-[#050b14]/95 text-slate-400 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
                          <tr>
                            <th className="px-4 py-3 whitespace-nowrap font-medium text-center">종류</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap font-medium">W변화</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap font-medium">수량</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap font-medium">삭제</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-center">
                          {lights.map(l => (
                            <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{l.type}</td>
                              <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{l.oldW} <span className="text-yellow-500 font-bold mx-1">→</span> <span className="text-yellow-400 font-bold">{l.newW}</span></td>
                              <td className="px-4 py-3 text-white font-bold whitespace-nowrap">{formatNum(l.qty)}구</td>
                              <td className="px-4 py-3 whitespace-nowrap"><button onClick={() => handleRemoveLight(l.id)} className="text-slate-600 hover:bg-red-500/20 hover:text-red-400 p-1.5 rounded transition-colors">✕</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-base"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>현장 및 제어 설정</h2>
                <div className="mb-5">
                  <label className="text-xs text-slate-400 mb-1.5 block">대상 현장명 (고객사명)</label>
                  <input type="text" value={siteName} onChange={(e)=>setSiteName(e.target.value)} placeholder="예: OOOO 물류센터, OOO빌딩 등" className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-200 focus:border-slate-500 outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div><label className="text-xs text-slate-400 mb-1.5 block whitespace-nowrap">일 점등(h)</label><input type="number" value={hours} onChange={(e)=>setHours(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-200" /></div>
                  <div><label className="text-xs text-slate-400 mb-1.5 block whitespace-nowrap">연 가동(d)</label><input type="number" value={days} onChange={(e)=>setDays(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-200" /></div>
                  <div><label className="text-xs text-slate-400 mb-1.5 block whitespace-nowrap">단가(원)</label><input type="number" value={rate} onChange={(e)=>setRate(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-200" /></div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-400 whitespace-nowrap">디밍 절감율</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={dimmingRate} 
                        onChange={(e) => {
                          let val = parseInt(e.target.value, 10);
                          if (isNaN(val)) val = 0;
                          if (val > 100) val = 100;
                          if (val < 0) val = 0;
                          setDimmingRate(val);
                        }} 
                        className="w-16 bg-[#050b14] border border-slate-700 rounded-lg px-2 py-1 text-right text-slate-200 font-bold focus:border-slate-500 outline-none transition-colors" 
                      />
                      <span className="text-slate-200 font-bold">%</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="1" 
                    value={dimmingRate} 
                    onChange={(e) => setDimmingRate(Number(e.target.value))} 
                    className="w-full accent-slate-500 h-2 bg-[#020617] rounded-lg cursor-pointer mt-2" 
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#050b14] p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-xl mb-12">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-base"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>협력사 견적 합산 (내부 원가)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: '플로림 (A)', val: quoteA, setter: setQuoteA },
                  { label: '투반 (B)', val: quoteB, setter: setQuoteB },
                  { label: '창성 (C)', val: quoteC, setter: setQuoteC }
                ].map((q, i) => (
                  <div key={i}>
                    <label className="text-xs text-slate-400 mb-1.5 block whitespace-nowrap pl-1">{q.label}</label>
                    <div className="relative">
                      <input type="text" value={q.val} onChange={handleNumChange(q.setter)} placeholder="0" className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-right font-bold pr-8 text-base" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-base">원</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-center gap-3 pt-5 border-t border-slate-800">
                <span className="text-slate-500 text-sm whitespace-nowrap">총 사업비 합산 :</span>
                <span className="text-2xl font-black text-yellow-400">{formatNum(totalCost)} <span className="text-xl font-bold text-slate-500">원</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 고객 시연 화면 (웹 뷰) */}
      <div className={`container mx-auto transition-all duration-500 ${isPreviewMode ? 'max-w-5xl mt-0 px-0' : 'max-w-5xl mt-8 px-4'} ${isPdfGenerating ? 'hidden' : 'block'}`}>
        <div className={`bg-[#050b14] shadow-2xl relative overflow-hidden border border-slate-800 ${isPreviewMode ? 'rounded-none border-x-0 border-b-0' : 'md:rounded-3xl'} flex flex-col min-h-screen`}>
          <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-slate-700 z-20"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 md:h-3 bg-slate-700 z-20"></div>
          <div className="flex-1 flex flex-col w-full h-full relative z-10">
            <div className={`px-5 sm:px-8 lg:px-12 ${isPreviewMode ? 'pt-6 md:pt-10' : 'pt-8 md:pt-14'}`}>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center pb-4 border-b border-slate-800 mb-6">
                <div className="mb-3 lg:mb-0">
                  <p className="text-slate-500 font-bold tracking-widest text-[10px] sm:text-xs lg:text-sm mb-1 lg:mb-2 whitespace-nowrap">FLOLIM ENERGY SOLUTION</p>
                  <h1 className="text-2xl sm:text-[28px] md:text-[32px] lg:text-4xl font-black tracking-tight break-keep text-white whitespace-nowrap sm:whitespace-normal">스마트 조명 도입 성과 분석 리포트</h1>
                  <div className="mt-2 lg:mt-3 inline-block px-3 py-1.5 rounded-lg border bg-slate-900 border-slate-800 whitespace-nowrap">
                    <span className="inline-block align-middle mr-2 text-slate-500 text-xs font-bold">대상 현장</span>
                    <span className={`inline-block align-middle ${siteName ? 'text-yellow-500' : 'text-slate-600'} text-sm lg:text-base font-black`}>{siteName || '현장명 미입력'}</span>
                  </div>
                </div>
                <div className="text-left lg:text-right text-[11px] sm:text-xs lg:text-sm text-slate-500 font-medium whitespace-nowrap">분석 기준일 : {new Date().toLocaleDateString('ko-KR')}</div>
              </div>
              {!isPreviewMode && <p className="text-slate-400 text-xs sm:text-sm lg:text-base font-medium break-keep mb-8">귀사의 현장 운영 데이터를 기반으로 산출된 초고효율 LED 및 IoT 스마트 제어 시스템 도입에 따른 <strong className="text-white">예상 에너지 절감액 및 투자 회수(ROI) 분석 결과</strong>입니다.</p>}
            </div>
            <div className={`px-5 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center ${isPreviewMode ? 'pt-2 lg:pt-4' : ''}`}>
              <div className="mb-6 lg:mb-8 shrink-0">
                <h3 className="text-base lg:text-xl font-black border-l-[4px] lg:border-l-[5px] border-slate-600 text-white pl-3 lg:pl-4 mb-3 lg:mb-5 break-keep whitespace-nowrap">교체 대상 조명 내역</h3>
                <div className="flex flex-col w-full max-h-[250px] lg:max-h-[300px] bg-slate-900 border border-slate-800 rounded-xl lg:rounded-2xl overflow-hidden">
                  <div className="overflow-y-auto custom-scrollbar">
                    <table className="w-full table-fixed text-[11px] lg:text-sm text-center">
                      <thead className="bg-slate-900/95 border-b border-slate-800 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                          <th className="w-[45%] px-3 lg:px-4 py-3 font-bold whitespace-nowrap text-center">종류</th>
                          <th className="w-[25%] px-3 lg:px-4 py-3 font-bold whitespace-nowrap text-center">수량</th>
                          <th className="w-[30%] px-3 lg:px-4 py-3 font-bold text-yellow-500 whitespace-nowrap text-center">전력 절감</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {lights.length > 0 ? (
                          lights.map(l => (
                            <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="w-[45%] px-3 lg:px-4 py-3.5 font-medium break-keep text-center text-slate-200">{l.type}</td>
                              <td className="w-[25%] px-3 lg:px-4 py-3.5 font-bold whitespace-nowrap text-center text-slate-200">{formatNum(l.qty)}구</td>
                              <td className="w-[30%] px-3 lg:px-4 py-3.5 whitespace-nowrap text-center text-slate-500">
                                <div className="flex items-center justify-center gap-1">
                                  <span>{l.oldW}W</span>
                                  <span className="text-yellow-500 font-black">→</span>
                                  <span className="text-yellow-400 font-bold">{l.newW}W</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="px-3 lg:px-4 py-8 text-center whitespace-nowrap text-slate-600">등록된 조명이 없습니다.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {lights.length > 0 && (
                    <div className="shrink-0 bg-slate-900/95 border-t border-slate-800 z-10 backdrop-blur-sm">
                      <table className="w-full table-fixed text-[11px] lg:text-sm text-center">
                        <tfoot className="font-bold text-slate-300">
                          <tr>
                            <td className="w-[45%] px-3 lg:px-4 py-3 text-center whitespace-nowrap">합계</td>
                            <td className="w-[25%] px-3 lg:px-4 py-3 text-center text-sm whitespace-nowrap text-yellow-400">{formatNum(totalQty)}구</td>
                            <td className="w-[30%] px-3 lg:px-4 py-3"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col w-full mb-8 lg:mb-12 shrink-0">
                <div className="bg-slate-900/50 border border-slate-800 px-5 py-4 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-2 lg:gap-4 mb-6 lg:mb-8">
                  <span className="text-[11px] lg:text-sm font-bold text-slate-400 whitespace-nowrap">※ 시뮬레이션 적용 기준</span>
                  <span className="text-[11px] lg:text-xs text-slate-500">전력 단가 <strong className="text-slate-300">{rate || 0}원/kWh</strong> <span className="mx-1 lg:mx-2">|</span> 운영 <strong className="text-slate-300">{hours || 0}h/365d</strong> <span className="mx-1 lg:mx-2">|</span> 스마트 디밍 <strong className="text-slate-300">{dimmingRate}%</strong></span>
                </div>
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
                  <div className="flex-1 flex flex-col w-full">
                    <h3 className="text-base lg:text-lg font-black border-l-[4px] lg:border-l-[5px] border-slate-600 text-white pl-3 lg:pl-4 mb-4 break-keep whitespace-nowrap">요금 절감 상세 비교</h3>
                    <div className="flex flex-col gap-3 lg:gap-4">
                      <div className="w-full min-h-[110px] lg:min-h-[130px] bg-slate-900 border border-slate-800 p-4 lg:p-5 rounded-xl flex flex-col">
                        <span className="text-slate-500 font-bold text-xs lg:text-sm break-keep whitespace-nowrap self-start">개선 전 (기존 요금)</span>
                        <div className="mt-auto flex flex-col items-end pt-3 w-full">
                          <div className="text-[10px] lg:text-xs text-slate-600 font-medium mb-1 leading-none">월 평균 {formatNum(monthlyOldCost)} 원</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl lg:text-2xl font-black text-slate-400 tracking-tighter"><CountUp value={oldCost} animate={isPreviewMode} isCurrency={true} /></span>
                            <span className="text-[10px] lg:text-xs font-bold text-slate-400">원</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full min-h-[110px] lg:min-h-[130px] bg-slate-800 border border-slate-700 p-4 lg:p-5 rounded-xl flex flex-col">
                        <span className="text-slate-300 font-bold text-xs lg:text-sm break-keep whitespace-nowrap self-start">도입 후 예상 요금</span>
                        <div className="mt-auto flex flex-col items-end pt-3 w-full">
                          <div className="text-[10px] lg:text-xs text-slate-400 font-medium mb-1 leading-none">월 평균 <CountUp value={monthlySmartCost} animate={isPreviewMode} isCurrency={true} /> 원</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl lg:text-3xl font-black text-white tracking-tighter"><CountUp value={smartCost} animate={isPreviewMode} isCurrency={true} /></span>
                            <span className="text-[10px] lg:text-xs font-bold text-white">원</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full min-h-[110px] lg:min-h-[130px] bg-yellow-500/10 border-2 border-yellow-500/50 p-4 lg:p-5 rounded-xl flex flex-col">
                        <span className="text-yellow-500 font-black text-sm lg:text-base break-keep whitespace-nowrap leading-tight self-start">순수 요금 절감액</span>
                        <div className="mt-auto flex flex-col items-end pt-3 w-full">
                          <div className="text-[10px] lg:text-xs text-yellow-500/80 font-bold mb-1 leading-none inline-block">월 평균 <CountUp value={monthlySave} animate={isPreviewMode} isCurrency={true} /> 원</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl lg:text-4xl font-black text-yellow-400 tracking-tighter"><CountUp value={totalSave} animate={isPreviewMode} isCurrency={true} /></span>
                            <span className="text-[10px] lg:text-xs font-bold text-yellow-400">원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col w-full">
                    <h3 className="block lg:hidden text-base font-black border-l-[4px] border-slate-600 text-white pl-3 mb-4 break-keep whitespace-nowrap">투자 성과 요약</h3>
                    <h3 className="hidden lg:block text-lg font-black border-l-[5px] border-slate-600 text-white pl-4 mb-4 break-keep whitespace-nowrap">투자 성과 요약</h3>
                    <div className="flex flex-col gap-3 lg:gap-4">
                      <div className="w-full min-h-[110px] lg:min-h-[130px] bg-slate-900 border border-slate-800 p-4 lg:p-5 rounded-xl flex flex-col">
                        <span className="text-slate-500 font-bold text-xs lg:text-sm break-keep whitespace-nowrap self-start">총 투자 사업비</span>
                        <div className="mt-auto flex flex-col items-end pt-3 w-full">
                          <div className="text-[10px] lg:text-xs text-transparent font-medium mb-1 leading-none select-none">spacer</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl lg:text-2xl font-black text-slate-400 tracking-tighter"><CountUp value={totalCost} animate={isPreviewMode} isCurrency={true} /></span>
                            <span className="text-[10px] lg:text-xs font-bold text-slate-400">원</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full min-h-[110px] lg:min-h-[130px] bg-slate-800 border border-slate-700 p-4 lg:p-5 rounded-xl flex flex-col">
                        <span className="text-slate-300 font-bold text-xs lg:text-sm break-keep whitespace-nowrap self-start">예상 투자수익률 (ROI)</span>
                        <div className="mt-auto flex flex-col items-end pt-3 w-full">
                          <div className="text-[10px] lg:text-xs text-transparent font-medium mb-1 leading-none select-none">spacer</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl lg:text-3xl font-black text-white tracking-tighter"><CountUp value={roi} animate={isPreviewMode} decimals={1} /></span>
                            <span className="text-[10px] lg:text-xs font-bold text-white">%</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full min-h-[110px] lg:min-h-[130px] bg-yellow-500/10 border-2 border-yellow-500/50 p-4 lg:p-5 rounded-xl flex flex-col">
                        <span className="text-yellow-500 font-black text-sm lg:text-base break-keep whitespace-nowrap leading-tight self-start">투자금 전액 회수 기간</span>
                        <div className="mt-auto flex flex-col items-end pt-3 w-full">
                          <div className="text-[10px] lg:text-xs text-transparent font-bold mb-1 leading-none select-none">spacer</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl lg:text-4xl font-black text-yellow-400 tracking-tighter">{totalSave > 0 && totalCost > 0 ? <CountUp value={paybackYears} animate={isPreviewMode} decimals={1} /> : '0'}</span>
                            <span className="text-[10px] lg:text-xs font-bold text-yellow-400">년</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-8 pb-8 md:pt-14 md:pb-14 text-center z-10 border-t border-slate-800 flex flex-col justify-center shrink-0">
                <p className="text-[10px] lg:text-xs mb-1.5 text-slate-500">본 분석 리포트의 데이터는 입력된 시뮬레이션 수치를 기반으로 산출된 예상치이며, 실제 현장 상황에 따라 차이가 발생할 수 있습니다.</p>
                <p className="text-[11px] lg:text-sm font-bold text-slate-400">주식회사 플로림 | 1660-0687</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}