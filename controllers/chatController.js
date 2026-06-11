const handleMessage = async (req, res) => {
    const { session_id, message, memory_buffer, filters } = req.body;

    try {
        const aiResponse = await fetch("http://172.16.40.6:8001/ai/chat/stream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/event-stream"
            },
            body: JSON.stringify({
                session_id,
                message,
                memory_buffer: memory_buffer || [],
                filters: filters || {}
            })
        });

        if (!aiResponse.ok) {
            throw new Error(`API AI merespons dengan status: ${aiResponse.status}`);
        }
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('cache-control', 'no-cache');
        res.setHeader('connection', 'keep-alive');

        for await (const chunk of aiResponse.body) {
            res.write(chunk);
        }

        res.end();

    } catch (error) {
        console.error("Error pada chatController: ", error);
        res.write(`data: {"text": "[ERROR] Gagal terhubung ke AI Engine"}\n\n`);
        res.end();
    }
};

module.exports = {
    handleMessage
};