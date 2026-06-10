import React, { useMemo, useState } from 'react';
import { Building2, Calculator, ChevronRight, Database, Home, Leaf, Moon, ParkingCircle, Printer, RotateCcw, Sun, WalletCards } from 'lucide-react';

type TabKey = 'home' | 'unit' | 'area' | 'pf' | 'result';
type StepKey = 'area' | 'unit' | 'region' | 'housing' | 'parking' | 'green' | 'pf';
type RateRow = { key: string; label: string; min: number; max: number; premium?: number };

const regionRates: RateRow[] = [
  { key: 'seoul', label: '서울', min: 10500, max: 13500 }, { key: 'busan', label: '부산', min: 8500, max: 10500 },
  { key: 'incheon', label: '인천', min: 8800, max: 10800 }, { key: 'daegu', label: '대구', min: 7800, max: 9500 },
  { key: 'daejeon', label: '대전', min: 7800, max: 9300 }, { key: 'gwangju', label: '광주', min: 7500, max: 9000 },
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
  { key: 'none', label: '미적용', min: 0, max: 0 }, { key: 'greenGood', label: '녹색건축 우수', min: 1, max: 2 },
  { key: 'zeb5', label: '제로에너지 5등급', min: 3, max: 5 }, { key: 'zeb4', label: '제로에너지 4등급', min: 5, max: 8 },
  { key: 'zeb3', label: '제로에너지 3등급 이상', min: 8, max: 15 }
];

const pfOptions: RateRow[] = [
  { key: 'local', label: '지방 일반 공동주택', min: 8000, max: 9500 }, { key: 'capital', label: '수도권 일반 공동주택', min: 9500, max: 11000 },
  { key: 'seoulUrban', label: '서울 도심형', min: 11000, max: 14000 }, { key: 'gangnamHigh', label: '강남권 하이엔드', min: 15000, max: 20000 }
];

const fmt = (v: number | string) => Number(String(v || '0').replace(/,/g, '') || 0).toLocaleString('ko-KR', { maximumFractionDigits: 0 });
const num = (v: string) => { const n = Number(String(v || '0').replace(/,/g, '')); return Number.isFinite(n) ? n : 0; };
const raw = (v: string) => String(v || '').replace(/,/g, '');

function Field({ label, value, onChange, comma=false, suffix='' }: { label: string; value: string; onChange: (v: string) => void; comma?: boolean; suffix?: string }) {
  return <label className="field"><span>{label}</span><div className="fieldBox"><input value={comma ? fmt(value) : value} onChange={(e) => onChange(comma ? raw(e.target.value) : e.target.value)} inputMode="decimal" />{suffix && <em>{suffix}</em>}</div></label>;
}

