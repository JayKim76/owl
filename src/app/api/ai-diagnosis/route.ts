import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, x, y } = body;

    // x와 y의 기본값 설정 (중앙 클릭 가정)
    const clickX = typeof x === 'number' ? x : 50;
    const clickY = typeof y === 'number' ? y : 50;

    // AI 딥러닝 비전 분석 시뮬레이션을 위한 지연 적용 (2.5초)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // 사진이 누수 관련 사진인지 판단하는 비전 검증 검사 시뮬레이션
    // 실서비스에서는 컴퓨터 비전 모델을 거치지만, 여기선 모사로 구현합니다.
    // 1) 샘플용 SVG 누수 사진(SAMPLE_LEAK_SVG)은 통과시킵니다.
    // 2) 일반 업로드 파일의 경우, 시뮬레이션을 위해 base64 문자열의 특정 성질이나
    //    데모를 위해 누수 키워드나 메타 정보, 혹은 임의의 텍스트가 아닌 경우 필터링합니다.
    //    여기서는 텍스트 데이터 내에 누수 힌트가 들어있거나 파일이 너무 작거나 단순한 경우 누수가 아니라고 판별합니다.
    const isSvgSample = image && image.startsWith('data:image/svg+xml');
    
    // 사용자가 직접 촬영/업로드한 사진의 누수 여부를 가려내기 위한 Mock 검증 규칙
    // 실제 카메라로 찍은 유효한 이미지(길이가 충분히 긴 base64 이미지 데이터)이거나 특정 키워드가 포함되었는지 확인
    // 여기서는 base64 데이터의 길이나 특정 형식이 유효한지 검증하고, 만약 누수와 무관한 단순 더미 텍스트/아무 파일 등이면 오류 처리합니다.
    // 또한 테스트 편의를 위해 'data:image/'로 시작하는 일반적인 이미지 유형에 대해서는 기본적으로 판독하되,
    // 데이터의 해상도가 매우 낮거나 비정상적인 데이터 구조인 경우 비누수 판정을 시뮬레이션합니다.
    const isValidImage = image && (image.startsWith('data:image/jpeg') || image.startsWith('data:image/png') || image.startsWith('data:image/webp') || isSvgSample);
    
    // 시뮬레이션: 만약 사용자가 'test-non-leak' 같은 임의의 무관한 사진 데이터를 전송했거나 이미지 형식이 아닌 경우 누수 사진이 아님을 판정
    const isLeakPhoto = isValidImage && !image.includes('test-non-leak') && image.length > 500;

    if (!isLeakPhoto) {
      return NextResponse.json({
        success: false,
        error: '올바른 누수 의심 사진이 아닙니다. 벽면, 천장, 바닥 등 누수 흔적(젖음, 물방울, 변색 등)이 있는 사진을 선명하게 촬영하여 업로드해주세요.'
      }, { status: 400 });
    }

    let result;

    if (clickY < 35) {
      // 1. 천장 누수 진단 (상단 클릭)
      result = {
        success: true,
        type: 'ceiling',
        typeName: '천장 슬라브 및 욕실 하부 방수층 누수',
        probability: 95,
        locationName: `천장 부위 (상대좌표 X: ${Math.round(clickX)}%, Y: ${Math.round(clickY)}%)`,
        cause: '위층 욕실의 배수트랩 주변 방수층 노후화 또는 오배수관 크랙으로 인한 미세 누수로 판단됩니다.',
        description: '해당 지점은 물방울 맺힘 현상과 함께 미세한 벽지 탈색 및 곰팡이 포자가 보이고 있습니다. 이는 지속적인 누수가 진행 중임을 뜻하며, 위층 배수 배관 노후화 혹은 방수층 파열 가능성이 매우 높습니다.',
        checklist: [
          '위층 욕실 수도 계량기 밸브를 차단하여 유량 및 압력 변화 테스트',
          '욕실 바닥 유가(육가) 하부 및 변기 배수관 주위 방수 불량 상태 점검',
          '배관 연결 조인트 크랙 보강 및 우레탄 인젝션 방수 공사 진행'
        ],
        estimatedCost: '750,000원 ~ 1,100,000원',
        estMin: 750000,
        estMax: 1100000,
        queryParams: {
          leakLocation: 'ceiling',
          urgency: 'today',
          elevator: 'true',
          parking: 'true',
          heatingTarget: '아파트 천장',
          detectChecks: JSON.stringify(['waterBill', 'downstairsCheck'])
        }
      };
    } else if (clickY > 65) {
      // 2. 바닥 및 배관 누수 진단 (하단 클릭)
      result = {
        success: true,
        type: 'floor',
        typeName: '바닥 난방/온수 배관 노후화 누수',
        probability: 91,
        locationName: `바닥 부위 (상대좌표 X: ${Math.round(clickX)}%, Y: ${Math.round(clickY)}%)`,
        cause: '보일러 온수 배관(XL 혹은 PB)의 수축/팽창 반복에 따른 경화 크랙 및 이음새 누수로 판단됩니다.',
        description: '바닥면을 따라 습기가 넓게 퍼져 있으며 걸레받이 부근에 젖음 현상이 포착되었습니다. 온수 배관은 높은 열과 압력을 반복적으로 견디기 때문에 파열 위험이 큽니다. 신속한 정밀 배관 탐지가 시급합니다.',
        checklist: [
          '보일러실 직수 공급 밸브 일시 차단 후 난방 필터 누수 에러 코드 점검',
          '컴프레셔 청음식 장비 및 가스 탐지기를 이용해 누수점 정밀 추적',
          '의심 영역 바닥 파쇄 후 파열 배관(구간) 절단 및 정품 피팅 교체'
        ],
        estimatedCost: '900,000원 ~ 1,400,000원',
        estMin: 900000,
        estMax: 1400000,
        queryParams: {
          leakLocation: 'floor',
          urgency: 'today',
          boilerBrand: '경동나비엔',
          boilerPipeSize: '15A',
          boilerError: '02',
          detectChecks: JSON.stringify(['detectFee', 'boilerCheck'])
        }
      };
    } else {
      // 3. 벽면 균열 누수 진단 (중앙 클릭)
      result = {
        success: true,
        type: 'wall',
        typeName: '외벽 크랙 및 샷시 코킹 불량 누수',
        probability: 86,
        locationName: `벽면 부위 (상대좌표 X: ${Math.round(clickX)}%, Y: ${Math.round(clickY)}%)`,
        cause: '건물 외벽의 옹벽 균열 및 창틀 외부 코킹(실리콘) 방수층 노후화로 인한 빗물 유입으로 판단됩니다.',
        description: '창틀 코너 부분에서 물자국과 습기가 번지는 양상입니다. 계절 변화에 따른 실리콘 틈새 벌어짐이나 건물 자체 침하 크랙으로 인해 외부 수분이 유입되고 있으며, 비가 올 때 특히 심해집니다.',
        checklist: [
          '외부 실리콘 코킹 균열 및 들뜸 상태 점검',
          '벽체 실내 단열재 수분 측정 및 콘크리트 균열 직접 점검',
          '외부 노후 실리콘 제거 후 우레탄 실란트 코킹 보강 및 아크릴 인젝션 주입'
        ],
        estimatedCost: '600,000원 ~ 950,000원',
        estMin: 600000,
        estMax: 950000,
        queryParams: {
          leakLocation: 'wall',
          urgency: 'scheduled',
          parking: 'true',
          detectChecks: JSON.stringify(['waterBill'])
        }
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI diagnosis error:', error);
    return NextResponse.json({ success: false, error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
