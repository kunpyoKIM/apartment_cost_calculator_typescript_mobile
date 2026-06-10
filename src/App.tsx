import React, { useMemo, useState } from 'react';
import { Calculator, ChevronRight, Home, Moon, Printer, RotateCcw, Sun } from 'lucide-react';

type TabKey = 'home' | 'result';
type StepKey = 'area' | 'unit' | 'region' | 'housing' | 'parking' | 'green' | 'pf';
type RateMode = 'min' | 'mid' | 'max';
type RateRow = { key: string; label: string; min: number; max: number; premium?: number };
type MolitRate = { year: string; base: number; basement: number };

const molitRates: MolitRate[] = [
  { year: '2026', base: 7326, basement: 2472 },
  { year: '2025', base: 7175, basement: 2400 },
  { year: '2024', base: 6900, basement: 2300 }
];

const regionRates: RateRow[] = [
  { key: 'seoul', label: '서울', min: 10500, max: 13500 },
  { key: 'busan', label: '부산', min: 8500, max: 10500 },
  { key: 'incheon', label: '인천', min: 8800, max: 10800 },
  { key: 'daegu', label: '대구', min: 7800, max: 9500 },
  { key: 'daejeon', label: '대전', min: 7800, max: 9300 },
  { key: 'gwangju', label: '광주', min: 7500, max: 9000 },
  { key: 'metro', label: '그 외 광역시', min: 7800, max: 9800 },
  { key: 'other', label: '그 외 지역', min: 7000, max: 8500 }
];

const housingTypes: RateRow[] = [
  { key: 'private', label: '일반 민간아파트', min: 8000, max: 10000, premium: 0 },
  { key: 'brand', label: '브랜드 대단지', min: 10000, max: 13000, premium: 15 },
  { key: 'highend', label: '하이엔드 아파트', min: 15000, max: 20000, premium: 50 },
  { key: 'lh', label: '공공/LH형', min: 6500, max: 8000, premium: -5 }
];

const parkingTypes: RateRow[] = [
  { key: 'normal', label: '일반 지하주차장', min: 4000, max: 6500, premium: 0 },
  { key: 'deep', label: '도심지 심도 깊은 현장', min: 7000, max: 12000, premium: 60 },
  { key: 'rock', label: '역타·암반 포함', min: 10000, max: 14000, premium: 90 },
  { key: 'gangnam', label: '강남권 하이엔드', min: 12000, max: 18000, premium: 120 }
];

const greenOptions: RateRow[] = [
  { key: 'none', label: '미적용', min: 0, max: 0 },
  { key: 'greenGood', label: '녹색건축 우수', min: 1, max: 2 },
  { key: 'zeb5', label: '제로에너지 5등급', min: 3, max: 5 },
  { key: 'zeb4', label: '제로에너지 4등급', min: 5, max: 8 },
  { key: 'zeb3', label: '제로에너지 3등급 이상', min: 8, max: 15 }
];

const pfOptions: RateRow[] = [
  { key: 'local', label: '지방 일반 공동주택', min: 8000, max: 9500 },
  { key: 'capital', label: '수도권 일반 공동주택', min: 9500, max: 11000 },
  { key: 'seoulUrban', label: '서울 도심형', min: 11000, max: 14000 },
  { key: 'gangnamHigh', label: '강남권 하이엔드', min: 15000, max: 20000 }
];

const fmt = (v: number | string) => Number(String(v || '0').replace(/,/g, '') || 0).toLocaleString('ko-KR', { maximumFractionDigits: 0 });
const num = (v: string) => { const n = Number(String(v || '0').replace(/,/g, '')); return Number.isFinite(n) ? n : 0; };
const raw = (v: string) => String(v || '').replace(/,/g, '');

function rateByMode(row: RateRow, mode: RateMode): number {
  if (mode === 'min') return row.min;
  if (mode === 'max') return row.max;
  return (row.min + row.max) / 2;
}

function diffPercent(current: number, base: number): string {
  if (!base) return '0.0%';
  const diff = ((current - base) / base) * 100;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
}

function Field({ label, value, onChange, comma = false, suffix = '' }: { label: string; value: string; onChange: (v: string) => void; comma?: boolean; suffix?: string }) {
  return <label className="field"><span>{label}</span><div className="fieldBox"><input value={comma ? fmt(value) : value} onChange={(e) => onChange(comma ? raw(e.target.value) : e.target.value)} type="text"
          inputMode="numeric"
          pattern="[0-9,]*"
          enterKeyHint="done" />{suffix && <em>{suffix}</em>}</div></label>;
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return <div className="resultLine"><span>{label}</span><strong>{value}</strong></div>;
}

