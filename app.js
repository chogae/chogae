// @ts-nocheck

/*

해야할일

Ctrl + Shift + P
Developer: Inspect Editor Tokens and Scopes

git add . && git commit -m "배포" && git push origin main

v0.0.1

nodemon server.js

npm run dev

dev = development(개발)

*/

const 색상맵 = {
    연흰: "#FFFFFF",
    중흰: "#D4D4D4",  // 요청 반영
    진흰: "#BFBFBF",
    // 초록 (Green)
    연초: "#B5E8B0",
    중초: "#4EC9B0",
    진초: "#2F8F7A",
    // 파랑 (Blue)
    연파: "#9CDCFE",  // (요청 기반)
    중파: "#4FC1FF",  // (요청 기반)
    진파: "#569CD6",  // (요청 기반)
    // 남색 (Navy)
    연남: "#A6B4FF",
    중남: "#6673D1",
    진남: "#3A3F87",
    // 보라 (Purple)
    연보: "#D6AFFF",
    중보: "#C586C0",
    진보: "#8A3FA0",
    // 주황 (Orange)
    연주: "#FFD1A6",
    중주: "#FF8F3F",
    진주: "#C45A14",
    // 빨강 (Red)
    연빨: "#FFB3B3",
    중빨: "#FF6B6B",
    진빨: "#C53030",
    // 노랑 (Yellow)
    연노: "#FFF5A5",
    중노: "#FFD700",
    진노: "#D4B000",

    // 금 (Gold)
    연금: "#FFEAB3",
    중금: "#FFD700",
    진금: "#B8860B",

    // 은 (Silver)
    연은: "#EDEDED",
    중은: "#C0C0C0",
    진은: "#8A8A8A",

    // 동 (Bronze)
    연동: "#EAC7A6",
    중동: "#CD7F32",
    진동: "#8B5A2B",

};

//속성모음
const 스타일맵 = {
    양쪽정렬: {
        justifyContent: "space-between",
        width: "100%"
    },
    왼쪽정렬: {
        justifyContent: "flex-start",
        width: "100%",
        textAlign: "left",

    },
    세로정렬: {
        flexDirection: "column"
    },
    가로꽉: {
        width: "100%"
    },
    사백: {
        width: "400px"
    },
    삼육공: {
        width: "360px"
    },
    고정: {
        position: "fixed"
    },
    화면꽉: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
    },
    부모꽉: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
    },
    화면중앙: {
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "300px",
    },
    테두리: {
        border: "1px solid #D4D4D4",
        borderRadius: "8px"
    },
    밑줄: {
        borderBottom: "1px solid #D4D4D4",
        borderRadius: "0px"
    },
    외부여백: {
        margin: "3px 6px",
    },
    내부여백: {
        padding: "3px 6px",
    },
    여백: {
        margin: "3px 6px",
        padding: "3px 6px",

    },
    글자작게: {
        fontSize: "12px"
    },
    글자보통: {
        fontSize: "14px"
    },
    글자크게: {
        fontSize: "16px",
        fontWeight: "bold"
    },
    숨기기: {
        display: "none"
    },
    보이기: {
        display: "flex"
    },
    버튼: {
        addClass: "버튼"
    },
};

//document.body
//객체생성함수
function 객체생성(추가, 이름, ...옵션들) {
    const 대상 = document.createElement("div");
    대상.id = 이름;

    대상.style.display = "flex";
    대상.style.justifyContent = "center";
    대상.style.alignItems = "center";
    대상.style.boxSizing = "border-box";
    대상.style.borderRadius = "8px";
    대상.style.backgroundColor = "#1F1F1F";   // 기본 배경 유지

    for (const 옵션 of 옵션들) {
        const 스타일세트 = 스타일맵[옵션];
        if (!스타일세트) continue;

        // addClass 처리
        if (스타일세트.addClass) {
            대상.classList.add(스타일세트.addClass);

            // ⭐ 버튼일 때는 inline 배경 제거 → hover 정상작동
            if (옵션 === "버튼") {
                대상.style.backgroundColor = "";
            }
        }

        // addClass 제외하고 스타일 적용
        for (const key in 스타일세트) {
            if (key === "addClass") continue;
            대상.style[key] = 스타일세트[key];
        }
    }

    추가.append(대상);
    return 대상;
}

