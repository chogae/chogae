import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);


import bcrypt from "bcrypt";

const 월 = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }); //"2025. 8. 26."
const 일 = new Date().toLocaleDateString("ko-KR", { weekday: "long", timeZone: "Asia/Seoul" }); //"화요일"
const 시 = new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" }); //"오후 4:37:00"

//가글
app.post("/rkrmf", async (req, res) => {
    try {
        const { 액션, 액션데이터 } = req.body;

        if (액션 === "가글회원가입") {

            const { 아이디, 비번, 서버 } = 액션데이터;

            if (!아이디 || !비번) {
                return res.json({ 성공: false, 오류: "값 부족" });
            }

            if (!/^[ㄱ-ㅎㅏ-ㅣ가-힣]+$/.test(아이디)) {
                return res.json({ 성공: false, 오류: "아이디는 한글만 가능합니다" });
            }

            const { data: 가글 } = await supabase
                .from("가글")
                .select("id")
                .eq("스탯->>아이디", 아이디)
                .maybeSingle();

            if (가글) {
                return res.json({ 성공: false, 오류: "아이디가 이미 존재합니다" });
            }

            // 비밀번호 암호화
            const 해시비번 = await bcrypt.hash(비번, 10);

            const ip =
                req.headers["x-forwarded-for"]?.split(",")[0] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.ip;

            // 신규 유저 생성 (UUID는 자동 생성됨)
            const { error: 생성에러 } = await supabase
                .from("가글")
                .insert([
                    {
                        //신규유저
                        스탯: {
                            아이디: 아이디,
                            닉네임: 아이디,
                            비번: 해시비번,
                            서버: 서버,
                            생성년: 월,
                            생성요일: 일,
                            생성시각: 시,
                            접속시: Math.floor(new Date().getTime() / 3600000), // 478520,
                            접속분: Math.floor(new Date().getTime() / 60000), // 478520,
                            접속초: Math.floor(new Date().getTime() / 1000), // 478520,
                            접속년: 월,
                            접속요일: 일,
                            접속시각: 시,
                            접속ip: ip,
                            유물: {},
                        }
                    }
                ]);

            if (생성에러) {
                return res.json({ 성공: false, 오류: "생성 실패" });
            }


            return res.json({ 성공: true });
        } else if (액션 === "가글로그인") {
            const { 아이디, 비번 } = 액션데이터;

            if (!아이디 || !비번) {
                return res.json({ 성공: false, 오류: "값 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("스탯->>아이디", 아이디)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "아이디가 존재하지 않습니다" });
            }

            const 저장된해시 = 가글.스탯?.비번;

            // 비번 비교
            const 일치 = await bcrypt.compare(비번, 저장된해시);

            if (!일치) {
                return res.json({ 성공: false, 오류: "비밀번호가 틀렸습니다" });
            }

            let 변경필요 = false;

            //기존유저
            if (가글.스탯.전투력 === undefined) {
                가글.스탯.전투력 = 0;
                변경필요 = true;
            }

            if (변경필요) {
                const { error: 업데이트에러 } = await supabase
                    .from("가글")
                    .update({ 스탯: 가글.스탯 })
                    .eq("id", 가글.id);

                if (업데이트에러) {
                    console.log("스탯 업데이트 오류:", 업데이트에러);
                }
            }

            const { data: 가글서브 } = await supabase
                .from("가글서브")
                .select("*")
                .eq("id", 가글.id)
                .maybeSingle();

            // 데이터가 없으면 생성
            if (!가글서브) {
                const { error: 서브에러 } = await supabase
                    .from("가글서브")
                    .insert([
                        {
                            id: 가글.id,
                            스탯: {
                                우편함: {
                                    "1": {
                                        이름: "햄버거",
                                        수량: 1,
                                        시간: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
                                        메모: "신규유저 보상"
                                    },
                                    "2": {
                                        이름: "샐러드",
                                        수량: 1,
                                        시간: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
                                        메모: "신규유저 보상"
                                    }
                                }
                            }
                        }
                    ]);

                if (서브에러) {
                    console.log("서브에러:", 서브에러);
                    return res.json({ 성공: false, 오류: "서브DB 생성 실패" });
                }

            }

            // ⭐ 원래 데이터가 존재할 때는 그대로 반환
            return res.json({
                성공: true,
                가글,
            });
        } else if (액션 === "계정삭제") {
            const { 유저id } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 메인 계정 삭제
            const { error: 삭제에러 } = await supabase
                .from("가글")
                .delete()
                .eq("id", 유저id);

            if (삭제에러) {
                return res.json({ 성공: false, 오류: "삭제 실패" });
            }

            // 서브 데이터 삭제
            const { error: 서브삭제에러 } = await supabase
                .from("가글서브")
                .delete()
                .eq("id", 유저id);

            if (서브삭제에러) {
                return res.json({ 성공: false, 오류: "서브 삭제 실패" });
            }

            return res.json({ 성공: true });

        } else if (액션 === "") {
            const { 유저id } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }


        } else {
            return res.json({ 성공: false, 오류: "올바른 요청이 아닙니다" });

        }





    } catch (error) {
        console.log(error);

    } finally {

    }

});


//삼국맨
app.post("/tkarnraos", async (req, res) => {
    try {

    } catch (error) {
        console.log(error);

    } finally {

    }

});



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);

