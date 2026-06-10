import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calculator,
  ChevronRight,
  Database,
  Home,
  Leaf,
  Moon,
  ParkingCircle,
  RotateCcw,
  Sun,
  WalletCards
} from 'lucide-react';

type RateRow = {
  key: string;
  label: string;
  min: number;
  max: number;
  premium?: number;
};

type MolitRate = {
  year: string;
  base: number;
  basement: number;
  memo: string;
};

type TabKey = 'home' | 'unit' | 'area' | 'pf' | 'result';

const defaultMolitRates: MolitRate[] = [
  { year: '2026', base: 7326, basement: 2472, memo: '국토부 기본형건축비 기준' },
  { year: '2025', base: 7175, basement: 2400, memo: '직접 확인 후 수정 가능' },
  { year: '2024', base: 6900, basement: 2300, memo: '직접 확인 후 수정 가능' },
  { year: '2023', base: 6500, basement: 2200, memo: '직접 확인 후 수정 가능' }
];

const regionRates: RateRow[] = [
  { key: 'seoul', label: '서울', min: 10500, max: 13500 },
  { key: 'busan', label: '부산', min: 8500, max: 10500 },
  { key: 'incheon', label: '인천', min: 8800, max: 10800 },
  { key: 'daegu', label: '대구', min: 7800, max: 9500 },
  { key: 'daejeon', label: '대전', min: 7800, max: 9300 },
  { key: 'gwangju', label: '광주', min: 7500, max: 9000 },
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

const formatNumber = (value: number | string): string => {
  const numberValue = Number(String(value || '0').replace(/,/g, ''));
  if (!Number.isFinite(numberValue)) return '0';
  return numberValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
};

const toNumber = (value: string): number => {
  const numberValue = Number(String(value || '0').replace(/,/g, ''));
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatInput = (value: string): string => {
  if (value === '') return '';
  return formatNumber(value);
};

const unformatInput = (value: string): string => String(value || '').replace(/,/g, '');

function Field({
  label,
  value,
  onChange,
  comma = false,
  suffix
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  comma?: boolean;
  suffix?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="fieldBox">
        <input
          value={comma ? formatInput(value) : value}
          onChange={(event) => onChange(comma ? unformatInput(event.target.value) : event.target.value)}
          inputMode="decimal"
        />
        {suffix ? <em>{suffix}</em> : null}
      </div>
    </label>
  );
}

function OptionList({
  title,
  items,
  value,
  onChange,
  unit = '천원/평'
}: {
  title: string;
  items: RateRow[];
  value: string;
  onChange: (value: string) => void;
  unit?: string;
}) {
  return (
    <section className="mobileCard">
      <div className="cardTitle">{title}</div>
      <div className="optionList">
        {items.map((item) => {
          const selected = item.key === value;
          return (
            <button
              key={item.key}
              className={`optionItem ${selected ? 'selected' : ''}`}
              onClick={() => onChange(item.key)}
              type="button"
            >
              <span>
                <strong>{item.label}</strong>
                <small>
                  {formatNumber(item.min)} ~ {formatNumber(item.max)} {unit}
                </small>
              </span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="resultLine">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<TabKey>('home');

  const [molitRates, setMolitRates] = useState<MolitRate[]>(defaultMolitRates);
  const [molitSearchYear, setMolitSearchYear] = useState('2026');
  const [molitYear, setMolitYear] = useState('2026');
  const [molitBaseCost, setMolitBaseCost] = useState('7326');
  const [molitBasementCost, setMolitBasementCost] = useState('2472');

  const [useMolitBase, setUseMolitBase] = useState(true);
  const [region, setRegion] = useState('seoul');
  const [housingType, setHousingType] = useState('private');
  const [parkingType, setParkingType] = useState('normal');
  const [greenType, setGreenType] = useState('zeb5');
  const [pfType, setPfType] = useState('capital');

  const [landCost, setLandCost] = useState('0');
  const [apartmentArea, setApartmentArea] = useState('1000');
  const [officetelArea, setOfficetelArea] = useState('300');
  const [retailArea, setRetailArea] = useState('200');
  const [basementArea, setBasementArea] = useState('500');
  const [increaseRate, setIncreaseRate] = useState('5');

  const [loanRatio, setLoanRatio] = useState('60');
  const [interestRate, setInterestRate] = useState('7.5');
  const [periodMonths, setPeriodMonths] = useState('24');
  const [salesRevenue, setSalesRevenue] = useState('0');

  const selectedRegion = regionRates.find((item) => item.key === region) || regionRates[0];
  const selectedHousing = housingTypes.find((item) => item.key === housingType) || housingTypes[0];
  const selectedParking = parkingTypes.find((item) => item.key === parkingType) || parkingTypes[0];
  const selectedGreen = greenOptions.find((item) => item.key === greenType) || greenOptions[0];
  const selectedPf = pfOptions.find((item) => item.key === pfType) || pfOptions[0];

  const calculation = useMemo(() => {
    const marketBaseRate = Math.max(
      (selectedRegion.min + selectedRegion.max) / 2,
      (selectedHousing.min + selectedHousing.max) / 2
    );
    const molitBase = toNumber(molitBaseCost);
    const molitBasement = toNumber(molitBasementCost);
    const baseRate = useMolitBase ? molitBase * (1 + (selectedHousing.premium || 0) / 100) : marketBaseRate;
    const basementRate = useMolitBase
      ? molitBasement * (1 + (selectedParking.premium || 0) / 100)
      : (selectedParking.min + selectedParking.max) / 2;
    const apartment = toNumber(apartmentArea) * baseRate;
    const apartmentExpense = toNumber(apartmentArea) * baseRate * 0.5;
    const officetel = toNumber(officetelArea) * baseRate * 1.25;
    const retail = toNumber(retailArea) * baseRate * 1.25;
    const basement = toNumber(basementArea) * basementRate;
    const greenRate = ((selectedGreen.min + selectedGreen.max) / 2) / 100;
    const greenCost = (apartment + officetel + retail + basement) * greenRate;
    const constructionSubtotal = apartment + apartmentExpense + officetel + retail + basement + greenCost;
    const subtotal = toNumber(landCost) + constructionSubtotal;
    const increaseCost = subtotal * (toNumber(increaseRate) / 100);
    const totalBeforeFinance = subtotal + increaseCost;
    const loanAmount = totalBeforeFinance * (toNumber(loanRatio) / 100);
    const financeCost = loanAmount * 0.5 * (toNumber(interestRate) / 100) * (toNumber(periodMonths) / 12);
    const total = totalBeforeFinance + financeCost;
    const totalArea = toNumber(apartmentArea) + toNumber(officetelArea) + toNumber(retailArea) + toNumber(basementArea);
    const pyeongUnit = totalArea > 0 ? total / totalArea : 0;
    const profit = toNumber(salesRevenue) > 0 ? toNumber(salesRevenue) - total : 0;
    const profitRate = toNumber(salesRevenue) > 0 ? profit / toNumber(salesRevenue) * 100 : 0;

    return {
      baseRate,
      basementRate,
      apartment,
      apartmentExpense,
      officetel,
      retail,
      basement,
      greenCost,
      subtotal,
      increaseCost,
      financeCost,
      loanAmount,
      total,
      pyeongUnit,
      profit,
      profitRate
    };
  }, [
    apartmentArea,
    basementArea,
    greenType,
    housingType,
    increaseRate,
    interestRate,
    landCost,
    loanRatio,
    molitBaseCost,
    molitBasementCost,
    officetelArea,
    parkingType,
    periodMonths,
    region,
    retailArea,
    salesRevenue,
    selectedGreen,
    selectedHousing,
    selectedParking,
    selectedRegion,
    useMolitBase
  ]);

  const searchMolitYear = () => {
    const found = molitRates.find((item) => item.year === molitSearchYear);
    if (found) {
      setMolitYear(found.year);
      setMolitBaseCost(String(found.base));
      setMolitBasementCost(String(found.basement));
      setUseMolitBase(true);
    } else {
      setMolitYear(molitSearchYear);
      setMolitBaseCost('');
      setMolitBasementCost('');
    }
  };

  const saveMolitRate = () => {
    const year = molitYear.trim();
    if (!year) return;
    const next: MolitRate = {
      year,
      base: toNumber(molitBaseCost),
      basement: toNumber(molitBasementCost),
      memo: '사용자 입력 단가'
    };
    setMolitRates((prev) => [next, ...prev.filter((item) => item.year !== year)]);
    setUseMolitBase(true);
  };

  const reset = () => {
    setMolitYear('2026');
    setMolitSearchYear('2026');
    setMolitBaseCost('7326');
    setMolitBasementCost('2472');
    setLandCost('0');
    setApartmentArea('1000');
    setOfficetelArea('300');
    setRetailArea('200');
    setBasementArea('500');
    setIncreaseRate('5');
    setLoanRatio('60');
    setInterestRate('7.5');
    setPeriodMonths('24');
    setSalesRevenue('0');
    setTab('home');
  };

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: 'home', label: '홈', icon: <Home size={19} /> },
    { key: 'unit', label: '단가', icon: <Database size={19} /> },
    { key: 'area', label: '면적', icon: <Building2 size={19} /> },
    { key: 'pf', label: 'PF', icon: <WalletCards size={19} /> },
    { key: 'result', label: '결과', icon: <Calculator size={19} /> }
  ];

  return (
    <div className={dark ? 'appShell dark' : 'appShell'}>
      <main className="phoneFrame">
        <header className="appHeader">
          <div>
            <span className="eyebrow">Apartment Cost Calculator</span>
            <h1>공사비 계산기</h1>
            <p>{molitYear}년 국토부 단가 · 오피스텔 25% 가산</p>
          </div>
          <button className="iconButton" onClick={() => setDark(!dark)} type="button">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <section className="summaryCard">
          <span>총 사업비 추정액</span>
          <strong>{formatNumber(calculation.total)} 천원</strong>
          <div>
            <em>평당 {formatNumber(calculation.pyeongUnit)} 천원</em>
            <em>대출 {formatNumber(calculation.loanAmount)} 천원</em>
          </div>
        </section>

        <section className="contentArea">
          {tab === 'home' && (
            <>
              <section className="mobileCard">
                <div className="cardTitle">진행 순서</div>
                <div className="stepList">
                  <span>① 국토부 단가</span>
                  <span>② 지역·유형 선택</span>
                  <span>③ 면적·금액 입력</span>
                  <span>④ PF 결과 확인</span>
                </div>
              </section>
              <section className="mobileCard">
                <div className="cardTitle">빠른 결과</div>
                <ResultLine label="아파트 직접공사비" value={`${formatNumber(calculation.apartment)} 천원`} />
                <ResultLine label="오피스텔 공사비 25% 가산" value={`${formatNumber(calculation.officetel)} 천원`} />
                <ResultLine label="근린상가 공사비 25% 가산" value={`${formatNumber(calculation.retail)} 천원`} />
                <ResultLine label="PF 금융비" value={`${formatNumber(calculation.financeCost)} 천원`} />
              </section>
            </>
          )}

          {tab === 'unit' && (
            <>
              <section className="mobileCard">
                <div className="cardTitle">국토부 단가 입력</div>
                <div className="formGrid">
                  <Field label="조회연도" value={molitSearchYear} onChange={setMolitSearchYear} />
                  <button className="actionButton" onClick={searchMolitYear} type="button">검색</button>
                  <Field label="적용연도" value={molitYear} onChange={setMolitYear} />
                  <Field label="기본형건축비" value={molitBaseCost} onChange={setMolitBaseCost} comma suffix="천원/평" />
                  <Field label="지하층건축비" value={molitBasementCost} onChange={setMolitBasementCost} comma suffix="천원/평" />
                  <button className="actionButton green" onClick={saveMolitRate} type="button">저장/적용</button>
                </div>
                <div className="toggleRow">
                  <button className={useMolitBase ? 'pill active' : 'pill'} onClick={() => setUseMolitBase(true)}>국토부 단가</button>
                  <button className={!useMolitBase ? 'pill active' : 'pill'} onClick={() => setUseMolitBase(false)}>실무단가</button>
                </div>
              </section>
              <OptionList title="지역 선택" items={regionRates} value={region} onChange={setRegion} />
              <OptionList title="주거유형 선택" items={housingTypes} value={housingType} onChange={setHousingType} />
            </>
          )}

          {tab === 'area' && (
            <>
              <section className="mobileCard">
                <div className="cardTitle">면적·금액 입력</div>
                <Field label="토지대" value={landCost} onChange={setLandCost} comma suffix="천원" />
                <Field label="아파트 평면적" value={apartmentArea} onChange={setApartmentArea} comma suffix="평" />
                <Field label="오피스텔 평면적" value={officetelArea} onChange={setOfficetelArea} comma suffix="평" />
                <Field label="근린상가 평면적" value={retailArea} onChange={setRetailArea} comma suffix="평" />
                <Field label="지하층 평면적" value={basementArea} onChange={setBasementArea} comma suffix="평" />
                <Field label="물가 상승률" value={increaseRate} onChange={setIncreaseRate} suffix="%" />
              </section>
              <OptionList title="지하주차장 유형" items={parkingTypes} value={parkingType} onChange={setParkingType} />
              <OptionList title="친환경·제로에너지" items={greenOptions} value={greenType} onChange={setGreenType} unit="%" />
            </>
          )}

          {tab === 'pf' && (
            <>
              <section className="mobileCard">
                <div className="cardTitle">PF 수지 입력</div>
                <Field label="대출비율" value={loanRatio} onChange={setLoanRatio} suffix="%" />
                <Field label="금리" value={interestRate} onChange={setInterestRate} suffix="%" />
                <Field label="사업기간" value={periodMonths} onChange={setPeriodMonths} suffix="개월" />
                <Field label="예상매출액" value={salesRevenue} onChange={setSalesRevenue} comma suffix="천원" />
              </section>
              <OptionList title="금융기관 검토 기준" items={pfOptions} value={pfType} onChange={setPfType} />
              <section className="mobileCard">
                <button className="resetButton" onClick={reset} type="button"><RotateCcw size={18} /> 전체 초기화</button>
              </section>
            </>
          )}

          {tab === 'result' && (
            <>
              <section className="mobileCard">
                <div className="cardTitle">세부 산출내역</div>
                <ResultLine label="최종 지상 적용단가" value={`${formatNumber(calculation.baseRate)} 천원/평`} />
                <ResultLine label="최종 지하 적용단가" value={`${formatNumber(calculation.basementRate)} 천원/평`} />
                <ResultLine label="아파트 직접공사비" value={`${formatNumber(calculation.apartment)} 천원`} />
                <ResultLine label="아파트 경비 50%" value={`${formatNumber(calculation.apartmentExpense)} 천원`} />
                <ResultLine label="오피스텔 25% 가산" value={`${formatNumber(calculation.officetel)} 천원`} />
                <ResultLine label="근린상가 25% 가산" value={`${formatNumber(calculation.retail)} 천원`} />
                <ResultLine label="지하층건축비" value={`${formatNumber(calculation.basement)} 천원`} />
                <ResultLine label="친환경·제로에너지" value={`${formatNumber(calculation.greenCost)} 천원`} />
                <ResultLine label="물가 상승 반영액" value={`${formatNumber(calculation.increaseCost)} 천원`} />
                <ResultLine label="PF 금융비" value={`${formatNumber(calculation.financeCost)} 천원`} />
              </section>
              <section className="mobileCard">
                <div className="cardTitle">사업성 요약</div>
                <ResultLine label="총 사업비" value={`${formatNumber(calculation.total)} 천원`} />
                <ResultLine label="평균 평당 단가" value={`${formatNumber(calculation.pyeongUnit)} 천원/평`} />
                <ResultLine label="예상 손익" value={`${formatNumber(calculation.profit)} 천원`} />
                <ResultLine label="손익률" value={`${calculation.profitRate.toFixed(2)}%`} />
              </section>
            </>
          )}
        </section>

        <nav className="bottomNav">
          {tabs.map((item) => (
            <button
              key={item.key}
              className={tab === item.key ? 'active' : ''}
              onClick={() => setTab(item.key)}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