//인풋객체생성함수
function 인풋객체생성(추가, 이름, ...옵션들) {
    const 대상 = document.createElement("input");
    대상.id = 이름;

    대상.style.display = "flex";
    대상.style.justifyContent = "center";
    대상.style.alignItems = "center";
    대상.style.boxSizing = "border-box";
    대상.style.borderRadius = "8px";
    // 대상.style.backgroundColor = "#1F1F1F";   // 기본 배경 유지

    대상.autocomplete = "off";
    대상.style.textAlign = "center";

    for (const 옵션 of 옵션들) {
        const 스타일세트 = 스타일맵[옵션];
        if (!스타일세트) continue;

        // addClass 처리
        if (스타일세트.addClass) {
            대상.classList.add(스타일세트.addClass);

            // ⭐ 버튼일 때는 inline 배경 제거 → hover 정상작동
            if (옵션 === "버튼") {
                대상.style.backgroundColor = "";
            }
        }

        // addClass 제외하고 스타일 적용
        for (const key in 스타일세트) {
            if (key === "addClass") continue;
            대상.style[key] = 스타일세트[key];
        }
    }

    추가.append(대상);
    return 대상;
}

객체생성(document.body, "상단바", "고정", "가로꽉", "밑줄",);
상단바.style.top = "0";
상단바.style.left = "0";
상단바.style.height = "51px";

객체생성(상단바, "상단바박스", "양쪽정렬", "사백", "", "");

객체생성(상단바박스, "게임이름", "외부여백", "", "");
게임이름.innerHTML = `초보개발자가 만든 게임들입니다`;

객체생성(상단바박스, "가글메뉴들", "", "", "숨기기");
객체생성(가글메뉴들, "가글전투", "", "여백", "버튼");
가글전투.innerHTML = `전투`;
객체생성(가글메뉴들, "가글성장", "", "여백", "버튼");
가글성장.innerHTML = `성장`;
객체생성(가글메뉴들, "가글월드", "", "여백", "버튼");
가글월드.innerHTML = `월드`;
객체생성(가글메뉴들, "가글정보", "", "여백", "버튼");
가글정보.innerHTML = `정보`;

객체생성(document.body, "가글성장툴팁", "고정", "테두리", "세로정렬", "숨기기",);
가글성장툴팁.style.zIndex = "9999";
객체생성(가글성장툴팁, "가글무기", "버튼", "여백", "");
가글무기.innerHTML = `무기`;
객체생성(가글성장툴팁, "가글장신구", "버튼", "여백", "");
가글장신구.innerHTML = `장신구`;
객체생성(가글성장툴팁, "가글유물", "버튼", "여백", "");
가글유물.innerHTML = `유물`;

객체생성(document.body, "가글정보툴팁", "고정", "테두리", "세로정렬", "숨기기",);
가글정보툴팁.style.zIndex = "9999";
객체생성(가글정보툴팁, "가글계정삭제", "버튼", "여백", "");
가글계정삭제.innerHTML = `계정삭제`;
객체생성(가글정보툴팁, "가글로그아웃", "버튼", "여백", "");
가글로그아웃.innerHTML = `로그아웃`;
객체생성(가글정보툴팁, "가글메뉴얼", "버튼", "여백", "");
가글메뉴얼.innerHTML = `메뉴얼`;
객체생성(가글정보툴팁, "가글전당", "버튼", "여백", "");
가글전당.innerHTML = `전당`;
객체생성(가글정보툴팁, "가글우편함", "버튼", "여백", "");
가글우편함.innerHTML = `우편함`;
객체생성(가글정보툴팁, "가글일어난일", "버튼", "여백", "");
가글일어난일.innerHTML = `일어난일`;

