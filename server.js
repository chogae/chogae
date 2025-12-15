import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { 등급 } from "./공용정의.js";
import { 일반몬스터확률표 } from "./공용정의.js";
import { 히든몬스터확률표 } from "./공용정의.js";
import { 일반몬스터 } from "./공용정의.js";
import { 히든몬스터 } from "./공용정의.js";
import { 유물모음 } from "./공용정의.js";
import { 색상맵 } from "./공용정의.js";

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

const 년월 = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }); //"2025. 8. 26."
const 요일 = new Date().toLocaleDateString("ko-KR", { weekday: "long", timeZone: "Asia/Seoul" }); //"화요일"
const 시각 = new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" }); //"오후 4:37:00"
const 시 = Math.floor(new Date().getTime() / 3600000); // 478520,
const 분 = Math.floor(new Date().getTime() / 60000); // 478520,
const 초 = Math.floor(new Date().getTime() / 1000); // 478520,

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

            const 닉네임 =
                (아이디 === "채이" || 아이디 === "ㅇ")
                    ? "나주인장아니다"
                    : 아이디;

            const 주인장 = 닉네임 === "나주인장아니다" ? 1 : 0;
            // 신규 유저 생성 (UUID는 자동 생성됨)
            const { data: 생성된가글, error: 생성에러 } = await supabase
                .from("가글")
                .insert([
                    {
                        //신규유저
                        스탯: {
                            아이디: 아이디,
                            닉네임: 닉네임,
                            비번: 해시비번,
                            서버: 서버,
                            생성년: 년월,
                            생성요일: 요일,
                            생성시각: 시각,
                            생성시: 시, // 478520,
                            생성분: 분, // 478520,
                            생성초: 초, // 478520,
                            접속년: 년월,
                            접속요일: 요일,
                            접속시각: 시각,
                            접속시: 시, // 478520,
                            접속분: 분, // 478520,
                            접속초: 초, // 478520,
                            접속ip: ip,
                            주인장: 주인장,
                        }
                    }
                ])
                .select("id")
                .single();

            if (생성에러) {
                return res.json({ 성공: false, 오류: "생성 실패" });
            }

            const { error: 서브에러 } = await supabase
                .from("가글서브")
                .insert([
                    {
                        id: 생성된가글.id,
                        스탯: {
                            아이디: 아이디,
                            닉네임: 닉네임,
                            점검: 0,
                            차단: 0,
                            우편함: {
                                "1": {
                                    이름: "햄버거",
                                    수량: 1,
                                    시각: 년월 + " " + 요일 + " " + 시각,
                                    메모: "신규유저 보상"
                                },
                                "2": {
                                    이름: "샐러드",
                                    수량: 1,
                                    시각: 년월 + " " + 요일 + " " + 시각,
                                    메모: "신규유저 보상"
                                }
                            }
                        }
                    }
                ]);

            if (서브에러) {
                return res.json({ 성공: false, 오류: "서브DB 생성 실패" });
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

            const 방치시간 = 시 - 가글.스탯.접속시;
            if (방치시간) {
                가글.스탯.현재스태미너 = Math.min(
                    가글.스탯.현재스태미너 + 방치시간 * 120, 가글.스탯.최대스태미너
                );

                const { error } = await supabase
                    .from("가글로그")
                    .insert({
                        스탯: `${가글.스탯.아이디}(${가글.스탯.닉네임}) 방치 ${방치시간}시간`
                    });

                if (error) {
                    console.log("로그기록 INSERT 에러:", error);
                }

            }
            가글.스탯.접속년 = 년월;
            가글.스탯.접속요일 = 요일;
            가글.스탯.접속시각 = 시각;
            가글.스탯.접속시 = 시;
            가글.스탯.접속분 = 분;
            가글.스탯.접속초 = 초;

            if (가글.스탯.화면번호 === undefined) 가글.스탯.화면번호 = 0;

            if (가글.스탯.전투력 === undefined) 가글.스탯.전투력 = 0;

            if (가글.스탯.히든 === undefined) 가글.스탯.히든 = 0;

            if (가글.스탯.총스태미너 === undefined) 가글.스탯.총스태미너 = 2000;
            if (가글.스탯.현재스태미너 === undefined) 가글.스탯.현재스태미너 = 2000;
            if (가글.스탯.최대스태미너 === undefined) 가글.스탯.최대스태미너 = 2000;

            if (가글.스탯.현재층 === undefined) 가글.스탯.현재층 = 1;
            if (가글.스탯.최고층 === undefined) 가글.스탯.최고층 = 1;

            if (가글.스탯.레벨 === undefined) 가글.스탯.레벨 = 1;
            if (가글.스탯.총경험치 === undefined) 가글.스탯.총경험치 = 0;
            if (가글.스탯.현재경험치 === undefined) 가글.스탯.현재경험치 = 0;
            if (가글.스탯.획득경험치 === undefined) 가글.스탯.획득경험치 = 0;

            if (가글.스탯.총골드 === undefined) 가글.스탯.총골드 = 0;
            if (가글.스탯.현재골드 === undefined) 가글.스탯.현재골드 = 0;
            if (가글.스탯.획득골드 === undefined) 가글.스탯.획득골드 = 0;

            if (가글.스탯.총숙련도 === undefined) 가글.스탯.총숙련도 = 0;
            if (가글.스탯.현재숙련도 === undefined) 가글.스탯.현재숙련도 = 0;
            if (가글.스탯.획득숙련도 === undefined) 가글.스탯.획득숙련도 = 0;

            if (가글.스탯.최종공격력 === undefined) 가글.스탯.최종공격력 = 0;
            if (가글.스탯.최종방어력 === undefined) 가글.스탯.최종방어력 = 0;
            if (가글.스탯.최종속력 === undefined) 가글.스탯.최종속력 = 0;
            if (가글.스탯.최종체력 === undefined) 가글.스탯.최종체력 = 0;
            if (가글.스탯.현재체력 === undefined) 가글.스탯.현재체력 = 0;

            if (가글.스탯.투자순서 === undefined) 가글.스탯.투자순서 = 0;

            if (가글.스탯.계정 === undefined) 가글.스탯.계정 = {
                공격력: 60, 방어력: 20, 체력: 1000, 속력: 100,
                공격력보너스: 0, 방어력보너스: 0, 속력보너스: 0, 체력보너스: 0
            };

            if (가글.스탯.무기 === undefined) 가글.스탯.무기 = {
                이름: "", 등급: 1,
                공격력: 0, 방어력: 0, 속력: 0, 체력: 0,
                공격력보너스: 0, 방어력보너스: 0, 속력보너스: 0, 체력보너스: 0
            };

            if (가글.스탯.방어구 === undefined) 가글.스탯.방어구 = {
                이름: "", 등급: 1,
                공격력: 0, 방어력: 0, 속력: 0, 체력: 0,
                공격력보너스: 0, 방어력보너스: 0, 속력보너스: 0, 체력보너스: 0
            };

            if (가글.스탯.장신구 === undefined) 가글.스탯.장신구 = {
                이름: "", 등급: 1,
                공격력: 0, 방어력: 0, 속력: 0, 체력: 0,
                공격력보너스: 0, 방어력보너스: 0, 속력보너스: 0, 체력보너스: 0
            };

            if (가글.스탯.날개 === undefined) 가글.스탯.날개 = {
                이름: "", 등급: 1,
                공격력: 0, 방어력: 0, 속력: 0, 체력: 0,
                공격력보너스: 0, 방어력보너스: 0, 속력보너스: 0, 체력보너스: 0
            };

            if (가글.스탯.동료 === undefined) 가글.스탯.동료 = {
                공격력: 0, 방어력: 0, 속력: 0, 체력: 0,
                공격력보너스: 0, 방어력보너스: 0, 속력보너스: 0, 체력보너스: 0
            };

            if (가글.스탯.일반몬스터 === undefined) 가글.스탯.일반몬스터 = {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
                11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0,
                21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0,
                31: 0, 32: 0, 33: 0, 34: 0, 35: 0, 36: 0, 37: 0, 38: 0, 39: 0, 40: 0,
                41: 0, 42: 0, 43: 0, 44: 0, 45: 0, 46: 0, 47: 0, 48: 0, 49: 0, 50: 0,
                51: 0, 52: 0, 53: 0, 54: 0, 55: 0, 56: 0, 57: 0, 58: 0, 59: 0, 60: 0,
                61: 0, 62: 0, 63: 0, 64: 0, 65: 0, 66: 0, 67: 0, 68: 0, 69: 0, 70: 0,
                71: 0, 72: 0
            };

            if (가글.스탯.히든몬스터 === undefined) 가글.스탯.히든몬스터 = {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
            };

            if (가글.스탯.유물 === undefined) 가글.스탯.유물 = {
                1: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                2: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                3: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                4: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                5: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                6: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                7: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                8: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                9: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
            };

            if (가글.스탯.스킬 === undefined) 가글.스탯.스킬 = {
                1: { 온: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                2: { 온: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
            };

            if (가글.스탯.주인장) {
                가글.스탯.현재경험치 += 1000000000000;
                가글.스탯.현재골드 += 1000000000000;
                가글.스탯.현재숙련도 += 1000000000000;
            }

            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 가글.id);

            if (업데이트에러) {
                console.log("스탯 업데이트 오류:", 업데이트에러);
            }

            const { data: 가글서브 } = await supabase
                .from("가글서브")
                .select("*")
                .eq("id", 가글.id)
                .maybeSingle();

            if (!가글서브) {
                return res.json({ 성공: false, 오류: "서브데이터가 존재하지 않습니다" });
            }

            return res.json({
                성공: true,
                가글,
                가글서브,
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

        } else if (액션 === "닉넴변경") {
            const { 유저id, 닉넴 } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재골드 < 1000) {
                return res.json({ 성공: false, 오류: "골드가 부족합니다" });
            }

            가글.스탯.현재골드 -= 1000;
            가글.스탯.닉네임 = 닉넴;

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });

        } else if (액션 === "가글전투") {
            const { 유저id, 히든, 현재층 } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재스태미너 < 1) {
                return res.json({ 성공: false, 오류: "스태미너가 부족합니다" });
            }

            const 몬스터 = 몬스터생성(히든, 현재층);
            const 전투결과 = 전투시뮬레이션(가글, 몬스터);
            let 드랍유물 = 0;

            if (히든) {
                가글.스탯.히든몬스터[몬스터.스탯.번호]++;
            } else if (!히든) {
                가글.스탯.일반몬스터[몬스터.스탯.번호]++;
            }

            가글.스탯.현재층 = 현재층;

            if (전투결과.승패) {
                가글.스탯.총경험치 += 몬스터.스탯.번호 * 현재층 * (몬스터.스탯.번호 === 11 ? 200 : 1);
                가글.스탯.현재경험치 += 몬스터.스탯.번호 * 현재층 * (몬스터.스탯.번호 === 11 ? 200 : 1);
                가글.스탯.획득경험치 = 몬스터.스탯.번호 * 현재층 * (몬스터.스탯.번호 === 11 ? 200 : 1);

                가글.스탯.총골드 += 몬스터.스탯.번호 * 현재층 * (몬스터.스탯.번호 === 33 ? 200 : 1);
                가글.스탯.현재골드 += 몬스터.스탯.번호 * 현재층 * (몬스터.스탯.번호 === 33 ? 200 : 1);
                가글.스탯.획득골드 = 몬스터.스탯.번호 * 현재층 * (몬스터.스탯.번호 === 33 ? 200 : 1);

                가글.스탯.총숙련도 += 현재층 * (몬스터.스탯.번호 === 66 ? 200 : 1);
                가글.스탯.현재숙련도 += 현재층 * (몬스터.스탯.번호 === 66 ? 200 : 1);
                가글.스탯.획득숙련도 = 현재층 * (몬스터.스탯.번호 === 66 ? 200 : 1);

                if (가글.스탯.최고층 < 가글.스탯.현재층) {
                    가글.스탯.최고층 = 현재층;
                }

                if (히든) {
                    드랍유물 = Math.floor(Math.random() * 9) + 1; // 1 ~ 9
                    가글.스탯.유물[몬스터.스탯.번호][드랍유물]++;

                    if (드랍유물 > 5) {
                        const { error } = await supabase
                            .from("가글일어난일")
                            .insert({
                                스탯: `${가글.스탯.닉네임}(이)가 [${등급[몬스터.스탯.번호].이름}]유물 ${유물모음[몬스터.스탯.번호][드랍유물].이름} 드랍!`
                            });

                        if (error) {
                            console.log("로그기록 INSERT 에러:", error);
                        }


                    }
                }
            }
            가글.스탯.현재스태미너--;
            가글.스탯.히든 = 랜덤뽑기(히든뽑기);

            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글, 몬스터, 전투결과, 드랍유물 });
        } else if (액션 === "시작화면변경") {
            const { 유저id, 화면번호 } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재골드 < 1000) {
                return res.json({ 성공: false, 오류: "골드가 부족합니다" });
            }

            가글.스탯.현재골드 -= 1000;

            가글.스탯.화면번호 = 화면번호;

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "주인장스태회복") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            가글.스탯.현재스태미너 = Math.min(가글.스탯.현재스태미너 + 300, 가글.스탯.최대스태미너);;

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "주인장숙련도회복") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            가글.스탯.현재숙련도 += 100000000000;

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "무기리롤") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재골드 < 1000 * (5 ** (가글.스탯.무기.등급 - 1))) {
                return res.json({ 성공: false, 오류: `리롤비용은 ${(1000 * (5 ** (가글.스탯.무기.등급 - 1)))}Gold입니다` });
            }

            가글.스탯.현재골드 -= 1000 * (5 ** (가글.스탯.무기.등급 - 1));

            가글.스탯.무기.공격력 = Math.floor(
                Math.random() * (((가글.스탯.무기.등급 + 0.5) * 60) - ((가글.스탯.무기.등급 - 0.5) * 60) + 1) + ((가글.스탯.무기.등급 - 0.5) * 60)
            );

            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            const 무기리롤백분율 = Math.floor((가글.스탯.무기.공격력 - ((가글.스탯.무기.등급 - 0.5) * 60)) / (((가글.스탯.무기.등급 + 0.5) * 60) - ((가글.스탯.무기.등급 - 0.5) * 60)) * 100);
            if (무기리롤백분율 >= 95 || 무기리롤백분율 <= 5) {
                const { error } = await supabase
                    .from("가글일어난일")
                    .insert({
                        스탯: `${가글.스탯.닉네임}(이)가 [${등급[가글.스탯.무기.등급].이름}]무기 공격력 리롤(${무기리롤백분율}%)`
                    });

                if (error) {
                    console.log("로그기록 INSERT 에러:", error);
                }
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "무기승급") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재숙련도 < 1000 * (2 ** 가글.스탯.투자순서)) {
                return res.json({ 성공: false, 오류: "숙련도 부족" });
            }

            if (가글.스탯.무기.등급 < 9) {
                가글.스탯.무기.등급++;

            } else {
                return res.json({ 성공: false, 오류: "최종등급입니다" });

            }

            가글.스탯.현재숙련도 -= 1000 * (2 ** 가글.스탯.투자순서);
            가글.스탯.투자순서++;
            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "방어구리롤") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재골드 < 1000 * (5 ** (가글.스탯.방어구.등급 - 1))) {
                return res.json({ 성공: false, 오류: `리롤비용은 ${(1000 * (5 ** (가글.스탯.방어구.등급 - 1)))}Gold입니다` });
            }

            가글.스탯.현재골드 -= 1000 * (5 ** (가글.스탯.방어구.등급 - 1));

            가글.스탯.방어구.방어력 = Math.floor(
                Math.random() * (((가글.스탯.방어구.등급 + 0.5) * 20) - ((가글.스탯.방어구.등급 - 0.5) * 20) + 1) + ((가글.스탯.방어구.등급 - 0.5) * 20)
            );

            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            const 방어구리롤백분율 = Math.floor((가글.스탯.방어구.방어력 - ((가글.스탯.방어구.등급 - 0.5) * 20)) / (((가글.스탯.방어구.등급 + 0.5) * 20) - ((가글.스탯.방어구.등급 - 0.5) * 20)) * 100);
            if (방어구리롤백분율 >= 95 || 방어구리롤백분율 <= 5) {
                const { error } = await supabase
                    .from("가글일어난일")
                    .insert({
                        스탯: `${가글.스탯.닉네임}(이)가 [${등급[가글.스탯.방어구.등급].이름}]방어구 방어력 리롤(${방어구리롤백분율}%)`
                    });

                if (error) {
                    console.log("로그기록 INSERT 에러:", error);
                }
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "방어구승급") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재숙련도 < 1000 * (2 ** 가글.스탯.투자순서)) {
                return res.json({ 성공: false, 오류: "숙련도 부족" });
            }

            if (가글.스탯.방어구.등급 < 9) {
                가글.스탯.방어구.등급++;

            } else {
                return res.json({ 성공: false, 오류: "최종등급입니다" });

            }

            가글.스탯.현재숙련도 -= 1000 * (2 ** 가글.스탯.투자순서);
            가글.스탯.투자순서++;
            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "장신구리롤") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재골드 < 1000 * (5 ** (가글.스탯.장신구.등급 - 1))) {
                return res.json({ 성공: false, 오류: `리롤비용은 ${(1000 * (5 ** (가글.스탯.장신구.등급 - 1)))}Gold입니다` });
            }

            가글.스탯.현재골드 -= 1000 * (5 ** (가글.스탯.장신구.등급 - 1));

            가글.스탯.장신구.체력 = Math.floor(
                Math.random() * (((가글.스탯.장신구.등급 + 0.5) * 100) - ((가글.스탯.장신구.등급 - 0.5) * 100) + 1) + ((가글.스탯.장신구.등급 - 0.5) * 100)
            );

            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            const 장신구리롤백분율 = Math.floor((가글.스탯.장신구.체력 - ((가글.스탯.장신구.등급 - 0.5) * 100)) / (((가글.스탯.장신구.등급 + 0.5) * 100) - ((가글.스탯.장신구.등급 - 0.5) * 100)) * 100);
            if (장신구리롤백분율 >= 95 || 장신구리롤백분율 <= 5) {
                const { error } = await supabase
                    .from("가글일어난일")
                    .insert({
                        스탯: `${가글.스탯.닉네임}(이)가 [${등급[가글.스탯.장신구.등급].이름}]장신구 체력 리롤(${장신구리롤백분율}%)`
                    });

                if (error) {
                    console.log("로그기록 INSERT 에러:", error);
                }
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "장신구승급") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재숙련도 < 1000 * (2 ** 가글.스탯.투자순서)) {
                return res.json({ 성공: false, 오류: "숙련도 부족" });
            }

            if (가글.스탯.장신구.등급 < 9) {
                가글.스탯.장신구.등급++;

            } else {
                return res.json({ 성공: false, 오류: "최종등급입니다" });

            }

            가글.스탯.현재숙련도 -= 1000 * (2 ** 가글.스탯.투자순서);
            가글.스탯.투자순서++;
            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "날개리롤") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재골드 < 1000 * (5 ** (가글.스탯.날개.등급 - 1))) {
                return res.json({ 성공: false, 오류: `리롤비용은 ${(1000 * (5 ** (가글.스탯.날개.등급 - 1)))}Gold입니다` });
            }

            가글.스탯.현재골드 -= 1000 * (5 ** (가글.스탯.날개.등급 - 1));

            가글.스탯.날개.속력 = Math.floor(
                Math.random() * (((가글.스탯.날개.등급 + 0.5) * 10) - ((가글.스탯.날개.등급 - 0.5) * 10) + 1) + ((가글.스탯.날개.등급 - 0.5) * 10)
            );

            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            const 날개리롤백분율 = Math.floor((가글.스탯.날개.속력 - ((가글.스탯.날개.등급 - 0.5) * 10)) / (((가글.스탯.날개.등급 + 0.5) * 10) - ((가글.스탯.날개.등급 - 0.5) * 10)) * 100);
            if (날개리롤백분율 >= 95 || 날개리롤백분율 <= 5) {
                const { error } = await supabase
                    .from("가글일어난일")
                    .insert({
                        스탯: `${가글.스탯.닉네임}(이)가 [${등급[가글.스탯.날개.등급].이름}]날개 속력 리롤(${날개리롤백분율}%)`
                    });

                if (error) {
                    console.log("로그기록 INSERT 에러:", error);
                }
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "날개승급") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (가글.스탯.현재숙련도 < 1000 * (2 ** 가글.스탯.투자순서)) {
                return res.json({ 성공: false, 오류: "숙련도 부족" });
            }

            if (가글.스탯.날개.등급 < 9) {
                가글.스탯.날개.등급++;

            } else {
                return res.json({ 성공: false, 오류: "최종등급입니다" });

            }

            가글.스탯.현재숙련도 -= 1000 * (2 ** 가글.스탯.투자순서);
            가글.스탯.투자순서++;
            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
        } else if (액션 === "가글일어난일") {
            const { data: 가글일어난일 } = await supabase
                .from("가글일어난일")
                .select("*")

            if (!가글일어난일) {
                return res.json({ 성공: false, 오류: "실패" });
            }



            res.json({ 성공: true, 가글일어난일 });
        } else if (액션 === "가글전당") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            const { data: 가글전당 } = await supabase
                .from("가글")
                .select("*")
                .eq("스탯->>최고층", 가글.스탯.최고층)

            if (!가글전당) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            res.json({ 성공: true, 가글전당 });
        } else if (액션 === "점검때리기") {
            const { 유저id, } = 액션데이터;

            const { data: 서브전체유저, error } = await supabase
                .from("가글서브")
                .select("*")
                .neq("스탯->>닉네임", "나주인장아니다");

            if (error) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (서브전체유저 && 서브전체유저.length > 0) {
                for (let i = 0; i < 서브전체유저.length; i++) {
                    서브전체유저[i].스탯.점검 = 1;

                    const { error } = await supabase
                        .from("가글서브")
                        .update({ 스탯: 서브전체유저[i].스탯 })
                        .eq("id", 서브전체유저[i].id);

                    if (error) {
                        return res.json({ 성공: false, 오류: "실패" });
                    }

                }
            }

            res.json({ 성공: true, });
        } else if (액션 === "점검해제") {
            const { 유저id, } = 액션데이터;

            const { data: 서브전체유저, error } = await supabase
                .from("가글서브")
                .select("*");

            if (error) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            if (서브전체유저 && 서브전체유저.length > 0) {
                for (let i = 0; i < 서브전체유저.length; i++) {
                    서브전체유저[i].스탯.점검 = 0;

                    const { error } = await supabase
                        .from("가글서브")
                        .update({ 스탯: 서브전체유저[i].스탯 })
                        .eq("id", 서브전체유저[i].id);

                    if (error) {
                        return res.json({ 성공: false, 오류: "실패" });
                    }

                }
            }

            res.json({ 성공: true, });
        } else if (액션 === "일어난일리셋") {
            const { error } = await supabase
                .from("가글일어난일")
                .delete()
                .neq("id", 0);

            if (error) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            res.json({ 성공: true, });
        } else if (액션 === "") {
            const { 유저id, } = 액션데이터;

            if (!유저id) {
                return res.json({ 성공: false, 오류: "유저 id 부족" });
            }

            // 유저 조회
            const { data: 가글 } = await supabase
                .from("가글")
                .select("*")
                .eq("id", 유저id)
                .maybeSingle();

            if (!가글) {
                return res.json({ 성공: false, 오류: "실패" });
            }

            가글.스탯.닉네임 = 닉넴;

            가글.스탯 = 유저스탯계산(가글.스탯);

            const { error: 업데이트에러 } = await supabase
                .from("가글")
                .update({ 스탯: 가글.스탯 })
                .eq("id", 유저id);

            if (업데이트에러) {
                console.log("에러 : ", 업데이트에러);
                return res.json({ 성공: false, 오류: 업데이트에러 });
            }

            res.json({ 성공: true, 가글 });
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

const 히든뽑기 = {
    0: 10,
    1: 1,
};

// const 히든몬스터확률표 = {
//     1: 1,
//     2: 1,
//     3: 1,
//     4: 1,
//     5: 1,
//     6: 1,
//     7: 1,
//     8: 1,
//     9: 1,
// };

//정의


function 랜덤뽑기(확률표) {
    let 합 = 0;
    for (const k in 확률표) 합 += 확률표[k];

    let r = Math.random() * 합;
    for (const k in 확률표) {
        r -= 확률표[k];
        if (r <= 0) return Number(k);
    }
}

function 유저스탯계산(스탯) {
    while (스탯.현재경험치 >= 스탯.레벨 * (스탯.레벨 * 0.8) * 1000) {
        스탯.현재경험치 -= 스탯.레벨 * (스탯.레벨 * 0.8) * 1000;
        스탯.레벨++;
    }
    스탯.계정.공격력 = 60 + (스탯.레벨 - 1) * 6;
    스탯.계정.방어력 = 20 + (스탯.레벨 - 1) * 2;
    스탯.계정.체력 = 1000 + (스탯.레벨 - 1) * 100;
    스탯.계정.속력 = 10 + Math.floor((스탯.레벨 - 1) * 0.1);

    스탯.최종공격력 = Math.floor(
        (스탯.계정.공격력 + 스탯.무기.공격력 + 스탯.동료.공격력)
        * (1 + 0.01 * 스탯.계정.공격력보너스)
        * (1 + 0.01 * 스탯.무기.공격력보너스)
        * (1 + 0.01 * 스탯.장신구.공격력보너스)
        * (1 + 0.01 * 스탯.동료.공격력보너스)
    );

    스탯.최종방어력 = Math.floor(
        (스탯.계정.방어력 + 스탯.방어구.방어력 + 스탯.동료.방어력)
        * (1 + 0.01 * 스탯.계정.방어력보너스)
        * (1 + 0.01 * 스탯.방어구.방어력보너스)
        * (1 + 0.01 * 스탯.장신구.방어력보너스)
        * (1 + 0.01 * 스탯.동료.방어력보너스)
    );

    스탯.최종속력 = Math.floor(
        (스탯.계정.속력 + 스탯.날개.속력)
        * (1 + 0.01 * 스탯.계정.속력보너스)
        * (1 + 0.01 * 스탯.장신구.속력보너스)
        * (1 + 0.01 * 스탯.동료.속력보너스)
    );

    스탯.최종체력 = Math.floor(
        (스탯.계정.체력 + 스탯.장신구.체력 + 스탯.동료.체력)
        * (1 + 0.01 * 스탯.계정.체력보너스)
        * (1 + 0.01 * 스탯.장신구.체력보너스)
        * (1 + 0.01 * 스탯.동료.체력보너스)
    );

    스탯.현재체력 = 스탯.현재체력 === 0 ? 스탯.최종체력 : 스탯.현재체력;

    스탯.전투력 = Math.floor(
        (스탯.최종공격력 * 16) + (스탯.최종방어력 * 50) + (스탯.최종체력) + (스탯.최종속력 * 100)
    );

    return 스탯;
}

function 몬스터생성(히든, 현재층) {
    const 번호 = 히든 ? 랜덤뽑기(히든몬스터확률표) : 랜덤뽑기(일반몬스터확률표);

    const 배율 = (히든 ? 1 + 0.1 * 번호 : 1) * (10 ** (현재층 - 1));

    const 랜덤배율 = 0.8 + Math.random() * 0.3;

    const 최종공격력 = Math.floor(20 * 배율 * 랜덤배율);
    const 최종방어력 = Math.floor(6 * 배율 * 랜덤배율);
    const 최종속력 = Math.floor(3 * 배율 * 랜덤배율);
    const 최종체력 = Math.floor(333 * 배율 * 랜덤배율);
    const 현재체력 = Math.floor(333 * 배율 * 랜덤배율);
    const 전투력 = Math.floor(
        (최종공격력 * 16) + (최종방어력 * 50) + (최종체력) + (최종속력 * 100)
    );

    const 스킬 = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    };

    return {
        스탯: {
            히든,
            번호,
            최종공격력,
            최종방어력,
            최종속력,
            최종체력,
            현재체력,
            스킬,
            전투력,
        }
    }

}