function OptionList({ title, items, value, onChange, unit = '천원/평' }: { title: string; items: RateRow[]; value: string; onChange: (v: string) => void; unit?: string }) {
  return <section className="mobileCard"><div className="cardTitle">{title}</div><div className="optionList">{items.map((x) => <button key={x.key} type="button" className={x.key === value ? 'optionItem selected' : 'optionItem'} onClick={() => onChange(x.key)}><span><strong>{x.label}</strong><small>{fmt(x.min)} ~ {fmt(x.max)} {unit}</small></span><ChevronRight size={18} /></button>)}</div></section>;
}

function BarLine({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <div className="barLine"><div><span>{label}</span><strong>{fmt(value)} 천원</strong></div><i><b style={{ width: `${pct}%` }} /></i></div>;
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<TabKey>('home');
  const [focusStep, setFocusStep] = useState<StepKey>('area');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [useMolitBase, setUseMolitBase] = useState(true);
  const [regionRateMode, setRegionRateMode] = useState<RateMode>('mid');
  const currentMolit = molitRates.find((x) => x.year === selectedYear) || molitRates[0];
  const [manualBaseCost, setManualBaseCost] = useState(String(currentMolit.base));
  const [manualBasementCost, setManualBasementCost] = useState(String(currentMolit.basement));
  const [region, setRegion] = useState('');
  const [housingType, setHousingType] = useState('');
  const [parkingType, setParkingType] = useState('');
  const [greenType, setGreenType] = useState('');
  const [pfType, setPfType] = useState('');
  const [landCost, setLandCost] = useState('');
  const [landArea, setLandArea] = useState('');
  const [apartmentArea, setApartmentArea] = useState('');
  const [officetelArea, setOfficetelArea] = useState('');
  const [retailArea, setRetailArea] = useState('');
  const [basementArea, setBasementArea] = useState('');
  const [increaseRate, setIncreaseRate] = useState('5');
  const [loanRatio, setLoanRatio] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [periodMonths, setPeriodMonths] = useState('');
  const [salesRevenue, setSalesRevenue] = useState('');
  const [operatingIncome, setOperatingIncome] = useState('');
  const [annualDebtService, setAnnualDebtService] = useState('');

  const selectedRegion = regionRates.find((x) => x.key === region) || regionRates[0];
  const selectedHousing = housingTypes.find((x) => x.key === housingType) || housingTypes[0];
  const selectedParking = parkingTypes.find((x) => x.key === parkingType) || parkingTypes[0];
  const selectedGreen = greenOptions.find((x) => x.key === greenType) || greenOptions[0];
  const landPyeongPrice = num(landArea) > 0 ? num(landCost) / num(landArea) : 0;

  const stepComplete: Record<StepKey, boolean> = {
    area: num(landCost) > 0 && num(landArea) > 0 && num(apartmentArea) + num(officetelArea) + num(retailArea) + num(basementArea) > 0,
    unit: useMolitBase || (num(manualBaseCost) > 0 && num(manualBasementCost) > 0),
    region: region !== '',
    housing: housingType !== '',
    parking: parkingType !== '',
    green: greenType !== '',
    pf: pfType !== '' && num(loanRatio) > 0 && num(interestRate) > 0 && num(periodMonths) > 0
  };

  const calc = useMemo(() => {
    const regionPracticalRate = rateByMode(selectedRegion, regionRateMode);
    const housingPracticalRate = rateByMode(selectedHousing, regionRateMode);
    const practicalBaseRate = Math.max(regionPracticalRate, housingPracticalRate);
    const baseRate = useMolitBase ? currentMolit.base * (1 + (selectedHousing.premium || 0) / 100) : num(manualBaseCost);
    const basementRate = useMolitBase ? currentMolit.basement * (1 + (selectedParking.premium || 0) / 100) : num(manualBasementCost);
    const appliedBaseRate = useMolitBase ? baseRate : (baseRate || practicalBaseRate);
    const appliedBasementRate = useMolitBase ? basementRate : (basementRate || rateByMode(selectedParking, regionRateMode));
    const apartment = num(apartmentArea) * appliedBaseRate;
    const apartmentExpense = num(apartmentArea) * appliedBaseRate * 0.5;
    const officetel = num(officetelArea) * appliedBaseRate * 1.25;
    const retail = num(retailArea) * appliedBaseRate * 1.25;
    const basement = num(basementArea) * appliedBasementRate;
    const greenCost = (apartment + officetel + retail + basement) * (((selectedGreen.min + selectedGreen.max) / 2) / 100);
    const constructionSubtotal = apartment + apartmentExpense + officetel + retail + basement + greenCost;
    const subtotalBeforeIncrease = num(landCost) + constructionSubtotal;
    const increaseCost = subtotalBeforeIncrease * (num(increaseRate) / 100);
    const beforeFinance = subtotalBeforeIncrease + increaseCost;
    const loanAmount = beforeFinance * (num(loanRatio) / 100);
    const financeCost = loanAmount * 0.5 * (num(interestRate) / 100) * (num(periodMonths) / 12);
    const total = beforeFinance + financeCost;
    const totalArea = num(apartmentArea) + num(officetelArea) + num(retailArea) + num(basementArea);
    const pyeongUnit = totalArea > 0 ? total / totalArea : 0;
    const profit = num(salesRevenue) > 0 ? num(salesRevenue) - total : 0;
    const profitRate = num(salesRevenue) > 0 ? (profit / num(salesRevenue)) * 100 : 0;
    const dscr = num(annualDebtService) > 0 ? num(operatingIncome) / num(annualDebtService) : 0;
    const progress = [
      { name: '착공 전', rate: 5 }, { name: '토공·흙막이', rate: 15 }, { name: '골조', rate: 35 },
      { name: '외장·창호', rate: 20 }, { name: '마감·설비', rate: 20 }, { name: '준공·정산', rate: 5 }
    ].map((x) => ({ ...x, amount: constructionSubtotal * (x.rate / 100) }));
    return { practicalBaseRate, appliedBaseRate, appliedBasementRate, apartment, apartmentExpense, officetel, retail, basement, greenCost, constructionSubtotal, subtotalBeforeIncrease, increaseCost, financeCost, loanAmount, total, pyeongUnit, profit, profitRate, dscr, progress };
  }, [annualDebtService, apartmentArea, basementArea, currentMolit.base, currentMolit.basement, greenType, housingType, increaseRate, interestRate, landCost, loanRatio, manualBaseCost, manualBasementCost, officetelArea, operatingIncome, parkingType, periodMonths, region, regionRateMode, retailArea, salesRevenue, selectedGreen, selectedHousing, selectedParking, selectedRegion, useMolitBase]);

  const reset = () => {
    setTab('home'); setFocusStep('area'); setSelectedYear('2026'); setUseMolitBase(true); setRegionRateMode('mid');
    setManualBaseCost(String(molitRates[0].base)); setManualBasementCost(String(molitRates[0].basement));
    setRegion(''); setHousingType(''); setParkingType(''); setGreenType(''); setPfType(''); setLandCost(''); setLandArea('');
    setApartmentArea(''); setOfficetelArea(''); setRetailArea(''); setBasementArea(''); setIncreaseRate('5'); setLoanRatio(''); setInterestRate(''); setPeriodMonths('');
    setSalesRevenue(''); setOperatingIncome(''); setAnnualDebtService('');
  };

  const steps: Array<{ key: StepKey; title: string }> = [
    { key: 'area', title: '1. 면적 및 단가 입력' }, { key: 'unit', title: '2. 국토부 단가 입력' }, { key: 'region', title: '3. 지역선택' },
    { key: 'housing', title: '4. 주거유형 선택' }, { key: 'parking', title: '5. 지하주차장 유형 선택' }, { key: 'green', title: '6. 친환경 제로에너지' },
    { key: 'pf', title: '7. 금융기관 검토 기준 선택 및 PF 수지 입력' }
  ];
  const maxCost = Math.max(calc.apartment, calc.apartmentExpense, calc.officetel, calc.retail, calc.basement, calc.greenCost, calc.financeCost, 1);

  return <div className={dark ? 'appShell dark' : 'appShell'}><main className="phoneFrame">
    <header className="appHeader noPrint"><div><span className="eyebrow">Apartment Cost Calculator</span><h1>공사비 계산기</h1><p>국토부단가 아파트 오피스텔 근린상가</p></div><button className="iconButton" onClick={() => setDark(!dark)} type="button">{dark ? <Sun size={20} /> : <Moon size={20} />}</button></header>
    <section className="contentArea compactTop">
      {tab === 'home' && <><section className="mobileCard"><div className="cardTitle">진행순서 바로가기</div><div className="stepButtons">{steps.map((s) => <button key={s.key} type="button" className={focusStep === s.key ? 'stepButton active' : 'stepButton'} onClick={() => setFocusStep(s.key)}><i className={stepComplete[s.key] ? 'lamp on' : 'lamp'} /><span>{s.title}</span><ChevronRight size={18} /></button>)}</div></section>
      {focusStep === 'area' && <section className="mobileCard"><div className="cardTitle">1. 면적 및 단가 입력</div><Field label="토지대" value={landCost} onChange={setLandCost} comma suffix="천원" /><Field label="토지면적" value={landArea} onChange={setLandArea} comma suffix="평" /><div className="infoBox">토지 평단가: <strong>{fmt(landPyeongPrice)} 천원/평</strong></div><Field label="아파트 평면적" value={apartmentArea} onChange={setApartmentArea} comma suffix="평" /><Field label="오피스텔 평면적" value={officetelArea} onChange={setOfficetelArea} comma suffix="평" /><Field label="근린상가 평면적" value={retailArea} onChange={setRetailArea} comma suffix="평" /><Field label="지하층 평면적" value={basementArea} onChange={setBasementArea} comma suffix="평" /><Field label="물가 상승률" value={increaseRate} onChange={setIncreaseRate} suffix="%" /></section>}
      {focusStep === 'unit' && <section className="mobileCard"><div className="cardTitle">2. 국토부 단가 입력</div><div className="miniTable"><div className="miniHead"><span>연도</span><span>기본형건축비</span><span>지하층건축비</span></div>{molitRates.map((row) => <button key={row.year} type="button" className={selectedYear === row.year ? 'miniRow selected' : 'miniRow'} onClick={() => { setSelectedYear(row.year); if (useMolitBase) { setManualBaseCost(String(row.base)); setManualBasementCost(String(row.basement)); } }}><span>{row.year}</span><span>{fmt(row.base)} 천원/평</span><span>{fmt(row.basement)} 천원/평</span></button>)}</div><div className="toggleRow"><button className={useMolitBase ? 'pill active' : 'pill'} onClick={() => setUseMolitBase(true)} type="button">국토부 단가 적용</button><button className={!useMolitBase ? 'pill active' : 'pill'} onClick={() => setUseMolitBase(false)} type="button">실무단가 적용</button></div>{!useMolitBase && <><Field label="실무 기본형건축비" value={manualBaseCost} onChange={setManualBaseCost} comma suffix="천원/평" /><div className="infoBox">국토부 적용연도 대비 차이: <strong>{diffPercent(num(manualBaseCost), currentMolit.base)}</strong></div><Field label="실무 지하층건축비" value={manualBasementCost} onChange={setManualBasementCost} comma suffix="천원/평" /><div className="infoBox">국토부 적용연도 대비 차이: <strong>{diffPercent(num(manualBasementCost), currentMolit.basement)}</strong></div></>}</section>}
      {focusStep === 'region' && <><section className="mobileCard"><div className="cardTitle">3. 지역선택 적용 기준</div><div className="toggleRow three"><button className={regionRateMode === 'min' ? 'pill active' : 'pill'} onClick={() => setRegionRateMode('min')} type="button">하한 적용</button><button className={regionRateMode === 'mid' ? 'pill active' : 'pill'} onClick={() => setRegionRateMode('mid')} type="button">중간값 적용</button><button className={regionRateMode === 'max' ? 'pill active' : 'pill'} onClick={() => setRegionRateMode('max')} type="button">상한 적용</button></div></section><OptionList title="3. 지역선택" items={regionRates} value={region} onChange={setRegion} /></>}
      {focusStep === 'housing' && <OptionList title="4. 주거유형 선택" items={housingTypes} value={housingType} onChange={setHousingType} />}{focusStep === 'parking' && <OptionList title="5. 지하주차장 유형 선택" items={parkingTypes} value={parkingType} onChange={setParkingType} />}{focusStep === 'green' && <OptionList title="6. 친환경 제로에너지" items={greenOptions} value={greenType} onChange={setGreenType} unit="%" />}
      {focusStep === 'pf' && <><section className="mobileCard"><div className="cardTitle">7. PF 수지 입력</div><Field label="대출비율" value={loanRatio} onChange={setLoanRatio} suffix="%" /><Field label="금리" value={interestRate} onChange={setInterestRate} suffix="%" /><Field label="사업기간" value={periodMonths} onChange={setPeriodMonths} suffix="개월" /><Field label="예상매출액" value={salesRevenue} onChange={setSalesRevenue} comma suffix="천원" /><Field label="연간영업수익" value={operatingIncome} onChange={setOperatingIncome} comma suffix="천원" /><Field label="연간채무상환액" value={annualDebtService} onChange={setAnnualDebtService} comma suffix="천원" /></section><OptionList title="금융기관 검토 기준 선택" items={pfOptions} value={pfType} onChange={setPfType} /></>}
      <section className="mobileCard noPrint"><button className="resetButton" onClick={reset} type="button"><RotateCcw size={18} /> 전체 초기화</button></section></>}
      {tab === 'result' && <><section className="mobileCard printTitle"><div><span className="eyebrowDark">결과 보고서</span><h2>공사비 및 PF 산출 결과</h2></div><button className="printButton noPrint" onClick={() => window.print()} type="button"><Printer size={17} /> PDF 프린트</button></section><section className="mobileCard"><div className="cardTitle">세부 산출내역</div><ResultLine label="적용단가기준" value={useMolitBase ? `${selectedYear}년 국토부 단가` : '실무단가 직접입력'} /><ResultLine label="토지평단가" value={`${fmt(landPyeongPrice)} 천원/평`} /><ResultLine label="최종지상적용단가" value={`${fmt(calc.appliedBaseRate)} 천원/평`} /><ResultLine label="최종지하적용단가" value={`${fmt(calc.appliedBasementRate)} 천원/평`} /><ResultLine label="아파트공사비" value={`${fmt(calc.apartment)} 천원`} /><ResultLine label="오피스텔공사비" value={`${fmt(calc.officetel)} 천원`} /><ResultLine label="근린상가공사비" value={`${fmt(calc.retail)} 천원`} /><ResultLine label="지하층건축비" value={`${fmt(calc.basement)} 천원`} /><ResultLine label="친환경제로에너지가산" value={`${fmt(calc.greenCost)} 천원`} /><ResultLine label="상승률반영전소계" value={`${fmt(calc.subtotalBeforeIncrease)} 천원`} /><ResultLine label="물가상승반영액" value={`${fmt(calc.increaseCost)} 천원`} /><ResultLine label="PF금융비" value={`${fmt(calc.financeCost)} 천원`} /></section><section className="mobileCard"><div className="cardTitle">PF지표요약</div><ResultLine label="총 사업비" value={`${fmt(calc.total)} 천원`} /><ResultLine label="평균 평당 단가" value={`${fmt(calc.pyeongUnit)} 천원/평`} /><ResultLine label="대출금 추정액" value={`${fmt(calc.loanAmount)} 천원`} /><ResultLine label="DSCR" value={`${calc.dscr.toFixed(2)} 배`} /><ResultLine label="예상 손익" value={`${fmt(calc.profit)} 천원`} /><ResultLine label="손익률" value={`${calc.profitRate.toFixed(2)}%`} /></section><section className="mobileCard"><div className="cardTitle">공사비구성그래프</div><BarLine label="아파트공사비" value={calc.apartment} max={maxCost} /><BarLine label="아파트 경비" value={calc.apartmentExpense} max={maxCost} /><BarLine label="오피스텔공사비" value={calc.officetel} max={maxCost} /><BarLine label="근린상가공사비" value={calc.retail} max={maxCost} /><BarLine label="지하층건축비" value={calc.basement} max={maxCost} /><BarLine label="친환경제로에너지" value={calc.greenCost} max={maxCost} /><BarLine label="PF금융비" value={calc.financeCost} max={maxCost} /></section><section className="mobileCard"><div className="cardTitle">공정률기반자금집행</div>{calc.progress.map((row) => <ResultLine key={row.name} label={`${row.name} ${row.rate}%`} value={`${fmt(row.amount)} 천원`} />)}</section></>}
    </section><nav className="bottomNav noPrint"><button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')} type="button"><Home size={19} /><span>홈</span></button><button className={tab === 'result' ? 'active' : ''} onClick={() => setTab('result')} type="button"><Calculator size={19} /><span>결과</span></button></nav>
  </main></div>;
}
