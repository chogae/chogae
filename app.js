// 25.12.02 개발시작

/*

해야할일

Ctrl + Shift + P
Developer: Inspect Editor Tokens and Scopes

git add . && git commit -m "배포" && git push origin main

nodemon server.js

npm run dev

dev = development(개발)

*/


const 색상맵 = {
    // 빨강 (Red)
    연빨: "#FFB3B3",
    중빨: "#FF6B6B",
    진빨: "#C53030",

    // 주황 (Orange)
    연주: "#FFD1A6",
    중주: "#FF8F3F",
    진주: "#C45A14",

    // 노랑 (Yellow)
    연노: "#FFF5A5",
    중노: "#FFD700",
    진노: "#D4B000",

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
};

document.querySelectorAll("[id]").forEach(el => window[el.id] = el);

const 상단바높이 = 상단바.getBoundingClientRect().height;
알림창.style.top = 상단바높이 + 6 + "px";
const 알림창높이 = 알림창.getBoundingClientRect().height;

//화면초기화함수
function 화면초기화(화면이름) {
    const 화면들 = [
        로그인화면,
        전투화면,
        성장화면,
        월드화면,
        정보화면,
        정보툴팁,
        메뉴얼화면,
        상단바메뉴,
    ];

    for (let el of 화면들) {
        el.style.display = "none";
    }

    화면이름.style.display = "flex";
    화면이름.style.top = 상단바높이 + 알림창높이 + 12 + "px";
    // 화면이름.style.height = "1000px";
}

let 메시지타이머 = null;

//메시지표시함수
function 메시지표시(메시지) {
    // 이전 타이머 제거
    if (메시지타이머) {
        clearTimeout(메시지타이머);
        메시지타이머 = null;
    }

    // 메시지 표시
    알림창.innerHTML = 메시지;
    알림창.style.color = 색상맵["중노"];

    // 3초 후 공백으로 변경
    메시지타이머 = setTimeout(() => {
        알림창.innerText = "　";
        메시지타이머 = null;
    }, 3000);
}

//게임실행함수
window.addEventListener("load", () => {
    메시지표시(`초개에 오신걸 환영합니다`);
    메시지표시(`환영합니다`);
    로그인화면보여주기();
});

// 회원가입함수
document.getElementById("회원가입").onclick = async () => {
    try {
        const id값 = 아이디입력.value.trim();
        const pw값 = 비번입력.value.trim();

        if (!id값 || !pw값) {
            메시지표시("아이디/비밀번호를 입력해주세요");
            return;
        }

        // 영문만 허용
        if (!/^[a-zA-Z]+$/.test(id값)) {
            메시지표시("아이디는 영문만 가능합니다");
            return;
        }

        const 응답 = await fetch("/gksqjsdp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                액션: "회원가입",
                액션데이터: { 아이디: id값, 비번: pw값, 서버: 1 }
            })
        });

        const 결과 = await 응답.json();

        if (결과.성공) {
            메시지표시("회원가입 완료!");
        } else {
            메시지표시(결과.오류 || "오류가 발생했습니다");
        }

    } catch (e) {
        메시지표시("네트워크 오류 발생");
    } finally {

    }
};

아이디입력.addEventListener("input", () => {
    const 원본 = 아이디입력.value;
    const 영문만 = 원본.replace(/[^a-zA-Z]/g, "");

    if (원본 !== 영문만) {
        메시지표시("아이디는 영문만 가능합니다");
        아이디입력.value = 영문만;
    }
});

// 로그인함수
document.getElementById("로그인").onclick = async () => {
    try {
        const id값 = 아이디입력.value.trim();
        const pw값 = 비번입력.value.trim();

        if (!id값 || !pw값) {
            메시지표시("아이디/비밀번호를 입력해주세요");
            return;
        }

        // 영문만 허용
        if (!/^[a-zA-Z]+$/.test(id값)) {
            메시지표시("아이디는 영문만 가능합니다");
            return;
        }

        const 응답 = await fetch("/gksqjsdp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                액션: "로그인",
                액션데이터: { 아이디: id값, 비번: pw값, 서버: 1 }
            })
        });

        const 결과 = await 응답.json();

        if (결과.성공) {
            메시지표시("로그인되었습니다");

            메뉴얼화면보여주기();
        } else {
            메시지표시(결과.오류 || "오류가 발생했습니다");
        }

    } catch (e) {
        메시지표시("네트워크 오류 발생");
    } finally {

    }
};

//로그인화면보여주기함수
async function 로그인화면보여주기() {
    화면초기화(로그인화면);
    로그인화면설명.innerHTML = `아이디는 영문만 가능합니다<br>비밀번호는 분실 시 복구가 불가합니다`;

}

//메뉴얼화면보여주기함수
async function 메뉴얼화면보여주기() {
    화면초기화(메뉴얼화면);
    메뉴얼화면.innerHTML = `v0.0.1`;
    상단바메뉴.style.display = "flex";
}