객체생성(상단바박스, "삼국메뉴들", "", "", "숨기기");
객체생성(삼국메뉴들, "삼국전투", "", "여백", "버튼");
삼국전투.innerHTML = `전투`;
객체생성(삼국메뉴들, "삼국성장", "", "여백", "버튼");
삼국성장.innerHTML = `성장`;
객체생성(삼국메뉴들, "삼국월드", "", "여백", "버튼");
삼국월드.innerHTML = `월드`;
객체생성(삼국메뉴들, "삼국정보", "", "여백", "버튼");
삼국정보.innerHTML = `정보`;

객체생성(document.body, "가짜상단바", "", "가로꽉", "밑줄",);
가짜상단바.innerHTML = "　";
가짜상단바.style.height = "51px";

객체생성(document.body, "알림창", "여백", "", "");
알림창.style.color = 색상맵["중노"];

window.알림창타이머 = null;

//알림창표시함수
function 알림창표시(메시지) {
    // 이전 타이머 제거
    if (알림창타이머) {
        clearTimeout(알림창타이머);
        알림창타이머 = null;
    }

    // 메시지 표시
    알림창.innerHTML = 메시지;
    알림창.style.color = 색상맵["중노"];

    // 3초 후 공백으로 변경
    알림창타이머 = setTimeout(() => {
        알림창.innerText = "　";
        알림창타이머 = null;
    }, 3000);
}

객체생성(document.body, "화면차단기", "화면꽉",);
화면차단기.style.zIndex = "99999";
화면차단기.style.opacity = "0.5";
화면차단기.style.display = "none";

//화면잠금함수
function 화면잠금(메시지) {
    화면차단기.style.display = "flex";

    if (메시지) {
        알림창표시(메시지);
    }
}

function 화면해제() {
    화면차단기.style.display = "none";

}

알림창표시(`하이루`);

//팝업객체생성
객체생성(document.body, "팝업컨테이너", "테두리", "세로정렬", "화면중앙", "여백", "숨기기");
팝업컨테이너.style.zIndex = "999999";
객체생성(팝업컨테이너, "팝업내용", "왼쪽정렬", "여백", "가로꽉");
팝업내용.innerHTML = `팝업내용`;
객체생성(팝업컨테이너, "팝업확인취소컨테이너", "양쪽정렬", "가로꽉");
객체생성(팝업확인취소컨테이너, "팝업확인취소컨테이너왼쪽", "", "");
객체생성(팝업확인취소컨테이너, "팝업확인취소컨테이너오른쪽", "", "");
객체생성(팝업확인취소컨테이너오른쪽, "팝업취소", "버튼", "테두리", "여백");
팝업취소.innerHTML = `취소`;
객체생성(팝업확인취소컨테이너오른쪽, "팝업확인", "버튼", "테두리", "여백");
팝업확인.innerHTML = `확인`;

객체생성(document.body, "게임선택컨테이너", "사백", "테두리", "세로정렬", "내부여백");

객체생성(게임선택컨테이너, "게임선택설명", "가로꽉", "밑줄", "여백");
게임선택설명.innerHTML = `원하는 게임을 선택하세요`;

객체생성(게임선택컨테이너, "가글", "버튼", "테두리", "여백");
가글.innerHTML = `新가글`;

객체생성(게임선택컨테이너, "삼국맨", "버튼", "테두리", "여백");
삼국맨.innerHTML = `삼국맨`;

//팝업사용함수
function 팝업사용(메시지) {
    try {
        return new Promise(resolve => {
            팝업내용.innerHTML = 메시지;
            팝업컨테이너.style.display = "flex";

            // 이전 이벤트 제거
            팝업취소.onclick = null;
            팝업확인.onclick = null;

            // 취소 버튼 → false
            팝업취소.onclick = () => {
                팝업컨테이너.style.display = "none";
                resolve(false);
            };

            // 확인 버튼 → true
            팝업확인.onclick = () => {
                팝업컨테이너.style.display = "none";
                resolve(true);
            };
        });

    } catch (error) {
        console.log(error);
    } finally {

    }
}

