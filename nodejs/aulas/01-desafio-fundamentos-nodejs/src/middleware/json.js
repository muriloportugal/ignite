export async function json(req,res){
  const buffers = [];

  for await(const chunk of req){
    buffers.push(chunk);
  }

  try {
    const payload = Buffer.concat(buffers).toString();
    req.body = JSON.parse(payload);
  } catch (error) {
    req.body = null;
  }

  res.setHeader('Content-type','application/json');
}