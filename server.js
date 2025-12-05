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

//한번에
app.post("/gksqjsdp", async (req, res) => {
    try {
        const { 액션, 액션데이터 } = req.body;

        if (액션 === "회원가입") {

            const { 아이디, 비번, 서버 } = 액션데이터;

            if (!아이디 || !비번) {
                return res.json({ 성공: false, 오류: "값 부족" });
            }

            // 영문 아이디는 서버에서도 검증
            if (!/^[a-zA-Z]+$/.test(아이디)) {
                return res.json({ 성공: false, 오류: "아이디는 영문만 가능합니다" });
            }

            // 아이디 중복 체크 (jsonb 내부 검색)
            const { data: 유저 } = await supabase
                .from("users")
                .select("id")
                .eq("스탯->>유저아이디", 아이디)
                .maybeSingle();

            if (유저) {
                return res.json({ 성공: false, 오류: "아이디가 이미 존재합니다" });
            }

            // 비밀번호 암호화
            const 해시비번 = await bcrypt.hash(비번, 10);

            // 신규 유저 생성 (UUID는 자동 생성됨)
            const { error: 생성에러 } = await supabase
                .from("users")
                .insert([
                    {
                        스탯: {
                            유저아이디: 아이디,
                            유저닉네임: 아이디,
                            비번: 해시비번,
                            서버: 서버,
                            생성시각: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }), //"2025. 8. 26. 오후 4:37:00",
                            생성요일: new Date().toLocaleDateString("ko-KR", { weekday: "long", timeZone: "Asia/Seoul" }), //"화요일"
                            접속시각시: Math.floor(new Date().getTime() / 3600000), // 478520,
                            접속시각분: Math.floor(new Date().getTime() / 60000), // 478520,
                            접속시각초: Math.floor(new Date().getTime() / 1000), // 478520,
                            접속요일: new Date().toLocaleDateString("ko-KR", { weekday: "long", timeZone: "Asia/Seoul" }), //"화요일"
                            // 여기서 기본 스탯 초기화 가능
                        }
                    }
                ]);

            if (생성에러) {
                return res.json({ 성공: false, 오류: "생성 실패" });
            }

            return res.json({ 성공: true });
        }

        if (액션 === "로그인") {
            const { 아이디, 비번 } = 액션데이터;

            if (!아이디 || !비번) {
                return res.json({ 성공: false, 오류: "값 부족" });
            }

            // 유저 조회
            const { data: 유저 } = await supabase
                .from("users")
                .select("*")
                .eq("스탯->>유저아이디", 아이디)
                .maybeSingle();

            if (!유저) {
                return res.json({ 성공: false, 오류: "존재하지 않는 아이디" });
            }

            const 저장된해시 = 유저.스탯?.비번;

            // 비번 비교
            const 일치 = await bcrypt.compare(비번, 저장된해시);

            if (!일치) {
                return res.json({ 성공: false, 오류: "비밀번호가 올바르지 않습니다" });
            }

            return res.json({ 성공: true, 유저 });
        }

    } catch (e) {
        return res.json({ 성공: false, 오류: "서버 오류" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);