function 전투시뮬레이션(나, 상대, 악마성 = 1) {
    const 선턴 = 나.스탯.최종속력 >= 상대.스탯.최종속력 ? 1 : 0; // 1=나, 0=상대
    let 진행턴 = 0;
    const 전투로그 = {};
    let 나남은체력 = 악마성 ? 나.스탯.현재체력 : 나.스탯.최종체력;
    let 상대남은체력 = 악마성 ? 상대.스탯.현재체력 : 상대.스탯.최종체력;

    while (나남은체력 > 0 && 상대남은체력 > 0) {
        진행턴++;
        전투로그[진행턴] = [];

        if (선턴 === 1) {
            // 나 공격
            상대남은체력 -= 나.스탯.최종공격력;
            전투로그[진행턴].push({
                주체: 1,
                스킬: [0],
                피해: 나.스탯.최종공격력,
                나남은체력: Math.max(나남은체력, 0),
                상대남은체력: Math.max(상대남은체력, 0),
            });
            if (상대남은체력 <= 0 || 나남은체력 <= 0) {
                상대남은체력 = Math.max(상대남은체력, 0);
                나남은체력 = Math.max(나남은체력, 0);
                break;
            }

            // 상대 공격
            나남은체력 -= 상대.스탯.최종공격력;
            전투로그[진행턴].push({
                주체: 0,
                스킬: [0],
                피해: 상대.스탯.최종공격력,
                나남은체력: Math.max(나남은체력, 0),
                상대남은체력: Math.max(상대남은체력, 0),
            });
            if (상대남은체력 <= 0 || 나남은체력 <= 0) {
                상대남은체력 = Math.max(상대남은체력, 0);
                나남은체력 = Math.max(나남은체력, 0);
                break;
            }

        } else {
            // 상대 공격
            나남은체력 -= 상대.스탯.최종공격력;
            전투로그[진행턴].push({
                주체: 0,
                스킬: [0],
                피해: 상대.스탯.최종공격력,
                나남은체력: Math.max(나남은체력, 0),
                상대남은체력: Math.max(상대남은체력, 0),
            });
            if (상대남은체력 <= 0 || 나남은체력 <= 0) {
                상대남은체력 = Math.max(상대남은체력, 0);
                나남은체력 = Math.max(나남은체력, 0);
                break;
            }

            // 나 공격
            상대남은체력 -= 나.스탯.최종공격력;
            전투로그[진행턴].push({
                주체: 1,
                스킬: [0],
                피해: 나.스탯.최종공격력,
                나남은체력: Math.max(나남은체력, 0),
                상대남은체력: Math.max(상대남은체력, 0),
            });
            if (상대남은체력 <= 0 || 나남은체력 <= 0) {
                상대남은체력 = Math.max(상대남은체력, 0);
                나남은체력 = Math.max(나남은체력, 0);
                break;
            }
        }
    }

    const 승패 = 나남은체력 > 0 ? 1 : 0;
    나.스탯.현재체력 = 나남은체력;

    return {
        승패,
        진행턴,
        전투로그
    };
}