//단축키설정
document.addEventListener("keydown", async function (e) {

    if (게임선택컨테이너.style.display === "flex") {
        switch (e.key) {
            case "1":
                가글.click();

                break;
            case "2":
                삼국맨.click();
                break;
        }
    }

    if (팝업컨테이너.style.display === "flex") {
        switch (e.key) {
            case "Enter":
                팝업확인.onclick();
                break;
            case " ":
                팝업확인.onclick();
                break;
        }
    }

});

window.유저 = null;

const 게임 = localStorage.getItem("lastGame");
const 저장유저 = localStorage.getItem("lastUser");

if (게임 && 저장유저) {
    const { 아이디, 비번 } = JSON.parse(저장유저);

    if (게임 === "가글") {

        setTimeout(() => {
            가글.click();   // 클릭해야 내부 함수들이 생성됨
        }, 50);

        setTimeout(() => {
            window.가글자동로그인 = 1;
            가글아이디입력.value = 아이디;
            가글비번입력.value = 비번;
            가글로그인.click();
        }, 100);
    } else if (게임 === "삼국맨") {

        setTimeout(() => {
            삼국맨.click();   // 클릭해야 내부 함수들이 생성됨
        }, 50);

        setTimeout(() => {
            아이디입력.value = 아이디;
            비번입력.value = 비번;
            로그인.click();
        }, 100);
    }

}


객체생성(document.body, "가글로그인컨테이너", "사백", "테두리", "세로정렬", "내부여백", "숨기기");

