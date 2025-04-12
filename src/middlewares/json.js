export async function json(req, res) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const bodyString = Buffer.concat(buffers).toString();

  if (bodyString) {
    req.body = JSON.parse(bodyString); // Tenta parsear o JSON
  } else {
    req.body = {}; // Define um objeto vazio se nenhum corpo foi enviado
  }

  res.setHeader("Content-Type", "application/json");
}
