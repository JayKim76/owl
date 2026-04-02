import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, templateId, templateParams } = body;

    // TODO: 실제 카카오톡 비즈메시지(알림톡) API 연동 로직
    // 예: axios.post('https://api.kakao.com/v2/api/talk/memo/default/send', ...)
    
    // 현재는 테스트/뼈대 환경이므로 Console에 출력하고 성공 응답 반환
    console.log("[Kakao Alimtalk Test] Sending message to:", phoneNumber);
    console.log("[Kakao Alimtalk Test] Template:", templateId);
    console.log("[Kakao Alimtalk Test] Params:", templateParams);

    return NextResponse.json({
      success: true,
      message: "알림톡 발송 테스트가 완료되었습니다.",
      data: {
        status: "TEST_SENT"
      }
    });
  } catch (error) {
    console.error("[Kakao Alimtalk Test] Error:", error);
    return NextResponse.json(
      { success: false, message: "알림톡 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
