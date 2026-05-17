import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, templateId, templateParams } = body;

    // Simulate network latency (500ms - 1200ms)
    const delay = Math.floor(Math.random() * 700) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Log detailed message for debugging/demo purposes
    console.log("==========================================");
    console.log("[Kakao Alimtalk API Mock]");
    console.log(`- To: ${phoneNumber}`);
    console.log(`- Template: ${templateId}`);
    console.log("- Content:");
    console.log(`  [부엉이누수탐지랩] 견적 결과 안내`);
    console.log(`  위치: ${templateParams.leakLocation}`);
    console.log(`  항목: ${templateParams.works}`);
    console.log(`  견적: ${templateParams.estimate}`);
    console.log(`- Status: SUCCESS (Simulated)`);
    console.log("==========================================");

    const messageId = `msg_${Math.random().toString(36).substring(2, 11)}`;

    return NextResponse.json({
      success: true,
      message: "알림톡이 성공적으로 발송되었습니다.",
      data: {
        messageId,
        status: "SENT",
        provider: "SIMULATED_KAKAO_BIZ",
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[Kakao Alimtalk Error]:", error);
    return NextResponse.json(
      { success: false, message: "알림톡 발송 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