//가글로그인화면함수
async function 가글로그인화면() {
    try {
        화면잠금(`로그인화면으로 전환됩니다`);
        가글화면전환(가글로그인컨테이너);

        가글로그인컨테이너.innerHTML = ``;

        객체생성(가글로그인컨테이너, "가글로그인설명", "가로꽉", "밑줄", "여백");
        가글로그인설명.innerHTML = `아이디는 한글만 가능합니다`;

        인풋객체생성(가글로그인컨테이너, "가글아이디입력", "", "", "여백");
        가글아이디입력.type = "text";
        가글아이디입력.placeholder = "아이디 입력";

        인풋객체생성(가글로그인컨테이너, "가글비번입력", "", "", "여백");
        가글비번입력.type = "password";
        가글비번입력.placeholder = "비번 입력";

        객체생성(가글로그인컨테이너, "가글회원가입", "버튼", "테두리", "여백");
        가글회원가입.innerHTML = `회원가입`;
        객체생성(가글로그인컨테이너, "가글로그인", "버튼", "테두리", "여백");
        가글로그인.innerHTML = `로그인`;

        가글아이디입력.addEventListener("input", () => {
            const 원본 = 가글아이디입력.value;
            const 한글만 = 원본.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");

            if (원본 !== 한글만) {
                알림창표시("아이디는 한글만 가능합니다");
                가글아이디입력.value = 한글만;
            }
        });

        가글비번입력.addEventListener("keydown", (e) => {
            // 엔터키
            if (e.key === "Enter") {
                가글로그인.click();
            }

            // 스페이스바 (원하는 경우만)
            if (e.key === " ") {    // 또는 e.code === "Space"
                e.preventDefault(); // 스페이스 입력 막음
                가글로그인.click();
            }
        });

        //가글회원가입함수
        가글회원가입.onclick = async () => {
            try {
                화면잠금(`회원가입중입니다`);

                const id값 = 가글아이디입력.value.trim();
                const pw값 = 가글비번입력.value.trim();

                if (!id값 || !pw값) {
                    알림창표시("아이디/비밀번호를 입력해주세요");
                    return;
                }

                // 한글만 허용
                if (!/^[ㄱ-ㅎㅏ-ㅣ가-힣]+$/.test(id값)) {
                    알림창표시("아이디는 한글만 가능합니다");
                    return;
                }

                const 응답 = await fetch("/rkrmf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        액션: "가글회원가입",
                        액션데이터: { 아이디: id값, 비번: pw값, 서버: 1 }
                    })
                });

                const 결과 = await 응답.json();

                if (결과.성공) {
                    알림창표시("가글회원가입 완료!");


                } else {
                    알림창표시(결과.오류);
                }


            } catch (error) {
                console.log(error);
            } finally {
                화면해제();
            }
        };

        //가글로그인함수
        가글로그인.onclick = async () => {
            try {
                화면잠금(`로그인중입니다`);

                if (window.가글자동로그인) {
                    알림창표시(`자동로그인중입니다`);
                }


                const id값 = 가글아이디입력.value.trim();
                const pw값 = 가글비번입력.value.trim();

                if (!id값 || !pw값) {
                    알림창표시("아이디/비밀번호를 입력해주세요");
                    return;
                }

                // 한글만 허용
                if (!/^[ㄱ-ㅎㅏ-ㅣ가-힣]+$/.test(id값)) {
                    알림창표시("아이디는 한글만 가능합니다");
                    return;
                }

                const 응답 = await fetch("/rkrmf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        액션: "가글로그인",
                        액션데이터: { 아이디: id값, 비번: pw값, 서버: 1 }
                    })
                });

                const 결과 = await 응답.json();

                if (결과.성공) {
                    알림창표시("가글에 로그인되었습니다");

                    유저 = 결과.가글;

                    localStorage.setItem("lastGame", "가글");
                    localStorage.setItem("lastUser", JSON.stringify({ 아이디: id값, 비번: pw값 }));

                    가글메뉴얼화면();

                    가글메뉴들.style.display = `flex`;

                    function 가글메뉴툴팁설정(버튼, 툴팁) {

                        // 보여주기
                        function show() {
                            툴팁.style.display = "flex";

                            const rect = 버튼.getBoundingClientRect();
                            const tip = 툴팁.getBoundingClientRect();

                            툴팁.style.left = (rect.right - tip.width) + "px";
                            툴팁.style.top = (rect.bottom - 0) + "px";
                        }

                        // 숨기기
                        function hide() {
                            툴팁.style.display = "none";
                        }

                        // 버튼 위로 가면 열림
                        버튼.addEventListener("mouseenter", () => {
                            if (window.가글터치모드) return;
                            show();
                        });

                        // 버튼에서 나갈 때
                        버튼.addEventListener("mouseleave", (e) => {
                            if (window.가글터치모드) return;
                            if (!툴팁.contains(e.relatedTarget)) hide();
                        });

                        // 툴팁에서 나갈 때
                        툴팁.addEventListener("mouseleave", (e) => {
                            if (window.가글터치모드) return;
                            if (!버튼.contains(e.relatedTarget)) hide();
                        });
                    }

                    가글메뉴툴팁설정(가글정보, 가글정보툴팁);
                    가글메뉴툴팁설정(가글성장, 가글성장툴팁);

                    게임이름.innerHTML = 유저.스탯.닉네임;

                    if (유저.스탯.차단) {
                        화면차단기.style.display = `flex`;
                        화면차단기.style.opacity = "1";
                        화면차단기.innerHTML = `차단되었습니다`;
                    }

                    if (유저.스탯.점검) {
                        화면차단기.style.display = `flex`;
                        화면차단기.style.opacity = "1";
                        화면차단기.innerHTML = `점검중 >.<`;
                    }


                } else {
                    알림창표시(결과.오류);
                }


            } catch (error) {
                console.log(error);
            } finally {
                화면해제();
            }
        };

    } catch (error) {
        console.log(error);

    } finally {
        화면해제();

    }
}


객체생성(document.body, "가글메뉴얼컨테이너", "사백", "테두리", "세로정렬", "내부여백", "숨기기");

