import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";  // 🔥 여기 추가
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

/* --------------------------------------
   🔥 서버에서만 Supabase 관리자 클라이언트 생성
--------------------------------------- */
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* --------------------------------------
   🔥 예시 API (유저 조회)
--------------------------------------- */
app.post("/get-user", async (req, res) => {
    const { uid } = req.body;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();

    if (error) {
        return res.json({ 오류: error.message });
    }

    res.json({ data });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
