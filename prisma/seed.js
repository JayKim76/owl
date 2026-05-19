const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records (in reverse dependency order)
  console.log('🧹 Clearing existing data...');
  await prisma.task.deleteMany({});
  await prisma.estimate.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.customer.deleteMany({});
  console.log('✨ Existing data cleared.');

  // 2. Create Partners
  console.log('🤝 Creating partners...');
  const partners = [];
  const partnerData = [
    {
      companyName: '서울누수 마스터',
      contactName: '김철수',
      phone: '010-1111-2222',
      specialty: '종합 누수탐지 / 미세누수 정밀 탐지'
    },
    {
      companyName: '중앙 배관설비',
      contactName: '이영희',
      phone: '010-3333-4444',
      specialty: '상하수도 배관 신설 및 교체 / 보일러 배관 공사'
    },
    {
      companyName: '바른 방수공사',
      contactName: '박영식',
      phone: '010-5555-6666',
      specialty: '욕실 방수 / 외벽 크랙 보수 / 옥상 우레탄 방수'
    },
    {
      companyName: '에이스 종합설비',
      contactName: '정성진',
      phone: '010-7777-8888',
      specialty: '하수구 고압세척 / 막힘 통풍 / 보일러 점검 및 교체'
    }
  ];

  for (const data of partnerData) {
    const partner = await prisma.partner.create({ data });
    partners.push(partner);
  }
  console.log(`✅ Created ${partners.length} partners.`);

  // 3. Create Customers
  console.log('👤 Creating customers...');
  const customers = [];
  const customerData = [
    {
      name: '홍길동',
      phone: '010-1234-5678',
      address: '서울특별시 강남구 역삼동 123-45 역삼푸르지오 102동 304호'
    },
    {
      name: '이영수',
      phone: '010-2345-6789',
      address: '서울특별시 서초구 서초동 567-89 서초자이 105동 202호'
    },
    {
      name: '김미영',
      phone: '010-3456-7890',
      address: '경기도 성남시 분당구 삼평동 456 봇들마을 3단지 301동 1205호'
    },
    {
      name: '박준형',
      phone: '010-4567-8901',
      address: '인천광역시 연수구 송도동 789 송도더샵 204동 502호'
    },
    {
      name: '최지민',
      phone: '010-5678-9012',
      address: '서울특별시 송파구 잠실동 321 잠실엘스 112동 804호'
    }
  ];

  for (const data of customerData) {
    const customer = await prisma.customer.create({ data });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers.`);

  // 4. Create Estimates and Tasks
  console.log('📝 Creating estimates and tasks...');

  const now = new Date();
  
  // Estimate 1 for Customer 1 (assigned to Partner 1)
  const est1 = await prisma.estimate.create({
    data: {
      customerId: customers[0].id,
      customerPhone: customers[0].phone,
      parking: true,
      elevator: true,
      heatingTarget: '개별난방',
      floorLevel: '3층',
      leakLocation: '거실 바닥',
      leakAmount: '미세 누수 (서서히 젖어듬)',
      urgency: '보통',
      boilerBrand: '경동나비엔',
      boilerError: '없음',
      boilerPipeSize: '15A',
      waterBill: '평소보다 약 2만원 더 나옴',
      managerCheck: true,
      downstairsCheck: true,
      damageAreas: ['거실'],
      customDamageArea: '',
      timing: '약 일주일 전부터 아래층 거실 천장이 서서히 젖어들기 시작함.',
      detectChecks: ['배관 압력 검사', '가스 탐지', '청음 탐지'],
      customDetectItem: '',
      detectionDetails: '거실 보일러 온수 배관 엘보 연결 부위 미세 누수 의의. 가스 탐지 후 청음식으로 최종 위치 특정 예정.',
      detectionFee: 250000,
      requiredWorks: ['배관 부분 교체', '미장 마감'],
      estimatedMinPrice: 400000,
      estimatedMaxPrice: 600000,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  });

  const task1Sched = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
  await prisma.task.create({
    data: {
      estimateId: est1.id,
      customerId: customers[0].id,
      partnerId: partners[0].id,
      title: '홍길동 고객님 거실 배관 교체 및 미장',
      status: '진행중',
      scheduledDate: task1Sched,
      description: '보일러 하부 온수 배관 가스 탐지 완료 후 거실 굴착 및 배관 엘보 교체, 시멘트 미장 마감 작업.'
    }
  });

  // Estimate 2 for Customer 2 (assigned to Partner 3)
  const est2 = await prisma.estimate.create({
    data: {
      customerId: customers[1].id,
      customerPhone: customers[1].phone,
      parking: false,
      elevator: false,
      heatingTarget: '지역난방',
      floorLevel: '2층',
      leakLocation: '천장 누수',
      leakAmount: '지속적으로 물이 떨어짐 (양동이로 받아야 함)',
      urgency: '긴급',
      boilerBrand: '없음',
      boilerError: '없음',
      boilerPipeSize: '없음',
      waterBill: '변화 없음',
      managerCheck: false,
      downstairsCheck: true,
      damageAreas: ['안방', '화장실'],
      customDamageArea: '',
      timing: '3일 전부터 안방 천장 전등 주변으로 물방울이 10초에 한 방울씩 낙하.',
      detectChecks: ['욕실 방수 담수 테스트', '하수관 내시경 검사'],
      customDetectItem: '',
      detectionDetails: '위층 욕실 바닥 방수층 수명 다함. 타일 틈새로 유입된 물이 안방 천장으로 유출되는 방수 결함 유력.',
      detectionFee: 300000,
      requiredWorks: ['화장실 바닥 전체 철거', '3차 방수 공사', '타일 재시공 및 돔천장 교체'],
      estimatedMinPrice: 1500000,
      estimatedMaxPrice: 2200000,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  });

  const task2Sched = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days from now
  await prisma.task.create({
    data: {
      estimateId: est2.id,
      customerId: customers[1].id,
      partnerId: partners[2].id,
      title: '이영수 고객님 화장실 바닥 전체 철거 방수 공사',
      status: '대기중',
      scheduledDate: task2Sched,
      description: '욕실 바닥 철거 후 철저한 3차 액체방수 처리. 2일 양생 후 타일 시공 및 위생기 재설치.'
    }
  });

  // Estimate 3 for Customer 3 (assigned to Partner 4)
  const est3 = await prisma.estimate.create({
    data: {
      customerId: customers[2].id,
      customerPhone: customers[2].phone,
      parking: true,
      elevator: true,
      heatingTarget: '개별난방',
      floorLevel: '12층',
      leakLocation: '베란다 보일러 밑',
      leakAmount: '보일러 운전 시 물방울이 맺혀서 흐름',
      urgency: '보통',
      boilerBrand: '귀뚜라미',
      boilerError: '95번 (물부족 에러) 빈번히 발생',
      boilerPipeSize: '20A',
      waterBill: '큰 차이 없음',
      managerCheck: true,
      downstairsCheck: false,
      damageAreas: ['베란다'],
      customDamageArea: '',
      timing: '약 2주 전부터 보일러 하단 커버 사이로 물이 조금씩 스며나와 바닥 타일을 적심.',
      detectChecks: ['보일러 내부 검사', '열화상 카메라 진단'],
      customDetectItem: '',
      detectionDetails: '보일러 난방배관 환수 분배기 연결부 밸브 노후로 인한 미세 크랙 발생. 분배기 및 연결 어댑터 교체 필요.',
      detectionFee: 150000,
      requiredWorks: ['보일러 분배기 교체', '연결 주름관 신설'],
      estimatedMinPrice: 250000,
      estimatedMaxPrice: 400000,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    }
  });

  const task3Sched = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (Completed)
  await prisma.task.create({
    data: {
      estimateId: est3.id,
      customerId: customers[2].id,
      partnerId: partners[3].id,
      title: '김미영 고객님 귀뚜라미 보일러 배관 및 분배기 교체',
      status: '완료',
      scheduledDate: task3Sched,
      description: '노후된 베란다 보일러 2구 분배기 철거 완료. 신형 스테인리스 분배기로 교체 후 물부족 에러 해결 확인.'
    }
  });

  // Estimate 4 for Customer 4 (assigned to Partner 2)
  const est4 = await prisma.estimate.create({
    data: {
      customerId: customers[3].id,
      customerPhone: customers[3].phone,
      parking: true,
      elevator: true,
      heatingTarget: '개별난방',
      floorLevel: '5층',
      leakLocation: '주방 싱크대 아래 하수구',
      leakAmount: '싱크대 물을 모아서 버릴 때 싱크대 밑 바닥으로 물이 역류함',
      urgency: '긴급',
      boilerBrand: '린나이',
      boilerError: '없음',
      boilerPipeSize: '15A',
      waterBill: '차이 없음',
      managerCheck: false,
      downstairsCheck: false,
      damageAreas: ['주방'],
      customDamageArea: '',
      timing: '어제 오후 식사 후 설거지 시 갑자기 싱크대 바닥 쪽에서 물이 역류해 나와 바닥 마루가 젖음.',
      detectChecks: ['하수구 내시경 촬영', '배관 석션 검사'],
      customDetectItem: '',
      detectionDetails: '싱크대 배수관 내부 기름때 슬러지 고착 및 음식물 찌꺼기 적체로 통수 면적 90% 이상 차단됨.',
      detectionFee: 200000,
      requiredWorks: ['싱크대 하수관 스케일링', '고압 석션 작업', '배출 호스 교체'],
      estimatedMinPrice: 300000,
      estimatedMaxPrice: 450000,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  });

  const task4Sched = new Date(now.getTime()); // Scheduled for today!
  await prisma.task.create({
    data: {
      estimateId: est4.id,
      customerId: customers[3].id,
      partnerId: partners[1].id,
      title: '박준형 고객님 주방 싱크대 하수구 슬러지 고압 세척',
      status: '진행중',
      scheduledDate: task4Sched,
      description: '배수관 내시경 삽입 후 플렉스 샤프트 기계로 배관 내부 유지방 완전 파쇄 및 초강력 석션 클리닝 진행 중.'
    }
  });

  // Estimate 5 for Customer 5 (assigned to Partner 3)
  const est5 = await prisma.estimate.create({
    data: {
      customerId: customers[4].id,
      customerPhone: customers[4].phone,
      parking: true,
      elevator: true,
      heatingTarget: '지역난방',
      floorLevel: '8층',
      leakLocation: '발코니 창가 외벽',
      leakAmount: '평소엔 멀쩡하다가 비가 많이 오는 날만 젖어듬',
      urgency: '여유있음',
      boilerBrand: '없음',
      boilerError: '없음',
      boilerPipeSize: '없음',
      waterBill: '차이 없음',
      managerCheck: true,
      downstairsCheck: false,
      damageAreas: ['베란다 창틀', '창가 주변 벽'],
      customDamageArea: '',
      timing: '최근 봄비 내릴 때 발코니 확장형 이중창 하단 창틀 실리콘 틈새로 빗물이 흘러 들어옴.',
      detectChecks: ['창틀 외부 실리콘 상태 육안 검사', '외벽 미세 균열 확인'],
      customDetectItem: '',
      detectionDetails: '샷시 외부 코킹 실리콘이 노화되어 찢어지고 들뜸. 외벽 콘크리트 미세 헤어크랙도 일부 관찰됨.',
      detectionFee: 100000,
      requiredWorks: ['외부 로프 코킹 작업', '실리콘 전면 제거 및 우레탄 실란트 재시공', '크랙 실링'],
      estimatedMinPrice: 400000,
      estimatedMaxPrice: 650000,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    }
  });

  const task5Sched = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days from now
  await prisma.task.create({
    data: {
      estimateId: est5.id,
      customerId: customers[4].id,
      partnerId: partners[2].id,
      title: '최지민 고객님 안방 발코니 샷시 외부 코킹 및 균열 보수',
      status: '대기중',
      scheduledDate: task5Sched,
      description: '외부 로프 삭공 동반. 기존 노후된 코킹제 기계식 긁어내기로 철저히 제거 후, 프라이머 도포 및 친환경 우레탄 실란트 코킹.'
    }
  });

  console.log('✅ Created estimates and tasks.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