function OptionList({ title, items, value, onChange, unit='천원/평' }: { title: string; items: RateRow[]; value: string; onChange: (v: string) => void; unit?: string }) {
  return <section className="mobileCard"><div className="cardTitle">{title}</div><div className="optionList">{items.map((x) => <button key={x.key} type="button" className={x.key === value ? 'optionItem selected' : 'optionItem'} onClick={() => onChange(x.key)}><span><strong>{x.label}</strong><small>{fmt(x.min)} ~ {fmt(x.max)} {unit}</small></span><ChevronRight size={18}/></button>)}</div></section>;
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return <div className="resultLine"><span>{label}</span><strong>{value}</strong></div>;
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<TabKey>('home');
  const [focusStep, setFocusStep] = useState<StepKey>('area');
  const [molitYear, setMolitYear] = useState('2026');
  const [molitSearchYear, setMolitSearchYear] = useState('2026');
  const [molitBaseCost, setMolitBaseCost] = useState('7326');
  const [molitBasementCost, setMolitBasementCost] = useState('2472');
  const [useMolitBase, setUseMolitBase] = useState(true);
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

  const selectedRegion = regionRates.find(x => x.key === region) || regionRates[0];
  const selectedHousing = housingTypes.find(x => x.key === housingType) || housingTypes[0];
  const selectedParking = parkingTypes.find(x => x.key === parkingType) || parkingTypes[0];
  const selectedGreen = greenOptions.find(x => x.key === greenType) || greenOptions[0];

  const landPyeongPrice = num(landArea) > 0 ? num(landCost) / num(landArea) : 0;

  const stepComplete: Record<StepKey, boolean> = {
    area: num(landCost) > 0 && num(landArea) > 0 && num(apartmentArea) + num(officetelArea) + num(retailArea) + num(basementArea) > 0,
    unit: num(molitBaseCost) > 0 && num(molitBasementCost) > 0,
    region: region !== '',
    housing: housingType !== '',
    parking: parkingType !== '',
    green: greenType !== '',
    pf: pfType !== '' && num(loanRatio) > 0 && num(interestRate) > 0 && num(periodMonths) > 0
  };

  const calc = useMemo(() => {
    const marketBase = Math.max((selectedRegion.min + selectedRegion.max) / 2, (selectedHousing.min + selectedHousing.max) / 2);
    const baseRate = useMolitBase ? num(molitBaseCost) * (1 + (selectedHousing.premium || 0) / 100) : marketBase;
    const basementRate = useMolitBase ? num(molitBasementCost) * (1 + (selectedParking.premium || 0) / 100) : (selectedParking.min + selectedParking.max) / 2;
    const apartment = num(apartmentArea) * baseRate;
    const apartmentExpense = num(apartmentArea) * baseRate * 0.5;
    const officetel = num(officetelArea) * baseRate * 1.25;
    const retail = num(retailArea) * baseRate * 1.25;
    const basement = num(basementArea) * basementRate;
    const greenCost = (apartment + officetel + retail + basement) * (((selectedGreen.min + selectedGreen.max) / 2) / 100);
    const subtotal = num(landCost) + apartment + apartmentExpense + officetel + retail + basement + greenCost;
    const increaseCost = subtotal * (num(increaseRate) / 100);
    const beforeFinance = subtotal + increaseCost;
    const loanAmount = beforeFinance * (num(loanRatio) / 100);
    const financeCost = loanAmount * 0.5 * (num(interestRate) / 100) * (num(periodMonths) / 12);
    const total = beforeFinance + financeCost;
    const totalArea = num(apartmentArea) + num(officetelArea) + num(retailArea) + num(basementArea);
    const pyeongUnit = totalArea > 0 ? total / totalArea : 0;
    const profit = num(salesRevenue) > 0 ? num(salesRevenue) - total : 0;
    const profitRate = num(salesRevenue) > 0 ? (profit / num(salesRevenue)) * 100 : 0;
    return { baseRate, basementRate, apartment, apartmentExpense, officetel, retail, basement, greenCost, increaseCost, financeCost, loanAmount, total, pyeongUnit, profit, profitRate };
  }, [selectedRegion, selectedHousing, selectedParking, selectedGreen, useMolitBase, molitBaseCost, molitBasementCost, apartmentArea, officetelArea, retailArea, basementArea, landCost, increaseRate, loanRatio, interestRate, periodMonths, salesRevenue]);

  const reset = () => {
    setTab('home'); setFocusStep('area'); setMolitYear('2026'); setMolitSearchYear('2026'); setMolitBaseCost('7326'); setMolitBasementCost('2472'); setUseMolitBase(true);
    setRegion(''); setHousingType(''); setParkingType(''); setGreenType(''); setPfType(''); setLandCost(''); setLandArea(''); setApartmentArea(''); setOfficetelArea(''); setRetailArea(''); setBasementArea('');
    setIncreaseRate('5'); setLoanRatio(''); setInterestRate(''); setPeriodMonths(''); setSalesRevenue('');
  };

  const moveToStep = (step: StepKey) => {
    setFocusStep(step);
    if (step === 'area') setTab('area');
    if (step === 'unit') setTab('unit');
    if (step === 'region') setTab('unit');
    if (step === 'housing') setTab('unit');
    if (step === 'parking') setTab('area');
    if (step === 'green') setTab('area');
    if (step === 'pf') setTab('pf');
  };

  const steps: Array<{ key: StepKey; title: string }> = [
    { key: 'area', title: '1. 면적 및 단가 입력' },
    { key: 'unit', title: '2. 국토부 단가 입력' },
    { key: 'region', title: '3. 지역선택' },
    { key: 'housing', title: '4. 주거유형 선택' },
    { key: 'parking', title: '5. 지하주차장 유형 선택' },
    { key: 'green', title: '6. 친환경 제로에너지' },
    { key: 'pf', title: '7. 금융기관 검토 기준 선택 및 PF 수지 입력' }
  ];

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: 'home', label: '홈', icon: <Home size={19}/> }, { key: 'unit', label: '단가', icon: <Database size={19}/> },
    { key: 'area', label: '면적', icon: <Building2 size={19}/> }, { key: 'pf', label: 'PF', icon: <WalletCards size={19}/> },
    { key: 'result', label: '결과', icon: <Calculator size={19}/> }
  ];

  return <div className={dark ? 'appShell dark' : 'appShell'}><main className="phoneFrame">
    <header className="appHeader"><div><span className="eyebrow">Apartment Cost Calculator</span><h1>공사비 계산기</h1><p>국토부단가 아파트 오피스텔 근린상가</p></div><button className="iconButton noPrint" onClick={() => setDark(!dark)} type="button">{dark ? <Sun size={20}/> : <Moon size={20}/>}</button></header>
    <section className="summaryCard"><span>총 사업비 추정액</span><strong>{fmt(calc.total)} 천원</strong><div><em>평당 {fmt(calc.pyeongUnit)} 천원</em><em>토지 평단가 {fmt(landPyeongPrice)} 천원/평</em><em>대출 {fmt(calc.loanAmount)} 천원</em></div></section>
    <section className="contentArea">
      {tab === 'home' && <><section className="mobileCard"><div className="cardTitle">진행순서 바로가기</div><div className="stepButtons">{steps.map(s => <button key={s.key} type="button" className="stepButton" onClick={() => moveToStep(s.key)}><i className={stepComplete[s.key] ? 'lamp on' : 'lamp'} /><span>{s.title}</span><ChevronRight size={18}/></button>)}</div></section><section className="mobileCard"><div className="cardTitle">빠른 결과</div><ResultLine label="토지 평단가" value={`${fmt(landPyeongPrice)} 천원/평`} /><ResultLine label="아파트 직접공사비" value={`${fmt(calc.apartment)} 천원`} /><ResultLine label="오피스텔 공사비" value={`${fmt(calc.officetel)} 천원`} /><ResultLine label="근린상가 공사비" value={`${fmt(calc.retail)} 천원`} /><ResultLine label="PF 금융비" value={`${fmt(calc.financeCost)} 천원`} /></section><section className="mobileCard"><button className="resetButton" onClick={reset} type="button"><RotateCcw size={18}/> 전체 초기화</button></section></>}
      {tab === 'unit' && <>{focusStep === 'unit' && <section className="mobileCard"><div className="cardTitle">2. 국토부 단가 입력</div><Field label="조회연도" value={molitSearchYear} onChange={setMolitSearchYear}/><button className="actionButton" onClick={() => { setMolitYear(molitSearchYear); setUseMolitBase(true); }} type="button">검색</button><Field label="적용연도" value={molitYear} onChange={setMolitYear}/><Field label="기본형건축비" value={molitBaseCost} onChange={setMolitBaseCost} comma suffix="천원/평"/><Field label="지하층건축비" value={molitBasementCost} onChange={setMolitBasementCost} comma suffix="천원/평"/><button className="actionButton green" type="button">저장/적용</button><div className="toggleRow"><button className={useMolitBase ? 'pill active' : 'pill'} onClick={() => setUseMolitBase(true)}>국토부 단가</button><button className={!useMolitBase ? 'pill active' : 'pill'} onClick={() => setUseMolitBase(false)}>실무단가</button></div></section>}{focusStep === 'region' && <OptionList title="3. 지역선택" items={regionRates} value={region} onChange={setRegion}/>} {focusStep === 'housing' && <OptionList title="4. 주거유형 선택" items={housingTypes} value={housingType} onChange={setHousingType}/>}</>}
      {tab === 'area' && <>{focusStep === 'area' && <section className="mobileCard"><div className="cardTitle">1. 면적 및 단가 입력</div><Field label="토지대" value={landCost} onChange={setLandCost} comma suffix="천원"/><Field label="토지면적" value={landArea} onChange={setLandArea} comma suffix="평"/><div className="infoBox">토지 평단가: <strong>{fmt(landPyeongPrice)} 천원/평</strong></div><Field label="아파트 평면적" value={apartmentArea} onChange={setApartmentArea} comma suffix="평"/><Field label="오피스텔 평면적" value={officetelArea} onChange={setOfficetelArea} comma suffix="평"/><Field label="근린상가 평면적" value={retailArea} onChange={setRetailArea} comma suffix="평"/><Field label="지하층 평면적" value={basementArea} onChange={setBasementArea} comma suffix="평"/><Field label="물가 상승률" value={increaseRate} onChange={setIncreaseRate} suffix="%"/></section>}{focusStep === 'parking' && <OptionList title="5. 지하주차장 유형 선택" items={parkingTypes} value={parkingType} onChange={setParkingType}/>} {focusStep === 'green' && <OptionList title="6. 친환경 제로에너지" items={greenOptions} value={greenType} onChange={setGreenType} unit="%"/>}</>}
      {tab === 'pf' && <><section className="mobileCard"><div className="cardTitle">7. PF 수지 입력</div><Field label="대출비율" value={loanRatio} onChange={setLoanRatio} suffix="%"/><Field label="금리" value={interestRate} onChange={setInterestRate} suffix="%"/><Field label="사업기간" value={periodMonths} onChange={setPeriodMonths} suffix="개월"/><Field label="예상매출액" value={salesRevenue} onChange={setSalesRevenue} comma suffix="천원"/></section><OptionList title="금융기관 검토 기준 선택" items={pfOptions} value={pfType} onChange={setPfType}/></>}
      {tab === 'result' && <><section className="mobileCard"><div className="resultHeader"><div className="cardTitle">세부 산출내역</div><button className="printButton noPrint" onClick={() => window.print()} type="button"><Printer size={17}/> PDF 프린트</button></div><ResultLine label="토지 평단가" value={`${fmt(landPyeongPrice)} 천원/평`}/><ResultLine label="최종 지상 적용단가" value={`${fmt(calc.baseRate)} 천원/평`}/><ResultLine label="최종 지하 적용단가" value={`${fmt(calc.basementRate)} 천원/평`}/><ResultLine label="아파트 직접공사비" value={`${fmt(calc.apartment)} 천원`}/><ResultLine label="아파트 경비 50%" value={`${fmt(calc.apartmentExpense)} 천원`}/><ResultLine label="오피스텔 공사비" value={`${fmt(calc.officetel)} 천원`}/><ResultLine label="근린상가 공사비" value={`${fmt(calc.retail)} 천원`}/><ResultLine label="지하층건축비" value={`${fmt(calc.basement)} 천원`}/><ResultLine label="친환경 제로에너지" value={`${fmt(calc.greenCost)} 천원`}/><ResultLine label="물가 상승 반영액" value={`${fmt(calc.increaseCost)} 천원`}/><ResultLine label="PF 금융비" value={`${fmt(calc.financeCost)} 천원`}/></section><section className="mobileCard"><div className="cardTitle">사업성 요약</div><ResultLine label="총 사업비" value={`${fmt(calc.total)} 천원`}/><ResultLine label="평균 평당 단가" value={`${fmt(calc.pyeongUnit)} 천원/평`}/><ResultLine label="예상 손익" value={`${fmt(calc.profit)} 천원`}/><ResultLine label="손익률" value={`${calc.profitRate.toFixed(2)}%`}/></section></>}
    </section>
    <nav className="bottomNav noPrint">{tabs.map(item => <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)} type="button">{item.icon}<span>{item.label}</span></button>)}</nav>
  </main></div>;
}