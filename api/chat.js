export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.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,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