//가글메뉴얼화면함수
async function 가글메뉴얼화면() {
    try {
        화면잠금(`메뉴얼화면에는 패치노트가 작성되어있습니다`);
        가글화면전환(가글메뉴얼컨테이너);

        가글메뉴얼컨테이너.innerHTML = ``;

        객체생성(가글메뉴얼컨테이너, "가글메뉴얼설명", "가로꽉", "밑줄", "여백");
        가글메뉴얼설명.innerHTML = `v0.0.1`;

        객체생성(가글메뉴얼컨테이너, "가글메뉴얼들", "", "", "여백");
        가글메뉴얼들.innerHTML =
            `
        <br>
        25.12.10<br>
        코드리셋. 처음부터 다시시작<br>
        
        <br>
        25.12.08<br>
        우편함 구현<br>

        <br>
        25.12.07<br>
        개발시작<br>
        <br>
        `;

    } catch (error) {
        console.log(error);
    } finally {
        화면해제();
    }
}



//가글함수
가글.onclick = async () => {
    try {
        가글로그인화면();
        게임이름.innerHTML = `가글`;
    } catch (error) {
        console.log(error);
    } finally {
    }
};

//가글로그아웃함수
가글로그아웃.onclick = async () => {
    try {
        화면잠금(`로그아웃중입니다`);
        localStorage.removeItem("lastGame");
        localStorage.removeItem("lastUser");
        location.reload();

    } catch (error) {
        console.log(error);
    } finally {
        화면해제();
    }
};

//가글계정삭제함수
가글계정삭제.onclick = async () => {
    try {
        화면잠금(`다시 만나길 고대하겠습니다`);

        const 확인 = await 팝업사용(`삭제된 계정은 복구가 불가능합니다<br>그래도 삭제하시겠습니까?`);
        if (!확인) return;

        if (window.가글자동가글계정삭제) {
            알림창표시(`자동가글계정삭제중입니다`);
        }

        const 응답 = await fetch("/rkrmf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                액션: "계정삭제",
                액션데이터: { 유저id: window.유저.id }
            })
        });

        const 결과 = await 응답.json();

        if (결과.성공) {
            localStorage.removeItem("lastGame");
            localStorage.removeItem("lastUser");
            location.reload();
        } else {
            알림창표시(결과.오류);
        }

    } catch (error) {
        console.log(error);
    } finally {
        화면해제();
    }
};










//가글화면전환함수
function 가글화면전환(화면이름) {
    const 화면들 = [
        게임선택컨테이너,
        가글로그인컨테이너,
        가글메뉴얼컨테이너,

    ];

    for (let el of 화면들) {
        el.style.display = "none";
    }

    화면이름.style.display = "flex";
}




// 객체생성(document.body, "가글새로운컨테이너", "사백", "테두리", "세로정렬", "내부여백");

// //가글새로운화면함수
// async function 가글새로운화면() {
//     try {
//         화면잠금();
//         가글화면전환(가글새로운컨테이너);

//         가글새로운컨테이너.innerHTML = ``;

//         객체생성(가글새로운컨테이너, "가글새로운설명", "가로꽉", "밑줄", "여백");
//         가글새로운설명.innerHTML = `아이디는 한글만 가능합니다`;

//         가글새로운.onclick = async () => {
//             try {
//                 화면잠금();

//                 if (window.가글자동가글새로운) {
//                     알림창표시(`자동가글새로운중입니다`);
//                 }

//                 const 응답 = await fetch("/rkrmf", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({
//                         액션: "가글새로운",
//                         액션데이터: { 아이디: id값, 비번: pw값, 서버: 1 }
//                     })
//                 });

//                 const 결과 = await 응답.json();

//                 if (결과.성공) {
//                     알림창표시("가글새로운되었습니다");

//                     유저 = { 스탯: 결과.스탯, 서브스탯: 결과.서브스탯 };

//                     메뉴얼화면보여주기();
//                 } else {
//                     알림창표시(결과.오류);
//                 }

//             } catch (error) {
//                 console.log(error);
//             } finally {
//                 화면해제();
//             }
//         };


//     } catch (error) {
//         console.log(error);
//     } finally {
//         화면해제();
//     }
// }

//삼국맨함수
삼국맨.onclick = async () => {
    알림창표시(`개발중입니다. 돌아가세요`);

};

