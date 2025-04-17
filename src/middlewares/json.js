export async function json(req, res) {
  const contentType = req.headers["content-type"];

  if (contentType !== "application/json") {
    req.body = {};
    return;
  }

  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const bodyString = Buffer.concat(buffers).toString();

  if (bodyString) {
    try {
      req.body = JSON.parse(bodyString); // Tenta parsear o JSON
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  } else {
    req.body = {}; // Define um objeto vazio se nenhum corpo foi enviado
  }

  res.setHeader("Content-Type", "application/json");
}
